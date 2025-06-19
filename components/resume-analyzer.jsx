"use client"

import { useState } from "react"
import { FileUploader } from "./file-uploader"
import { ResumePreview } from "./resume-preview"
import { AnalysisResults } from "./analysis-results"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { analyzeResume } from "@/lib/analyze-resume"

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile)
    setResumeText("Resume uploaded: " + uploadedFile.name)
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No resume uploaded",
        description: "Please upload a resume file first",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Create FormData and append file
      const formData = new FormData()
      formData.append('resume', file)

      // Call the analyze function
      const results = await analyzeResume(formData)
      setAnalysis(results)
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setFile(null)
    setResumeText("")
    setAnalysis(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-violet-100">
      <div className="p-6 md:p-8">
        {!analysis ? (
          <>
            <div className="mb-8">
              <FileUploader onFileUpload={handleFileUpload} currentFile={file} />
            </div>

            {resumeText && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-slate-800">Resume Preview</h2>
                <ResumePreview text={resumeText} file={file} />
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={!resumeText || isAnalyzing}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <AnalysisResults analysis={analysis} />
            <div className="flex justify-center mt-8">
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="border-violet-300 text-violet-600 hover:bg-violet-50 px-6"
              >
                Analyze Another Resume
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
