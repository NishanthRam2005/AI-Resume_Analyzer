"use client"

import Link from "next/link"
import { FileText, ArrowRight, CheckCircle, BarChart } from "lucide-react"

export default function HomePage() {
  const handleFileChange = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-indigo-50 p-4 md:p-8">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-violet-600" />
            <span className="ml-2 text-2xl font-bold text-violet-600">ResumeAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 border border-violet-300 rounded-md text-violet-700 hover:bg-violet-50"
            >
              Log in
            </Link>
            <Link href="/register" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 mb-6 tracking-tight">
          Resume Analyzer AI
        </h1>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Upload your resume and get instant AI-powered feedback to help you land your dream job
        </p>
      </header>

      <div className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/analyzer"
            className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white text-lg rounded-full inline-flex items-center justify-center"
          >
            Analyze Your Resume <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/register"
            className="px-8 py-4 border border-violet-300 text-violet-700 hover:bg-violet-50 text-lg rounded-full inline-flex items-center justify-center"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 mb-6 tracking-tight">
            AI-Powered Resume Analysis
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-medium">
            Get instant feedback on your resume with our advanced AI. Land your dream job with a perfectly optimized resume.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-violet-50 p-8 rounded-xl shadow-sm border border-violet-100">
              <div className="bg-violet-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">AI-Powered Analysis</h3>
              <p className="text-slate-600">
                Our advanced AI analyzes your resume against industry standards and job descriptions to provide
                personalized feedback.
              </p>
            </div>

            <div className="bg-violet-50 p-8 rounded-xl shadow-sm border border-violet-100">
              <div className="bg-violet-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Actionable Suggestions</h3>
              <p className="text-slate-600">
                Get specific, actionable suggestions to improve your resume and increase your chances of landing
                interviews.
              </p>
            </div>

            <div className="bg-violet-50 p-8 rounded-xl shadow-sm border border-violet-100">
              <div className="bg-violet-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <BarChart className="h-7 w-7 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800">Detailed Metrics</h3>
              <p className="text-slate-600">
                Receive comprehensive metrics on your resume's strengths, weaknesses, and keyword optimization.
              </p>
              <label htmlFor="resume-upload" className="upload-area block mt-8">
                <input
                  type="file"
                  id="resume-upload"
                  className="input-file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-violet-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your resume here or click to upload
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-violet-400" />
                <span className="ml-2 text-xl font-bold text-white">ResumeAI</span>
              </div>
              <p className="mt-3 max-w-xs">AI-powered resume analysis to help you land your dream job.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-violet-400 transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-violet-400 transition-colors">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-violet-400 transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-violet-400 transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-violet-400 transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-violet-400 transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 ResumeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
