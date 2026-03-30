import { Member } from '@/app/lib/api';
import { User } from 'lucide-react';

export default function MemberCard({ member }: { member: Member }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors">
      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
        <p className="text-xs text-indigo-600 font-medium">{member.role}</p>
        {member.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {member.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="text-xs text-gray-400">+{member.skills.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
