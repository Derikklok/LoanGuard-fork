import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

export default function Dashboard() {
  const { user }          = useAuth()
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const PAGE_SIZE = 5

  useEffect(() => {
    fetchRecentPredictions()
  }, [])

  const fetchRecentPredictions = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/history', {
        params: { skip: 0, limit: PAGE_SIZE }
      })
      setRecords(data.records)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const highRisk = records.filter(r =>
    ['HIGH RISK (50-70)', 'CRITICAL RISK (70-100)'].includes(r.result?.risk_level)
  ).length
  const lowRisk  = records.filter(r =>
    ['LOW RISK (0-30)', 'MEDIUM RISK (30-50)'].includes(r.result?.risk_level)
  ).length

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name ?? 'Officer'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Here is an overview of today's risk assessment performance.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Predictions"
            value={total}
            sub="↑ 8% increase this month"
            subColor="text-green-500"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatCard
            title="High Risk Count"
            value={highRisk}
            sub={`${total ? Math.round((highRisk / total) * 100) : 0}% of total`}
            accentColor="text-red-500"
            icon={<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
          />
          <StatCard
            title="Low Risk Count"
            value={lowRisk}
            sub={`${total ? Math.round((lowRisk / total) * 100) : 0}% of total`}
            accentColor="text-blue-500"
            icon={<svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          />
        </div>

        {/* Recent Predictions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Predictions</h2>
            <Link to="/history"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading...</div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No predictions yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0F172A] text-white text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Officer</th>
                  <th className="px-5 py-3 text-left">Risk Score</th>
                  <th className="px-5 py-3 text-left">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, i) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}