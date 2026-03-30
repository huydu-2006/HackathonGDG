export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  color = 'indigo',
}: {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: 'indigo' | 'green' | 'blue';
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
