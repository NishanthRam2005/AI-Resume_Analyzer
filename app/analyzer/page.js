"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Star, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnalysisResults from "@/components/analysis-results"
import ResumeManager from "@/components/ResumeManager"

export default function AnalyzerPage() {
  const [file, setFile] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState("")

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setFile(selectedFile)
      setError("")
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsAnalyzing(true)
    setError("")

    const formData = new FormData()
    formData.append("resume", file)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze resume")
      }

      const result = await response.json()
      setAnalysis(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = () => {
    if (!analysis) return

    const blob = new Blob([JSON.stringify(analysis, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resume-analysis.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page-container">
      <div className="nav-container">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">ResumeAI</h1>
            <Link href="/" className="text-violet-600 hover:text-violet-700">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <main>
        <div className="main-container">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-semibold mb-4">Upload Your Resume</h2>
              <div className="space-y-4">
                <input
                  type="file"
                  className="glass-input w-full p-2"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <button
                  className="button-primary w-full"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                </button>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>

            {analysis && (
              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Analysis Results</h2>
                  <button
                    className="button-secondary"
                    onClick={handleExport}
                  >
                    Export Report
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-4">
                    <h3 className="text-lg font-medium mb-3">Overall Score</h3>
                    <div className="text-4xl font-bold text-violet-600">
                      {analysis.score}/100
                    </div>
                  </div>

                  <div className="glass-card p-4">
                    <h3 className="text-lg font-medium mb-3">Keywords Found</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.present.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-4">
                    <h3 className="text-lg font-medium mb-3">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.missing.map((keyword) => (
                        <span
                          key={keyword}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-4">
                    <h3 className="text-lg font-medium mb-3">Strengths</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="text-green-700">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card p-4">
                    <h3 className="text-lg font-medium mb-3">Weaknesses</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-red-700">
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card p-4">
                    <h3 className="text-lg font-medium mb-3">Suggestions</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-blue-700">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Export Button */}
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(analysis, null, 2)], {
                          type: "application/json",
                        })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = "resume-analysis.json"
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors duration-300"
                    >
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            )}
            <ResumeManager
              onLoad={fileObj => {
                setFile(fileObj)
                setAnalysis(null)
                setError("")
              }}
              onPreview={fileObj => {
                // You can implement preview modal logic here if needed
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
