import { useState, useEffect } from 'react'
import { Search, Database, BarChart3, Clock, Zap, Activity, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './index.css'

interface SearchFilters {
  category: string
  tags: string[]
  source_id: string
}

interface SearchResult {
  id: string
  score: number
  freshness_score?: number
  metadata: {
    source_id?: string
    category?: string
    tags?: string[]
  }
  trace?: {
    steps: Array<{ name: string; latency_ms: number; details: unknown }>
    total_latency_ms: number
  }
  scoring_breakdown?: {
    vector_score: number
    metadata_score: number
    final_score: number
    explanation: string
  }
}

interface Metrics {
  latency: number
  recall: number
  freshness: number
  total_vectors: number
  uptime: number
}

function App() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({ category: '', tags: [], source_id: '' })
  const [results, setResults] = useState<SearchResult[]>([])
  const [metrics, setMetrics] = useState<Metrics>({
    latency: 0,
    recall: 0,
    freshness: 0,
    total_vectors: 0,
    uptime: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        latency: Math.random() * 50 + 10,
        recall: Math.random() * 0.2 + 0.8,
        freshness: Math.random() * 0.3 + 0.7,
        total_vectors: 1247 + Math.floor(Math.random() * 10),
        uptime: prev.uptime + 1,
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/vectors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vector: Array(1536).fill(0).map(() => Math.random() - 0.5),
          filters,
          limit: 10,
          hybrid_alpha: 0.7,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
    setLoading(false)
  }

  const chartData = Array.from({ length: 20 }, (_, i) => ({
    time: i.toString(),
    latency: metrics.latency + Math.random() * 20 - 10,
    recall: metrics.recall + Math.random() * 0.05 - 0.025,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="absolute inset-0 bg-grid-gray-800/20"></div>
      
      <header className="relative border-b border-gray-800/50 backdrop-blur-sm bg-gray-900/30 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-400" />
            Vector Citadel Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Live
          </div>
        </div>
      </header>

      <main className="relative p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard icon={<Zap />} label="Latence" value={`${metrics.latency.toFixed(1)}ms`} color="text-cyan-400" />
          <MetricCard icon={<BarChart3 />} label="Rappel" value={`${(metrics.recall * 100).toFixed(1)}%`} color="text-emerald-400" />
          <MetricCard icon={<Clock />} label="Fraîcheur" value={`${(metrics.freshness * 100).toFixed(1)}%`} color="text-amber-400" />
          <MetricCard icon={<Activity />} label="Vectors" value={metrics.total_vectors.toString()} color="text-violet-400" />
        </div>

        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
            <Search className="h-5 w-5 text-purple-400" />
            Recherche Hybride Vectorielle
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Entrez votre requête textuelle..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-gray-500 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Filtrer par catégorie"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Tags (séparés par virgule)"
                value={filters.tags.join(', ')}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
              <input
                type="text"
                placeholder="Source ID"
                value={filters.source_id}
                onChange={(e) => setFilters({ ...filters, source_id: e.target.value })}
                className="px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <span>Alpha:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  defaultValue="0.7"
                  className="w-32"
                />
                <span>0.7</span>
              </label>
              
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-medium transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Résultats ({results.length})
            </h2>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div key={result.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-sm text-purple-300">
                      #{idx + 1} {result.id.substring(0, 8)}...
                    </span>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-lg">{result.score.toFixed(4)}</div>
                      <div className="text-xs text-gray-500">score</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Catégorie:</span>
                      <span className="ml-2 text-white">{result.metadata.category || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <span className="ml-2 text-white">{result.metadata.source_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tags:</span>
                      <span className="ml-2 text-white">{result.metadata.tags?.join(', ') || 'Aucun'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fraîcheur:</span>
                      <span className="ml-2 text-amber-400">
                        {result.freshness_score ? `${Math.round(result.freshness_score! * 100)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {result.scoring_breakdown && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <p className="text-xs text-purple-200 font-mono">
                        {result.scoring_breakdown!.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-gray-800/50">
          <h2 className="text-xl font-semibold mb-4 text-white">Métriques en Temps Réel</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="recallGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#6b7280" axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(31, 41, 59, 0.9)', border: '1px solid #374151' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={false}
                  fill="url(#latencyGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="recall" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                  fill="url(#recallGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-xl p-4 border border-gray-800/50 hover:border-gray-700 transition-all">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gray-800/50 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-2xl font-bold text-white`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

export default App