from flask import Flask, request, render_template, redirect, url_for
import cohere
import os
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import fitz  # PyMuPDF for PDF
from docx import Document  # For DOCX

# Load API key from .env file
load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'txt', 'pdf', 'docx'}

# Initialize Cohere client
cohere_api_key = os.getenv("COHERE_API_KEY")
co = cohere.Client(cohere_api_key) if cohere_api_key else None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def extract_text_from_file(filepath):
    try:
        ext = filepath.rsplit('.', 1)[1].lower()
        if ext == 'pdf':
            doc = fitz.open(filepath)
            return "\n".join(page.get_text() for page in doc)
        elif ext == 'docx':
            doc = Document(filepath)
            return "\n".join([p.text for p in doc.paragraphs])
        elif ext == 'txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            return "Unsupported file format."
    except Exception as e:
        return f"Error extracting text: {e}"

@app.route('/')
def home():
    return render_template('index.html', summary='', music_toggle=True)

@app.route('/summarize', methods=['POST'])
def summarize():
    input_text = request.form.get('inputText', '').strip()
    tone = request.form.get('tone', 'neutral')
    length = request.form.get('length', 'short')
    audience = request.form.get('audience', 'general')
    format_style = request.form.get('format', 'paragraph')

    if not input_text:
        return render_template('index.html', summary="Please enter some text to summarize.", music_toggle=True)

    if not co:
        return render_template('index.html', summary="Error: Cohere API key not found. Please check your .env file.", music_toggle=True)

    try:
        prompt = (
            f"You are a summarization assistant. Your task is to summarize a given text "
            f"with the following conditions:\n"
            f"- Tone: {tone}\n"
            f"- Audience: {audience}\n"
            f"- Format: {format_style}\n"
            f"- Length: {length}\n\n"
            f"Text:\n\"\"\"\n{input_text}\n\"\"\"\n\n"
            f"Now provide the summary based on these conditions:"
        )

        response = co.generate(
            model='command',
            prompt=prompt,
            max_tokens=150,
            temperature=0.7,
        )

        summary = response.generations[0].text.strip()

    except Exception as e:
        summary = f"Error generating summary: {e}"

    return render_template('index.html', summary=summary, music_toggle=True)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        if 'document' not in request.files:
            return render_template('index.html', summary="No file part in request.", music_toggle=True)

        file = request.files['document']

        if file.filename == '':
            return render_template('index.html', summary="No selected file.", music_toggle=True)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            file.save(filepath)

            extracted_text = extract_text_from_file(filepath)
            if extracted_text.startswith("Error"):
                return render_template('index.html', summary=extracted_text, music_toggle=True)

            return render_template('index.html', input_text=extracted_text, summary="", music_toggle=True)

        else:
            return render_template('index.html', summary="Invalid file type.", music_toggle=True)

    return redirect(url_for('home'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        experience = request.form.get('experience')
        discovery = request.form.get('discovery')
        rating = request.form.get('rating')
        suggestions = request.form.get('suggestions')

        # For now, just print or store feedback
        print(f"[Feedback] Name: {name} | Email: {email} | Experience: {experience} | Source: {discovery} | Rating: {rating} | Suggestions: {suggestions}")

        return render_template('feedback.html', success_message="Thanks for your feedback! 🌟")

    return render_template('feedback.html')

if __name__ == '__main__':
    app.run(debug=True)
