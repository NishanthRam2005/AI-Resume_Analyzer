# This would be your Python backend file
import json
from flask import Flask, request, jsonify
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re
import PyPDF2
import io

app = Flask(__name__)

# Download necessary NLTK data
nltk.download('punkt')
nltk.download('stopwords')

@app.route('/api/analyze-resume', methods=['POST'])
def analyze_resume():
    data = request.json
    resume_text = data.get('resumeText', '')
    is_pdf = data.get('isPdf', False)
    
    # Extract text from PDF if needed
    if is_pdf and resume_text.startswith('%PDF'):
        try:
            # This is a simplified example - in production you'd need more robust PDF parsing
            pdf_file = io.BytesIO(resume_text.encode('utf-8'))
            pdf_reader = PyPDF2.PdfFileReader(pdf_file)
            resume_text = ""
            for page_num in range(pdf_reader.numPages):
                resume_text += pdf_reader.getPage(page_num).extractText()
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
    
    # Process the resume text
    analysis_result = analyze_resume_content(resume_text)
    
    return jsonify(analysis_result)

def analyze_resume_content(text):
    """Analyze resume content and return structured feedback"""
    # Clean and tokenize the text
    text = text.lower()
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [w for w in tokens if w.isalnum() and w not in stop_words]
    
    # Count word frequencies
    word_freq = {}
    for word in filtered_tokens:
        if word in word_freq:
            word_freq[word] += 1
        else:
            word_freq[word] = 1
    
    # Extract skills (this would be more sophisticated in a real implementation)
    common_skills = ["python", "javascript", "java", "c++", "sql", "react", "node", "aws", "docker", 
                     "kubernetes", "machine learning", "data analysis", "leadership", "communication"]
    found_skills = [skill for skill in common_skills if skill in text.lower()]
    missing_skills = [skill for skill in common_skills if skill not in text.lower()]
    
    # Calculate a score (simplified)
    score = min(100, 50 + len(found_skills) * 5)
    
    # Generate strengths
    strengths = []
    if len(text) > 1000:
        strengths.append("Comprehensive resume with detailed information")
    if any(word in text.lower() for word in ["achieved", "accomplished", "improved", "increased", "decreased"]):
        strengths.append("Includes achievement-oriented language")
    if any(word in text.lower() for word in ["led", "managed", "supervised", "directed"]):
        strengths.append("Demonstrates leadership experience")
    if len(found_skills) >= 3:
        strengths.append("Good range of technical skills")
    if "education" in text.lower() and any(word in text.lower() for word in ["degree", "university", "college", "bachelor", "master"]):
        strengths.append("Clear education credentials")
    
    # Generate weaknesses
    weaknesses = []
    if len(text) < 500:
        weaknesses.append("Resume is too short, consider adding more details")
    if not any(word in text.lower() for word in ["summary", "objective", "profile"]):
        weaknesses.append("Missing a professional summary or objective")
    if not any(word in text.lower() for word in ["achieved", "accomplished", "improved", "increased", "decreased"]):
        weaknesses.append("Lacks achievement-oriented language")
    if len(missing_skills) > len(common_skills) / 2:
        weaknesses.append("Limited range of skills mentioned")
    
    # Generate suggestions
    suggestions = [
        "Add a concise professional summary highlighting your unique value proposition",
        "Quantify achievements with specific metrics (e.g., 'Increased efficiency by 30%')",
        "Tailor your skills section to match job description keywords",
        "Include relevant certifications and professional development",
        "Use action verbs to start bullet points in your experience section",
        "Ensure consistent formatting throughout your resume"
    ]
    
    # Ensure we have enough items in each category
    while len(strengths) < 4:
        strengths.append("Well-structured resume format")
    
    while len(weaknesses) < 4:
        weaknesses.append("Work experience descriptions could be more specific")
    
    return {
        "score": score,
        "strengths": strengths[:5],
        "weaknesses": weaknesses[:5],
        "suggestions": suggestions,
        "keywords": {
            "present": found_skills,
            "missing": missing_skills[:5]
        }
    }

if __name__ == '__main__':
    app.run(debug=True)
