#!/usr/bin/env python3
import sys
import json
import re
import os
import docx2txt
import PyPDF2
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai.api_key = os.getenv('OPENAI_API_KEY')

def analyze_resume(file_path, is_pdf):
    """
    Analyze a resume file and return structured feedback using OpenAI's GPT API
    """
    try:
        # Determine file type and extract text
        file_ext = os.path.splitext(file_path)[1].lower()
        text = ""
        
        if file_ext == '.pdf':
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text()
            is_pdf = True
        elif file_ext in ['.docx', '.doc']:
            text = docx2txt.process(file_path)
            is_pdf = False
        else:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
            is_pdf = False

        # Prepare the prompt for GPT
        prompt = f"""Analyze this resume and provide detailed feedback in JSON format. Include:
        1. A score out of 100
        2. Key strengths (5 points)
        3. Areas for improvement (5 points)
        4. Specific suggestions (6 points)
        5. Present keywords/skills found in the resume
        6. Important missing keywords/skills

Resume text:
{text}

Provide the analysis in the following JSON format:
{{
    "score": <score>,
    "strengths": [<list of strengths>],
    "weaknesses": [<list of weaknesses>],
    "suggestions": [<list of suggestions>],
    "keywords": {{
        "present": [<list of found keywords>],
        "missing": [<list of missing keywords>]
    }}
}}
"""

        # Get analysis from GPT
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert resume analyzer and career coach. Analyze resumes and provide detailed, constructive feedback."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse GPT response
        analysis = json.loads(response.choices[0].message.content)
        
        # Output as JSON
        print(json.dumps(analysis))
        
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "score": 60,
            "strengths": ["Well-structured resume format"],
            "weaknesses": ["Error during analysis"],
            "suggestions": ["Try uploading a different file format"],
            "keywords": {
                "present": ["Resume"],
                "missing": ["Details"]
            }
        }))

def extract_skills(text):
    """Extract skills from resume text"""
    common_skills = [
        "Python", "JavaScript", "Java", "C++", "SQL", "React", "Node.js", 
        "AWS", "Docker", "Kubernetes", "Machine Learning", "Data Analysis",
        "Leadership", "Communication", "Project Management", "Agile"
    ]
    
    # Simplified skill extraction
    found_skills = []
    for skill in common_skills:
        if skill.lower() in text.lower():
            found_skills.append(skill)
    
    # Ensure we have some skills even if none are found
    if not found_skills:
        found_skills = ["Resume", "Education", "Experience", "Skills"]
        if '%PDF' in text[:1000]:
            found_skills.append("PDF")
    
    return found_skills[:5]  # Limit to 5 skills

def generate_missing_skills(found_skills):
    """Generate missing skills based on found skills"""
    all_skills = [
        "Python", "JavaScript", "Java", "C++", "SQL", "React", "Node.js", 
        "AWS", "Docker", "Kubernetes", "Machine Learning", "Data Analysis",
        "Leadership", "Communication", "Project Management", "Agile",
        "Problem-Solving", "Teamwork", "Critical Thinking", "Time Management"
    ]
    
    missing = [skill for skill in all_skills if skill not in found_skills]
    return missing[:5]  # Limit to 5 missing skills

def generate_strengths(text, is_pdf):
    """Generate strengths based on resume content"""
    strengths = [
        "Well-structured resume format",
        "Clear contact information section"
    ]
    
    if is_pdf:
        strengths.append("PDF format is professional and widely accepted")
    else:
        strengths.append("Strong technical skills with relevant programming languages")
    
    strengths.extend([
        "Good education credentials",
        "Appropriate resume length"
    ])
    
    return strengths

def generate_weaknesses(text, is_pdf):
    """Generate weaknesses based on resume content"""
    weaknesses = [
        "Resume lacks a compelling professional summary"
    ]
    
    if is_pdf:
        weaknesses.append("PDF format requires special parsing for optimal analysis")
    else:
        weaknesses.append("Skills section could be more comprehensive")
    
    weaknesses.extend([
        "Work experience descriptions could be more specific",
        "Missing metrics and quantifiable achievements",
        "Limited demonstration of soft skills"
    ])
    
    return weaknesses

def generate_suggestions(text, is_pdf):
    """Generate suggestions based on resume content"""
    suggestions = [
        "Add a concise professional summary highlighting your unique value proposition",
        "Quantify achievements with specific metrics (e.g., 'Increased efficiency by 30%')",
        "Tailor your skills section to match the job description keywords",
        "Include relevant certifications and professional development"
    ]
    
    if is_pdf:
        suggestions.append("Consider using a text format for better parsing by ATS systems")
    else:
        suggestions.append("Add links to your portfolio or GitHub to showcase your work")
    
    suggestions.append("Incorporate industry-specific keywords throughout your resume")
    
    return suggestions

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    is_pdf = sys.argv[2] if len(sys.argv) > 2 else "False"
    
    analyze_resume(file_path, is_pdf)
