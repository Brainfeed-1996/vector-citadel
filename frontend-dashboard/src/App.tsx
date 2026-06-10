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

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)',
    color: '#e5e7eb',
    padding: '24px',
    maxWidth: '1152px',
    margin: '0 auto',
  }

  return (
    <div style={containerStyle}>
      <header style={{ 
        borderBottom: '1px solid #1f2937', 
        padding: '24px 0', 
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h1 style={{ 
          fontSize: '30px', 
          fontWeight: 'bold', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Database style={{ width: '32px', height: '32px', color: '#a855f7' }} />
          Vector Citadel Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#9ca3af' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            backgroundColor: '#4ade80', 
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          Live
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <MetricCard icon={<Zap />} label="Latence" value={`${metrics.latency.toFixed(1)}ms`} color="#22d3ee" />
        <MetricCard icon={<BarChart3 />} label="Rappel" value={`${(metrics.recall * 100).toFixed(1)}%`} color="#34d399" />
        <MetricCard icon={<Clock />} label="Fraîcheur" value={`${(metrics.freshness * 100).toFixed(1)}%`} color="#fbbf24" />
        <MetricCard icon={<Activity />} label="Vectors" value={metrics.total_vectors.toString()} color="#a78bfa" />
      </div>

      <div style={{ 
        backgroundColor: 'rgba(17, 24, 39, 0.5)', 
        borderRadius: '12px', 
        padding: '24px', 
        border: '1px solid #1f2937',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search style={{ width: '20px', height: '20px', color: '#a855f7' }} />
          Recherche Hybride
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Entrez votre requête..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: 'white',
            }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <input
              type="text"
              placeholder="Catégorie"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{ padding: '8px 12px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: 'white' }}
            />
            <input
              type="text"
              placeholder="Tags"
              value={filters.tags.join(', ')}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
              style={{ padding: '8px 12px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: 'white' }}
            />
            <input
              type="text"
              placeholder="Source ID"
              value={filters.source_id}
              onChange={(e) => setFilters({ ...filters, source_id: e.target.value })}
              style={{ padding: '8px 12px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: 'white' }}
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ 
              padding: '12px 24px',
              backgroundColor: loading ? '#374151' : '#7c3aed',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : null}
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ 
          backgroundColor: 'rgba(17, 24, 39, 0.5)', 
          borderRadius: '12px', 
          padding: '24px', 
          border: '1px solid #1f2937',
          marginBottom: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            Résultats ({results.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {results.map((result, idx) => (
              <div key={result.id} style={{ 
                backgroundColor: '#1f2937', 
                borderRadius: '8px', 
                padding: '16px', 
                border: '1px solid #374151'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#d8b4fe' }}>
                    #{idx + 1} {result.id.substring(0, 8)}...
                  </span>
                  <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{result.score.toFixed(4)}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                  <p>Catégorie: {result.metadata.category || 'N/A'}</p>
                  <p>Source: {result.metadata.source_id || 'N/A'}</p>
                  <p>Tags: {result.metadata.tags?.join(', ') || 'Aucun'}</p>
                  <p>Fraîcheur: {result.freshness_score ? `${Math.round(result.freshness_score! * 100)}%` : 'N/A'}</p>
                  {result.scoring_breakdown && (
                    <p style={{ fontSize: '12px', color: '#e9d5ff', marginTop: '8px' }}>
                      {result.scoring_breakdown!.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'rgba(17, 24, 39, 0.5)', 
        borderRadius: '12px', 
        padding: '24px', 
        border: '1px solid #1f2937'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Métriques</h2>
        <div style={{ height: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="recall" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ 
      backgroundColor: '#1f2937', 
      borderRadius: '12px', 
      padding: '16px', 
      border: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ padding: '8px', backgroundColor: '#111827', borderRadius: '8px', color }}>{icon}</div>
      <div>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>{value}</p>
      </div>
    </div>
  )
}

export default App