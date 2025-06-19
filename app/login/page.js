"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simple validation
      if (!email || !password) {
        throw new Error("Please fill in all fields")
      }

      // In a real app, you would validate credentials against a backend
      if (email === "demo@example.com" && password === "password") {
        // Simulate successful login
        window.location.href = "/analyzer"
      } else {
        throw new Error("Invalid credentials. Try demo@example.com / password")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-violet-600 hover:text-violet-700 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-xl border border-violet-100 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-2">
                <div className="bg-violet-100 w-12 h-12 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-violet-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-gray-500">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 flex items-start">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  isLoading ? "bg-violet-400" : "bg-violet-600 hover:bg-violet-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              <p>Demo credentials: demo@example.com / password</p>
            </div>

            <div className="text-center text-sm text-gray-600 mt-4">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-violet-600 hover:text-violet-700 font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
