const config = {
  'LOW RISK (0-30)':      { label: 'Low Risk',      class: 'bg-green-100 text-green-700' },
  'MEDIUM RISK (30-50)':  { label: 'Medium Risk',   class: 'bg-yellow-100 text-yellow-700' },
  'HIGH RISK (50-70)':    { label: 'High Risk',     class: 'bg-orange-100 text-orange-700' },
  'CRITICAL RISK (70-100)': { label: 'Critical Risk', class: 'bg-red-100 text-red-700' },
}

export default function RiskBadge({ level }) {
  const c = config[level] ?? { label: level, class: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.class}`}>
      {c.label}
    </span>
  )
}