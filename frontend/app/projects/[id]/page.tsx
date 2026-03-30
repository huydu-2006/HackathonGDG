'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api, Project, Task } from '@/app/lib/api';
import StatusBadge from '@/app/components/StatusBadge';
import ProgressBar from '@/app/components/ProgressBar';
import SmartGoalCard from '@/app/components/SmartGoalCard';
import MemberCard from '@/app/components/MemberCard';
import TaskCard from '@/app/components/TaskCard';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { ArrowLeft, Zap, Target, Users, ListChecks, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingWBS, setGeneratingWBS] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wbsMessage, setWbsMessage] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const data = await api.getProject(id);
      setProject(data);
    } catch {
      setError('Failed to load project.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleGenerateWBS = async () => {
    setGeneratingWBS(true);
    setWbsMessage(null);
    try {
      await api.generateWBS(id);
      setWbsMessage('WBS generated successfully!');
      await fetchProject();
    } catch {
      setWbsMessage('Failed to generate WBS. Please try again.');
    } finally {
      setGeneratingWBS(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    await api.updateTask(id, taskId, { status: 'in_progress' });
    await fetchProject();
  };

  const handleSubmitTask = async (taskId: string, content: string) => {
    await api.submitTask(id, taskId, content);
    await fetchProject();
  };

  const handleEvaluateTask = async (taskId: string) => {
    await api.evaluateTask(id, taskId);
    await fetchProject();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-gray-600 mb-4">{error || 'Project not found.'}</p>
        <Link href="/" className="text-indigo-600 hover:underline text-sm">← Back to Dashboard</Link>
      </div>
    );
  }

  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const tasksByWeek = project.tasks.reduce<Record<number, Task[]>>((acc, task) => {
    if (!acc[task.week]) acc[task.week] = [];
    acc[task.week].push(task);
    return acc;
  }, {});

  const weeks = Object.keys(tasksByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-gray-500">{project.description}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{project.total_weeks} weeks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{project.members.length} members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4" />
                  <span>{completedTasks}/{totalTasks} tasks</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateWBS}
                disabled={generatingWBS}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {generatingWBS ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate WBS
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-5">
            <ProgressBar value={progress} showLabel />
          </div>

          {wbsMessage && (
            <div className={`mt-4 text-sm px-4 py-2.5 rounded-lg ${
              wbsMessage.includes('success')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {wbsMessage}
            </div>
          )}
        </div>
      </div>

      {project.smart_goal && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">SMART Goals</h2>
          </div>
          <SmartGoalCard goal={project.smart_goal} />
        </div>
      )}

      {project.members.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.members.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <ListChecks className="w-4 h-4 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          {totalTasks > 0 && (
            <span className="text-sm text-gray-500">({completedTasks}/{totalTasks} completed)</span>
          )}
        </div>

        {totalTasks === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-200 rounded-xl">
            <ListChecks className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No tasks yet</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Generate WBS&quot; to create your project work breakdown structure</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weeks.map(week => (
              <div key={week}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    Week {week}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">
                    {tasksByWeek[week].filter(t => t.status === 'completed').length}/{tasksByWeek[week].length} done
                  </span>
                </div>
                <div className="space-y-3">
                  {tasksByWeek[week].map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projectId={id}
                      onStartTask={handleStartTask}
                      onSubmitTask={handleSubmitTask}
                      onEvaluateTask={handleEvaluateTask}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
