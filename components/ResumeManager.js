"use client"
import { useState, useEffect, useRef } from "react"
import { Search, Star, Trash2, Download, Tag, History, FileText, Plus, Edit, Save, X, Upload, FileDown, BarChart2, Share2 } from "lucide-react"

function getSavedResumes() {
  if (typeof window === 'undefined') return []
  
  try {
    const saved = localStorage.getItem("savedResumes")
    if (!saved) return []
    return JSON.parse(saved)
  } catch (error) {
    console.error("Error loading saved resumes:", error)
    return []
  }
}

function saveResumes(resumes) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem("savedResumes", JSON.stringify(resumes))
    window.dispatchEvent(new Event("storage"))
  } catch (error) {
    console.error("Error saving resumes:", error)
  }
}

function base64ToFile(dataurl, filename) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while(n--){ u8arr[n] = bstr.charCodeAt(n) }
  return new File([u8arr], filename, {type:mime})
}

export default function ResumeManager({ onLoad, onPreview }) {
  const [resumes, setResumes] = useState([])
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [showFavs, setShowFavs] = useState(false)
  const [selected, setSelected] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [noteInput, setNoteInput] = useState("")
  const [editingNote, setEditingNote] = useState(null)
  const [historyModal, setHistoryModal] = useState(null)
  const [recentActions, setRecentActions] = useState([])
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef()

  // New state for additional features
  const [showStats, setShowStats] = useState(false)
  const [compareResumes, setCompareResumes] = useState([])
  const [shareModal, setShareModal] = useState(null)
  const [categoryColors, setCategoryColors] = useState({
    'Technical': 'bg-blue-100 text-blue-700',
    'Creative': 'bg-purple-100 text-purple-700',
    'Management': 'bg-green-100 text-green-700',
    'Entry Level': 'bg-yellow-100 text-yellow-700',
    'Executive': 'bg-red-100 text-red-700'
  })

  useEffect(() => {
    // Load saved resumes on component mount
    const loadedResumes = getSavedResumes()
    console.log("Loaded resumes:", loadedResumes)
    setResumes(loadedResumes)
  }, [])
  useEffect(() => {
    const handler = () => setResumes(getSavedResumes())
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  // Search, sort, filter
  let filtered = resumes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.tags && r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) ||
    (r.note && r.note.toLowerCase().includes(search.toLowerCase()))
  )
  if (showFavs) filtered = filtered.filter(r => r.favorite)
  filtered = filtered.sort((a, b) => {
    if (sortBy === "date") return new Date(b.date) - new Date(a.date)
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "score") return (b.score||0) - (a.score||0)
    if (sortBy === "favorite") return (b.favorite?1:0) - (a.favorite?1:0)
    return 0
  })

  // Bulk actions
  const allVisibleNames = filtered.map(r => r.name)
  const allSelected = selected.length === allVisibleNames.length && selected.length > 0
  const toggleSelect = (name) => setSelected(sel => sel.includes(name) ? sel.filter(n => n !== name) : [...sel, name])
  const toggleSelectAll = () => allSelected ? setSelected([]) : setSelected(allVisibleNames)
  const bulkDelete = () => {
    const updated = resumes.filter(r => !selected.includes(r.name))
    setResumes(updated)
    saveResumes(updated)
    setSelected([])
    addAction("bulk_delete", selected)
  }
  const bulkDownload = () => {
    filtered.filter(r => selected.includes(r.name)).forEach(r => {
      const file = base64ToFile(r.content, r.name)
      const url = URL.createObjectURL(file)
      const a = document.createElement("a")
      a.href = url
      a.download = r.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
    addAction("bulk_download", selected)
  }

  // Favorite/star
  const toggleStar = (name) => {
    const updated = resumes.map(r => r.name === name ? { ...r, favorite: !r.favorite } : r)
    setResumes(updated)
    saveResumes(updated)
    addAction("star", name)
  }

  // Tagging
  const addTag = (name, tag) => {
    const updated = resumes.map(r => r.name === name ? { ...r, tags: [...(r.tags||[]), tag] } : r)
    setResumes(updated)
    saveResumes(updated)
    setTagInput("")
    addAction("tag", name)
  }
  const removeTag = (name, tag) => {
    const updated = resumes.map(r => r.name === name ? { ...r, tags: (r.tags||[]).filter(t => t !== tag) } : r)
    setResumes(updated)
    saveResumes(updated)
    addAction("untag", name)
  }

  // Notes
  const saveNote = (name, note) => {
    const updated = resumes.map(r => r.name === name ? { ...r, note } : r)
    setResumes(updated)
    saveResumes(updated)
    setEditingNote(null)
    addAction("note", name)
  }

  // Version history
  const showHistory = (resume) => setHistoryModal(resume)
  const closeHistory = () => setHistoryModal(null)
  const restoreVersion = (resumeName, versionIdx) => {
    const updated = resumes.map(r => {
      if (r.name === resumeName && r.history && r.history[versionIdx]) {
        const restored = r.history[versionIdx]
        return { 
          ...r, 
          content: restored.content, 
          date: new Date().toISOString(),
          history: [
            // Add current version to history before restoring
            { content: r.content, date: r.date },
            ...r.history
          ]
        }
      }
      return r
    })
    setResumes(updated)
    saveResumes(updated)
    closeHistory()
    addAction("restore_version", resumeName)
  }

  // Save with versioning
  const saveResumeWithHistory = (newResume) => {
    let currentResumes = getSavedResumes()
    const idx = currentResumes.findIndex(r => r.name === newResume.name)
    
    if (idx !== -1) {
      // Resume exists, update with history
      const old = currentResumes[idx]
      const oldHistory = old.history || []
      
      // Only add to history if content has changed
      if (old.content !== newResume.content) {
        currentResumes[idx] = {
          ...old,
          content: newResume.content,
          date: new Date().toISOString(),
          history: [
            { content: old.content, date: old.date },
            ...oldHistory
          ]
        }
      } else {
        // Just update the date if content hasn't changed
        currentResumes[idx] = {
          ...old,
          date: new Date().toISOString()
        }
      }
    } else {
      // New resume, initialize with empty history
      currentResumes.push({
        ...newResume,
        history: []
      })
    }
    
    setResumes(currentResumes)
    saveResumes(currentResumes)
    addAction("save", newResume.name)
  }

  // Import/export
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(resumes, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "resumes-backup.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addAction("export", null)
  }
  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function(ev) {
      try {
        const imported = JSON.parse(ev.target.result)
        setResumes(imported)
        saveResumes(imported)
        setImporting(false)
        addAction("import", null)
      } catch {
        alert("Invalid backup file.")
      }
    }
    reader.readAsText(file)
  }

  // Recent actions
  function addAction(type, name) {
    setRecentActions(actions => [{ type, name, time: new Date() }, ...actions.slice(0, 9)])
  }

  // Add this function to handle loading a resume
  const handleLoadResume = (resume) => {
    if (onLoad && resume.content) {
      const file = base64ToFile(resume.content, resume.name)
      onLoad(file)
    }
  }

  // Add this function to handle preview
  const handlePreviewResume = (resume) => {
    if (onPreview && resume.content) {
      const file = base64ToFile(resume.content, resume.name)
      onPreview(file)
    }
  }

  // New functions for additional features
  const handleCompare = (resume) => {
    if (compareResumes.length < 2) {
      setCompareResumes([...compareResumes, resume])
    }
  }

  const generateShareLink = (resume) => {
    const encodedData = btoa(JSON.stringify(resume))
    return `${window.location.origin}/share/${encodedData}`
  }

  const calculateStats = () => {
    const stats = {
      total: resumes.length,
      byCategory: {},
      averageScore: 0,
      topSkills: new Map(),
      recentActivity: recentActions.length
    }

    resumes.forEach(resume => {
      // Category stats
      resume.tags?.forEach(tag => {
        stats.byCategory[tag] = (stats.byCategory[tag] || 0) + 1
      })

      // Score stats
      if (resume.score) {
        stats.averageScore += resume.score
      }

      // Skills stats
      if (resume.keywords?.present) {
        resume.keywords.present.forEach(skill => {
          stats.topSkills.set(skill, (stats.topSkills.get(skill) || 0) + 1)
        })
      }
    })

    stats.averageScore = stats.averageScore / (resumes.length || 1)
    stats.topSkills = Array.from(stats.topSkills.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return stats
  }

  // UI Component: Stats Dashboard
  const StatsDashboard = () => {
    const stats = calculateStats()
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Resume Statistics</h3>
            <button onClick={() => setShowStats(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="font-medium text-violet-700">Total Resumes</h4>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="font-medium text-violet-700">Average Score</h4>
              <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</p>
            </div>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="font-medium text-violet-700">Top Skills</h4>
              <ul className="mt-2">
                {stats.topSkills.map(([skill, count]) => (
                  <li key={skill} className="flex justify-between">
                    <span>{skill}</span>
                    <span className="text-violet-600">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-violet-50 rounded-lg">
              <h4 className="font-medium text-violet-700">Categories</h4>
              <ul className="mt-2">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <li key={category} className="flex justify-between">
                    <span>{category}</span>
                    <span className="text-violet-600">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // UI Component: Compare Resumes
  const CompareModal = () => {
    if (compareResumes.length !== 2) return null

    const [resume1, resume2] = compareResumes
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Compare Resumes</h3>
            <button onClick={() => setCompareResumes([])} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{resume1.name}</h4>
              <div className="space-y-2">
                <p>Score: {resume1.score || 'N/A'}</p>
                <p>Date: {new Date(resume1.date).toLocaleDateString()}</p>
                {resume1.keywords?.present && (
                  <div>
                    <p className="font-medium">Skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resume1.keywords.present.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{resume2.name}</h4>
              <div className="space-y-2">
                <p>Score: {resume2.score || 'N/A'}</p>
                <p>Date: {new Date(resume2.date).toLocaleDateString()}</p>
                {resume2.keywords?.present && (
                  <div>
                    <p className="font-medium">Skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {resume2.keywords.present.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // UI Component: Share Modal
  const ShareModal = ({ resume }) => {
    const [copied, setCopied] = useState(false)
    const shareLink = generateShareLink(resume)

    const copyToClipboard = async () => {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Share Resume</h3>
            <button onClick={() => setShareModal(null)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Share this resume with others using the link below:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Add this function to handle file upload and save with history
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = function(ev) {
      const content = ev.target.result
      const newResume = {
        name: file.name,
        content: content,
        date: new Date().toISOString(),
        favorite: false,
        tags: []
      }
      saveResumeWithHistory(newResume)
    }
    reader.readAsDataURL(file)
  }

  // Add direct upload function
  const handleDirectUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = function(ev) {
      const content = ev.target.result
      const newResume = {
        name: file.name,
        content: content,
        date: new Date().toISOString(),
        favorite: false,
        tags: [],
        score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100 for demo
      }
      console.log("Creating new resume:", newResume.name)
      const currentResumes = getSavedResumes()
      const updatedResumes = [...currentResumes, newResume]
      setResumes(updatedResumes)
      saveResumes(updatedResumes)
      addAction("upload", newResume.name)
    }
    reader.readAsDataURL(file)
  }

  // Add a test function to verify localStorage
  const testLocalStorage = () => {
    const testItem = { test: "value" }
    try {
      localStorage.setItem("test", JSON.stringify(testItem))
      const retrieved = JSON.parse(localStorage.getItem("test"))
      console.log("localStorage test:", retrieved)
      alert(`localStorage test: ${JSON.stringify(retrieved)}`)
      localStorage.removeItem("test")
    } catch (error) {
      console.error("localStorage test failed:", error)
      alert(`localStorage test failed: ${error.message}`)
    }
  }

  // Main UI
  return (
    <div className="rounded-2xl shadow-lg bg-white/80 border border-violet-100 p-8 mt-10 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 justify-between mb-6 items-center">
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-violet-700">
            <FileText className="w-6 h-6" /> Saved Resumes
          </h2>
          <button className="ml-2 p-2 rounded-full bg-violet-100 hover:bg-violet-200" onClick={handleExport} title="Export resumes"><FileDown className="w-5 h-5" /></button>
          <button className="ml-2 p-2 rounded-full bg-violet-100 hover:bg-violet-200" onClick={()=>setImporting(true)} title="Import resumes"><Upload className="w-5 h-5" /></button>
          <button className="ml-2 p-2 rounded-full bg-violet-100 hover:bg-violet-200" onClick={()=>setShowStats(true)} title="View Statistics"><BarChart2 className="w-5 h-5" /></button>
          {importing && <input type="file" accept=".json" ref={fileInputRef} style={{display:'none'}} onChange={handleImport} />}
        </div>
        <div className="flex gap-2 items-center">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-md border ${showFavs ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-white border-violet-200 text-violet-700'} hover:bg-yellow-50 transition`}
            onClick={() => setShowFavs(f => !f)}
          >
            <Star className={`w-5 h-5 ${showFavs ? 'fill-yellow-400 text-yellow-500' : 'text-violet-400'}`} />
            {showFavs ? 'Show All' : 'Show Favorites'}
          </button>
          <input
            type="text"
            placeholder="Search resumes, tags, notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-lg border border-violet-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white shadow-sm"
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="rounded-lg border border-violet-200 px-3 py-2 bg-white shadow-sm">
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="score">Sort by Score</option>
            <option value="favorite">Sort by Favorite</option>
          </select>
        </div>
      </div>
      
      {/* Add prominent upload button */}
      <div className="mb-6 p-6 border-2 border-dashed border-violet-200 rounded-lg bg-violet-50 text-center">
        <h3 className="text-lg font-medium mb-3 text-violet-700">Add New Resume</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a resume to analyze, save, and manage it</p>
        <label className="inline-flex items-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer">
          <Upload className="w-5 h-5" /> Upload Resume
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleDirectUpload}
          />
        </label>
        <button 
          onClick={testLocalStorage}
          className="ml-4 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Test Storage
        </button>
      </div>
      
      {selected.length > 0 && (
        <div className="mb-4 flex gap-2 items-center bg-violet-50 border border-violet-200 rounded p-2">
          <span className="font-medium text-violet-700">Bulk Actions:</span>
          <button className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600" onClick={bulkDelete}><Trash2 className="w-4 h-4" /> Delete</button>
          <button className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={bulkDownload}><Download className="w-4 h-4" /> Download</button>
          <span className="ml-2 text-xs text-slate-500">{selected.length} selected</span>
        </div>
      )}
      <ul className="divide-y divide-violet-100">
        <li className="py-2 flex items-center gap-2">
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
          <span className="text-xs text-slate-400">Select All</span>
        </li>
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <div className="text-gray-400 mb-2">No resumes found</div>
            <p className="text-sm text-gray-500">Upload a resume using the button above to get started</p>
          </div>
        )}
        {filtered.map((resume, idx) => (
          <li key={idx} className="py-4 flex flex-col md:flex-row md:justify-between md:items-center hover:bg-violet-50 rounded-lg px-2 transition">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="checkbox"
                checked={selected.includes(resume.name)}
                onChange={() => toggleSelect(resume.name)}
              />
              <button
                onClick={() => toggleStar(resume.name)}
                className={`p-1 rounded-full ${resume.favorite ? 'text-yellow-500' : 'text-gray-400'} hover:bg-yellow-50`}
              >
                <Star className={`w-5 h-5 ${resume.favorite ? 'fill-current' : ''}`} />
              </button>
              <span className="font-medium">{resume.name}</span>
              <span className="text-sm text-gray-500">
                {new Date(resume.date).toLocaleDateString()}
              </span>
              {resume.score && (
                <span className="text-sm px-2 py-1 rounded-full bg-violet-100 text-violet-700">
                  Score: {resume.score}
                </span>
              )}
              {resume.tags?.map(tag => (
                <span key={tag} className={`px-2 py-1 rounded-full text-sm ${categoryColors[tag] || 'bg-gray-100 text-gray-700'}`}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <button
                onClick={() => handleLoadResume(resume)}
                className="px-3 py-1 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 transition"
              >
                Load
              </button>
              <button
                onClick={() => handlePreviewResume(resume)}
                className="px-3 py-1 text-sm bg-violet-100 text-violet-700 rounded hover:bg-violet-200 transition"
              >
                Preview
              </button>
              <button
                onClick={() => showHistory(resume)}
                className="p-1 text-gray-500 hover:text-violet-700"
                title="Version History"
              >
                <History className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const file = base64ToFile(resume.content, resume.name)
                  const url = URL.createObjectURL(file)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = resume.name
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
                className="p-1 text-gray-500 hover:text-violet-700"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const updated = resumes.filter(r => r.name !== resume.name)
                  setResumes(updated)
                  saveResumes(updated)
                  addAction("delete", resume.name)
                }}
                className="p-1 text-gray-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleCompare(resume)}
                disabled={compareResumes.length >= 2 && !compareResumes.includes(resume)}
                className="p-1 text-gray-500 hover:text-violet-700 disabled:opacity-50"
                title="Compare"
              >
                <Tag className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShareModal(resume)}
                className="p-1 text-gray-500 hover:text-violet-700"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modals */}
      {showStats && <StatsDashboard />}
      {compareResumes.length === 2 && <CompareModal />}
      {shareModal && <ShareModal resume={shareModal} />}
      {historyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Version History: {historyModal.name}</h3>
              <button onClick={closeHistory} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-violet-50 rounded-lg">
              <h4 className="font-medium mb-2">Current Version</h4>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-violet-800 font-medium">{new Date(historyModal.date).toLocaleString()}</span>
                  <p className="text-sm text-gray-500 mt-1">Current active version</p>
                </div>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    const file = base64ToFile(historyModal.content, historyModal.name)
                    const url = URL.createObjectURL(file)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = historyModal.name
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                >
                  Download
                </button>
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Previous Versions</h4>
            <ul className="divide-y divide-violet-100 mb-4 max-h-60 overflow-y-auto">
              {historyModal.history && historyModal.history.length > 0 ? historyModal.history.map((v, i) => (
                <li key={i} className="py-3 flex justify-between items-center hover:bg-violet-50 px-2 rounded">
                  <div>
                    <span className="text-violet-800 font-medium">{new Date(v.date).toLocaleString()}</span>
                    <p className="text-xs text-gray-500 mt-1">Version {i + 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="px-2 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700" 
                      onClick={() => {
                        const file = base64ToFile(v.content, historyModal.name)
                        const url = URL.createObjectURL(file)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = historyModal.name
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                      }}
                    >
                      Download
                    </button>
                    <button 
                      className="px-2 py-1 rounded bg-violet-600 text-white text-sm hover:bg-violet-700" 
                      onClick={() => restoreVersion(historyModal.name, i)}
                    >
                      Restore
                    </button>
                  </div>
                </li>
              )) : (
                <li className="py-4 text-slate-400 text-center">No previous versions.</li>
              )}
            </ul>
            
            {/* Add a file upload button to update this resume */}
            <div className="mt-4 pt-4 border-t border-violet-100">
              <h4 className="font-medium mb-2">Update This Resume</h4>
              <label className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 cursor-pointer w-fit">
                <Upload className="w-4 h-4" /> Upload New Version
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    
                    const reader = new FileReader()
                    reader.onload = function(ev) {
                      const content = ev.target.result
                      const newResume = {
                        ...historyModal,
                        content: content,
                        date: new Date().toISOString()
                      }
                      saveResumeWithHistory(newResume)
                      closeHistory()
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </label>
            </div>
            
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={closeHistory}>Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Recent Actions */}
      <div className="rounded-xl shadow bg-white/80 border border-violet-100 p-4 mt-8">
        <h3 className="text-lg font-semibold mb-3 text-violet-700">Recent Actions</h3>
        <ul className="divide-y divide-violet-100 text-sm">
          {recentActions.map((a, i) => (
            <li key={i} className="py-2 flex justify-between items-center">
              <span>
                <span className="font-medium text-violet-800">{a.name || "(unknown)"}</span>
                <span className="ml-2 text-xs text-slate-400">{a.type}</span>
              </span>
              <span className="text-xs text-slate-400">{a.time.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 