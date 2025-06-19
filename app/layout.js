import "./globals.css"

export const metadata = {
  title: "ResumeAI - AI-Powered Resume Analysis",
  description: "Get instant feedback on your resume with our advanced AI analysis",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  )
}
