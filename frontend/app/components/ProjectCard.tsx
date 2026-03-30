'use client';
import Link from 'next/link';
import { Project } from '@/app/lib/api';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { Users, CheckSquare, Calendar } from 'lucide-react';

export default function ProjectCard({ project }: { project: Project }) {
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{project.description}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="mt-4">
          <ProgressBar value={progress} showLabel />
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{completedTasks}/{totalTasks} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{project.members.length} members</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{project.total_weeks}w</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
