import { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import api from '../lib/api'

const PAGE_SIZE = 10

export default function History() {
  const [records, setRecords] = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)   // for detail modal

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/history', {
        params: { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }
      })
      setRecords(data.records)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchHistory() }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const filtered = records.filter(r =>
    r.officer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.id?.toLowerCase().includes(search.toLowerCase())
  )

  const scoreColor = (score) => {
    if (score >= 70) return 'text-red-500'
    if (score >= 50) return 'text-orange-500'
    if (score >= 30) return 'text-yellow-500'
    return 'text-blue-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Risk Assessment History</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage past loan predictions and risk assessments.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center border border-gray-200 rounded-lg px-3 gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search predictions..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="text-sm py-2 outline-none w-48" />
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filter
              </button>
              <span className="text-xs text-gray-400">Showing 1–{Math.min(PAGE_SIZE, records.length)} of {total} records</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0F172A] text-white text-xs uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Officer Name</th>
                <th className="px-5 py-3 text-left">Risk Score</th>
                <th className="px-5 py-3 text-left">Risk Level</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-400">No records found</td></tr>
              ) : filtered.map((rec, i) => (
                <tr key={rec.id ?? i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-600 text-xs">
                    {new Date(rec.created_at).toLocaleString('en-US', {
                      month: 'short', day: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {rec.officer_name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-gray-800 font-medium">{rec.officer_name}</span>
                    </div>
                  </td>
                  <td className={`px-5 py-3 font-bold ${scoreColor(rec.result?.risk_score ?? 0)}`}>
                    {rec.result?.risk_score ?? 0}%
                  </td>
                  <td className="px-5 py-3">
                    <RiskBadge level={rec.result?.risk_level} />
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelected(rec)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Rows per page: {PAGE_SIZE}</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Page {page} of {totalPages || 1}</span>
              <button onClick={() => setPage(1)} disabled={page === 1}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30">«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30">‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30">›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30">»</button>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Assessment Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Officer</span>
                <span className="font-medium">{selected.officer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="font-medium">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Risk Level</span>
                <RiskBadge level={selected.result?.risk_level} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Score</span>
                <span className="font-bold text-lg">{selected.result?.risk_score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Low Risk Prob.</span>
                <span className="text-green-600 font-medium">{selected.result?.low_risk_probability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">High Risk Prob.</span>
                <span className="text-red-500 font-medium">{selected.result?.high_risk_probability}%</span>
              </div>
              {selected.result?.risk_factors?.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-1">Risk Factors</p>
                  <ul className="flex flex-col gap-1">
                    {selected.result.risk_factors.map((f, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-red-400">•</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}