import { SmartGoal } from '@/app/lib/api';
import { Target, BarChart2, CheckCircle, Link, Clock } from 'lucide-react';

const goalItems = [
  { key: 'specific', label: 'Specific', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'measurable', label: 'Measurable', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
  { key: 'achievable', label: 'Achievable', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'relevant', label: 'Relevant', icon: Link, color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 'time_bound', label: 'Time-Bound', icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
] as const;

export default function SmartGoalCard({ goal }: { goal: SmartGoal }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goalItems.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className={`${bg} p-1.5 rounded-lg`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{goal[key]}</p>
        </div>
      ))}
    </div>
  );
}
