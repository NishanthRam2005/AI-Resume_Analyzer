import { FileIcon, FileTextIcon } from "lucide-react"

export function ResumePreview({ text, file }) {
  const fileType = file?.type || ''
  const isPdf = fileType.includes('pdf')
  const isWord = fileType.includes('word') || fileType.includes('docx')
  const fileName = file?.name || 'Resume'
  const fileSize = file ? `${(file.size / 1024).toFixed(2)} KB` : ''

  return (
    <div className="border rounded-lg p-4 bg-slate-50">
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="bg-violet-100 p-3 rounded-full mb-3">
          <FileIcon className="h-8 w-8 text-violet-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-1">
          {isPdf ? 'PDF Document' : isWord ? 'Word Document' : 'Text Document'} Ready
        </h3>
        <p className="text-slate-600 mb-3 max-w-md">
          Your resume has been uploaded successfully. Click "Analyze Resume" to begin the AI analysis.
        </p>
        <div className="flex items-center gap-2 text-sm bg-violet-50 px-3 py-1.5 rounded-md text-violet-700 border border-violet-200">
          <FileTextIcon className="h-4 w-4" />
          <span>{fileName}</span>
          {fileSize && <span className="text-slate-500">({fileSize})</span>}
        </div>
      </div>
    </div>
  )
}
