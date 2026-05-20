import { useState } from 'react'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import api from '../lib/api'

const FIELDS = [
  { key: 'AMT_INCOME_TOTAL', label: 'Annual Income (IDR)',    placeholder: 'e.g. 120000000', type: 'number', required: true },
  { key: 'AMT_CREDIT',       label: 'Credit Amount (IDR)',    placeholder: 'e.g. 500000000', type: 'number', required: true },
  { key: 'AMT_ANNUITY',      label: 'Monthly Annuity (IDR)', placeholder: 'e.g. 4500000',   type: 'number', required: true },
  { key: 'AGE_YEARS',        label: 'Age (years)',            placeholder: 'e.g. 34',         type: 'number', required: true },
  { key: 'DAYS_EMPLOYED',    label: 'Days Employed (Optional)', placeholder: 'e.g. -1200',  type: 'number',
    hint: 'Negative value: days before today. Leave blank for default (2 years)' },
]

export default function Predict() {
  const [form, setForm]     = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const update = (key) => (e) => setForm({ ...form, [key]: parseFloat(e.target.value) })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/predict', form)
      setResult(data)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        const messages = detail.map(d => d.msg || JSON.stringify(d)).join(', ')
        setError(messages)
      } else if (typeof detail === 'string') {
        setError(detail)
      } else if (typeof detail === 'object' && detail?.msg) {
        setError(detail.msg)
      } else {
        setError('Prediction failed')
      }
    } finally { setLoading(false) }
  }

  const scoreColor = (score) => {
    if (score >= 70) return '#EF4444'
    if (score >= 50) return '#F97316'
    if (score >= 30) return '#EAB308'
    return '#3B82F6'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Risk Assessment</h1>
          <p className="text-gray-400 text-sm mt-1">
            Input applicant details to generate a real-time risk probability score powered by ML-01 Engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    onChange={update(f.key)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                    required={f.required ?? true}
                  />
                  {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
                </div>
              ))}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit" disabled={loading}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {loading ? 'Analysing...' : 'Submit Assessment'}
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col">
            {!result ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-700">Ready for Assessment</p>
                <p className="text-sm text-gray-400 max-w-xs">
                  Complete the form on the left to generate the risk score and OJK recommended actions.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Score Gauge */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none"
                        stroke={scoreColor(result.risk_score)} strokeWidth="3"
                        strokeDasharray={`${result.risk_score} 100`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">{result.risk_score}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Risk Score</p>
                    <RiskBadge level={result.risk_level} />
                    <div className="mt-3 flex gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Low Risk</span>
                        <p className="font-semibold text-green-600">{result.low_risk_probability}%</p>
                      </div>
                      <div>
                        <span className="text-gray-400">High Risk</span>
                        <p className="font-semibold text-red-500">{result.high_risk_probability}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Probability Bars */}
                <div className="flex flex-col gap-2">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Repayment Probability</span>
                      <span>{result.low_risk_probability}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.low_risk_probability}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Default Probability</span>
                      <span>{result.high_risk_probability}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${result.high_risk_probability}%` }} />
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {result.risk_factors?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Risk Factors</p>
                    <ul className="flex flex-col gap-1.5">
                      {result.risk_factors.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="mt-0.5 w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 text-[10px]">!</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* OJK Actions */}
                {result.ojk_actions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">OJK Recommended Actions</p>
                    <ul className="flex flex-col gap-1.5">
                      {result.ojk_actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0 text-[10px]">→</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}