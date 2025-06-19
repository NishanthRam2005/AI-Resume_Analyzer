"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info, Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircleProgress } from './circle-progress';

export default function AnalysisResults({ analysis }) {
  const [activeTab, setActiveTab] = useState("overview")

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-rose-500"
  }

  const getScoreRingColor = (score) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-rose-500"
  }

  const handleExport = () => {
    const report = {
      score: analysis.score,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions,
      keywords: analysis.keywords
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume-analysis-report.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="analysis-results max-w-4xl mx-auto glass-card rounded-2xl p-8">
      <div className="max-w-[95%] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 animate-in-down">
          <div className="flex-1">
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Analysis Results
            </h2>
            <p className="text-muted-foreground text-base">Detailed analysis of your resume's strengths and areas for improvement</p>
          </div>
          <Button 
            variant="outline" 
            className="glass-input hover-lift whitespace-nowrap"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="mb-12 animate-in-up delay-200">
          <div className="flex justify-center">
            <div className="relative transform hover:scale-105 transition-transform duration-300">
              <CircleProgress value={analysis.score} size={160} strokeWidth={12} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
                <span className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                <span className="text-muted-foreground block text-sm mt-1">Resume Score</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full animate-in fade-in duration-700 delay-300">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8 p-1.5 bg-muted rounded-xl gap-2">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium transition-all duration-300 hover:bg-primary/5 flex items-center justify-center gap-2 py-2.5 flex-1 rounded-lg text-muted-foreground"
          >
            <Info className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="strengths"
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm font-semibold transition-all duration-300 hover:bg-emerald-50 flex items-center justify-center gap-2 py-3 flex-1 rounded-xl text-slate-600"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Strengths
          </TabsTrigger>
          <TabsTrigger
            value="improvements"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm font-semibold transition-all duration-300 hover:bg-amber-50 flex items-center justify-center gap-2 py-3 flex-1 rounded-xl text-slate-600"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Improvements
          </TabsTrigger>
          <TabsTrigger 
            value="keywords" 
            className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 data-[state=active]:shadow-sm font-semibold transition-all duration-300 hover:bg-sky-50 flex items-center justify-center gap-2 py-3 flex-1 rounded-xl text-slate-600"
          >
            <Star className="h-4 w-4 mr-2" />
            Keywords
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="glass-card rounded-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-500" />
                Resume Overview
              </CardTitle>
              <CardDescription>A comprehensive analysis of your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Key Strengths</h4>
                    <p className="text-slate-600 text-sm">{analysis.strengths[0]}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Areas for Improvement</h4>
                    <p className="text-slate-600 text-sm">{analysis.weaknesses[0]}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-sky-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Top Suggestion</h4>
                    <p className="text-slate-600 text-sm">{analysis.suggestions[0]}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strengths" className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="glass-card rounded-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                Resume Strengths
              </CardTitle>
              <CardDescription>What your resume does well</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-full shrink-0 transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-slate-700 leading-relaxed">{strength}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="glass-card rounded-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Areas for Improvement
              </CardTitle>
              <CardDescription>Suggestions to enhance your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                <div className="mb-12">
                  <h4 className="font-semibold text-slate-800 mb-6 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Weaknesses
                  </h4>
                  <ul className="grid gap-6">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-5 bg-gradient-to-br from-slate-50/80 to-white/50 p-7 rounded-2xl hover:from-slate-100/80 hover:to-white transition-all duration-300 border border-slate-100/80 shadow-sm hover:shadow group">
                        <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-3.5 rounded-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shrink-0 shadow-sm">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 leading-relaxed break-words">{weakness}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-12">
                  <h4 className="font-semibold text-slate-800 mb-6 text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-sky-500" />
                    Suggestions
                  </h4>
                  <ul className="grid gap-6">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-5 bg-gradient-to-br from-slate-50/80 to-white/50 p-7 rounded-2xl hover:from-slate-100/80 hover:to-white transition-all duration-300 border border-slate-100/80 shadow-sm hover:shadow group">
                        <div className="bg-gradient-to-br from-sky-100 to-sky-50 p-3.5 rounded-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shrink-0 shadow-sm">
                          <Star className="h-4 w-4 text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 leading-relaxed break-words">{suggestion}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="glass-card rounded-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-sky-500" />
                Keyword Analysis
              </CardTitle>
              <CardDescription>Important keywords found and missing in your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                <div className="bg-gradient-to-br from-emerald-50/80 to-white/50 p-8 rounded-2xl border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h4 className="font-semibold text-slate-800 mb-6 text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Present Keywords
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {analysis.keywords.present.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 hover:from-emerald-200 hover:to-emerald-100 transition-all duration-300 hover:scale-105 cursor-default py-2 px-4 text-sm font-semibold rounded-lg shadow-sm"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50/80 to-white/50 p-8 rounded-2xl border border-rose-100/80 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h4 className="font-semibold text-slate-800 mb-6 text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-500" />
                    Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {analysis.keywords.missing.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-2 border-rose-200 text-rose-700 hover:bg-rose-50 transition-all duration-300 hover:scale-105 cursor-default py-2 px-4 text-sm font-semibold rounded-lg shadow-sm"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
