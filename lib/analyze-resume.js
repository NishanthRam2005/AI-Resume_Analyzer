// Resume analysis function that sends file to Python backend
export async function analyzeResume(formData) {
  try {
    // Send the file to our Python backend
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error analyzing resume:", error)
    throw new Error("Failed to analyze resume")
  }
}

function mockAnalysisData(isPdf) {
  return {
    score: isPdf ? 68 : 72,
    strengths: [
      "Well-structured resume format",
      "Clear contact information section",
      isPdf
        ? "PDF format is professional and widely accepted"
        : "Strong technical skills with relevant programming languages",
      "Good education credentials",
      "Appropriate resume length",
    ],
    weaknesses: [
      "Resume lacks a compelling professional summary",
      isPdf ? "PDF format requires special parsing for optimal analysis" : "Skills section could be more comprehensive",
      "Work experience descriptions could be more specific",
      "Missing metrics and quantifiable achievements",
      "Limited demonstration of soft skills",
    ],
    suggestions: [
      "Add a concise professional summary highlighting your unique value proposition",
      "Quantify achievements with specific metrics (e.g., 'Increased efficiency by 30%')",
      "Tailor your skills section to match the job description keywords",
      "Include relevant certifications and professional development",
      isPdf
        ? "Consider using a text format for better parsing by ATS systems"
        : "Add links to your portfolio or GitHub to showcase your work",
      "Incorporate industry-specific keywords throughout your resume",
    ],
    keywords: {
      present: ["Resume", "Education", "Experience", isPdf ? "PDF" : "JavaScript", "Skills"],
      missing: ["Leadership", "Teamwork", "Project Management", "Results-Oriented", "Problem-Solving"],
    },
  }
}
