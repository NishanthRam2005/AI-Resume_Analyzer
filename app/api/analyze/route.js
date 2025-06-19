import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume')

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      )
    }

    // Get file content as text based on file type
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let text = ''

    try {
      if (file.type === 'application/pdf') {
        const pdfData = await pdfParse(buffer)
        text = pdfData.text
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                file.type === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer })
        text = result.value
      } else {
        // Assume it's plain text
        text = buffer.toString('utf-8')
      }
    } catch (parseError) {
      console.error('File parsing error:', parseError)
      return NextResponse.json(
        { error: 'Could not parse the file content' },
        { status: 400 }
      )
    }
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from the file' },
        { status: 400 }
      )
    }
    
    console.log('File content length:', text.length)

    // Prepare the prompt for GPT
    const prompt = `Analyze this resume and provide detailed feedback in JSON format. Include:
    1. A score out of 100
    2. Key strengths (5 points)
    3. Areas for improvement (5 points)
    4. Specific suggestions (6 points)
    5. Present keywords/skills found in the resume
    6. Important missing keywords/skills

Resume text:
${text}

Provide the analysis in the following JSON format:
{
    "score": <score>,
    "strengths": [<list of strengths>],
    "weaknesses": [<list of weaknesses>],
    "suggestions": [<list of suggestions>],
    "keywords": {
        "present": [<list of found keywords>],
        "missing": [<list of missing keywords>]
    }
}`

    // Generate mock analysis based on text length and content
    const keywords = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const uniqueKeywords = [...new Set(keywords)];
    
    // Generate mock analysis
    const analysis = {
      score: Math.floor(Math.random() * 20) + 70, // Random score between 70-90
      strengths: [
        "Strong professional experience section",
        "Clear and concise writing style",
        "Good use of action verbs",
        "Relevant technical skills highlighted",
        "Well-structured format"
      ],
      weaknesses: [
        "Could include more quantifiable achievements",
        "Summary section could be more impactful",
        "Limited demonstration of soft skills",
        "Could improve keyword optimization",
        "Some sections could be more detailed"
      ],
      suggestions: [
        "Add specific metrics and achievements to demonstrate impact",
        "Enhance the professional summary to grab attention",
        "Include more industry-specific keywords",
        "Add a section for soft skills and leadership abilities",
        "Expand on project descriptions",
        "Consider adding certifications or professional development"
      ],
      keywords: {
        present: uniqueKeywords.slice(0, 10),
        missing: [
          "leadership",
          "collaboration",
          "problem-solving",
          "innovation",
          "strategic thinking",
          "project management",
          "communication",
          "analytical",
          "teamwork",
          "results-driven"
        ]
      }
    }
    return NextResponse.json(analysis)

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
