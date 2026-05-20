const colorMap = {
  'LOW RISK (0-30)':        'bg-blue-500',
  'MEDIUM RISK (30-50)':    'bg-yellow-400',
  'HIGH RISK (50-70)':      'bg-orange-500',
  'CRITICAL RISK (70-100)': 'bg-red-500',
}

export default function RiskBar({ score, level }) {
  const color = colorMap[level] ?? 'bg-gray-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm text-gray-700 font-medium">{score}%</span>
    </div>
  )
}