"use client"

import { useState, useRef } from "react"
import { Upload, File, X, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FileUploader({ onFileUpload, currentFile }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0])
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileUpload(new File([""], ""))
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">Upload Your Resume</h2>

      {!currentFile?.name ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging ? "border-violet-500 bg-violet-50" : "border-slate-300 hover:border-violet-300 hover:bg-slate-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <Upload className="h-12 w-12 text-slate-400" />
            <div>
              <p className="text-lg font-medium text-slate-700">Drag and drop your resume file here</p>
              <p className="text-sm text-slate-500 mt-1">PDF files are recommended for best results</p>
            </div>
            <div className="mt-2">
              <Button
                onClick={handleButtonClick}
                variant="outline"
                className="border-violet-300 text-violet-600 hover:bg-violet-50"
              >
                Browse Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx"
                className="hidden"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-violet-100 p-2 rounded-lg">
                {currentFile.name.toLowerCase().endsWith(".pdf") ? (
                  <FileIcon className="h-6 w-6 text-violet-600" />
                ) : (
                  <File className="h-6 w-6 text-violet-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-800">{currentFile.name}</p>
                <p className="text-sm text-slate-500">{(currentFile.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="text-slate-500 hover:text-violet-600 hover:bg-violet-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
