import RiskBadge from './RiskBadge'
import RiskBar from './RiskBar'

export default function PredictionsTable({ records, onViewDetails }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#0F172A] text-white text-xs uppercase tracking-wider">
          <th className="px-4 py-3 text-left">Date</th>
          <th className="px-4 py-3 text-left">Applicant ID</th>
          <th className="px-4 py-3 text-left">Risk Score</th>
          <th className="px-4 py-3 text-left">Risk Level</th>
          <th className="px-4 py-3 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec, i) => (
          <tr key={rec.id ?? i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 text-gray-600">
              {new Date(rec.created_at).toLocaleDateString('en-US', {
                month: 'short', day: '2-digit', year: 'numeric'
              })}
            </td>
            <td className="px-4 py-3 font-mono text-gray-800">
              APP-{rec.id?.slice(-6)?.toUpperCase() ?? '------'}
            </td>
            <td className="px-4 py-3">
              <RiskBar score={rec.result?.risk_score ?? 0} level={rec.result?.risk_level} />
            </td>
            <td className="px-4 py-3">
              <RiskBadge level={rec.result?.risk_level} />
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => onViewDetails?.(rec)}
                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
        {records.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center py-10 text-gray-400">
              No predictions yet
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}