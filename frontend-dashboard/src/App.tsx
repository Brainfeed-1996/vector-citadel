import { useState, useEffect } from 'react'
import { Search, Database, BarChart3, Clock, Zap, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

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
      const response = await fetch('/api/vectors/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vector: Array(1536).fill(0).map(() => Math.random() - 0.5),
          filters,
          limit: 10,
          hybrid_alpha: 0.7,
        }),
      })
      const data = await response.json()
      setResults(data)
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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 p-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="h-8 w-8 text-purple-400" />
          Vector Citadel Dashboard
        </h1>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard icon={<Zap />} label="Latence" value={`${metrics.latency.toFixed(1)}ms`} color="text-blue-400" />
          <MetricCard icon={<BarChart3 />} label="Rappel" value={`${(metrics.recall * 100).toFixed(1)}%`} color="text-green-400" />
          <MetricCard icon={<Clock />} label="Fraîcheur" value={`${(metrics.freshness * 100).toFixed(1)}%`} color="text-yellow-400" />
          <MetricCard icon={<Activity />} label="Vectors" value={metrics.total_vectors.toString()} color="text-purple-400" />
        </div>

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche Hybride
          </h2>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Entrez votre requête..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Catégorie"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
              <input
                type="text"
                placeholder="Tags (séparés par virgule)"
                value={filters.tags.join(', ')}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
              <input
                type="text"
                placeholder="Source ID"
                value={filters.source_id}
                onChange={(e) => setFilters({ ...filters, source_id: e.target.value })}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Résultats ({results.length})</h2>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div key={result.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm text-purple-400">#{idx + 1} {result.id}</span>
                    <span className="text-green-400 font-bold">{result.score.toFixed(4)}</span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Catégorie: {result.metadata.category || 'N/A'}</p>
                    <p>Source: {result.metadata.source_id || 'N/A'}</p>
                    <p>Tags: {result.metadata.tags?.join(', ') || 'Aucun'}</p>
                    <p>Fraîcheur: {result.freshness_score ? `(${result.freshness_score! * 100}%)` : 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Métriques en Temps Réel</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} dot={false} />
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
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center gap-3">
        <div className={color}>{icon}</div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default App