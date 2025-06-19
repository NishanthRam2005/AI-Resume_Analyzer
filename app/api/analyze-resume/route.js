import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { resumeText, isPdf } = await request.json()

    // Mock data for demonstration
    const isPdfBinary = resumeText.startsWith("%PDF") || resumeText.includes("endobj") || resumeText.includes("stream")
    const isPdfType = isPdf === true
    const isPdfFile = isPdfBinary || isPdfType

    // In a real application, you would call a Python script or API here
    // For now, we'll return mock data
    const result = {
      score: isPdfFile ? 68 : 72,
      strengths: [
        "Well-structured resume format",
        "Clear contact information section",
        isPdfFile
          ? "PDF format is professional and widely accepted"
          : "Strong technical skills with relevant programming languages",
        "Good education credentials",
        "Appropriate resume length",
      ],
      weaknesses: [
        "Resume lacks a compelling professional summary",
        isPdfFile
          ? "PDF format requires special parsing for optimal analysis"
          : "Skills section could be more comprehensive",
        "Work experience descriptions could be more specific",
        "Missing metrics and quantifiable achievements",
        "Limited demonstration of soft skills",
      ],
      suggestions: [
        "Add a concise professional summary highlighting your unique value proposition",
        "Quantify achievements with specific metrics (e.g., 'Increased efficiency by 30%')",
        "Tailor your skills section to match the job description keywords",
        "Include relevant certifications and professional development",
        isPdfFile
          ? "Consider using a text format for better parsing by ATS systems"
          : "Add links to your portfolio or GitHub to showcase your work",
        "Incorporate industry-specific keywords throughout your resume",
      ],
      keywords: {
        present: ["Resume", "Education", "Experience", isPdfFile ? "PDF" : "JavaScript", "Skills"],
        missing: ["Leadership", "Teamwork", "Project Management", "Results-Oriented", "Problem-Solving"],
      },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing resume:", error)
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 })
  }
}
