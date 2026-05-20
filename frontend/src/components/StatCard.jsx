export default function StatCard({ title, value, sub, subColor = 'text-gray-400', icon, accentColor = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className={`text-5xl font-bold ${accentColor}`}>{value}</div>
      {sub && <p className={`text-xs ${subColor}`}>{sub}</p>}
    </div>
  )
}