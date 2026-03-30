'use client';
import { useState } from 'react';
import { Task } from '@/app/lib/api';
import StatusBadge from './StatusBadge';
import LoadingSpinner from './LoadingSpinner';
import { ChevronDown, ChevronUp, Calendar, User, BookOpen, Send, Star, Play } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  projectId: string;
  onStartTask: (taskId: string) => Promise<void>;
  onSubmitTask: (taskId: string, content: string) => Promise<void>;
  onEvaluateTask: (taskId: string) => Promise<void>;
}

export default function TaskCard({ task, projectId, onStartTask, onSubmitTask, onEvaluateTask }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading('start');
    try { await onStartTask(task.id); } finally { setLoading(null); }
  };

  const handleSubmit = async () => {
    if (!submissionContent.trim()) return;
    setLoading('submit');
    try {
      await onSubmitTask(task.id, submissionContent);
      setSubmissionContent('');
      setShowSubmitForm(false);
    } finally { setLoading(null); }
  };

  const handleEvaluate = async () => {
    setLoading('evaluate');
    try { await onEvaluateTask(task.id); } finally { setLoading(null); }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Week {task.week}
              </span>
              <StatusBadge status={task.status} />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mt-2">{task.title}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-1"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          {task.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.deadline).toLocaleDateString()}</span>
            </div>
          )}
          {task.assigned_to && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{task.assigned_to}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {task.status === 'pending' && (
            <button
              onClick={handleStart}
              disabled={loading === 'start'}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading === 'start' ? <LoadingSpinner size="sm" /> : <Play className="w-3 h-3" />}
              Start Task
            </button>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Send className="w-3 h-3" />
              Submit Work
            </button>
          )}
          {task.status === 'submitted' && (
            <button
              onClick={handleEvaluate}
              disabled={loading === 'evaluate'}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading === 'evaluate' ? <LoadingSpinner size="sm" /> : <Star className="w-3 h-3" />}
              Evaluate (AI)
            </button>
          )}
          {task.status === 'needs_revision' && (
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Send className="w-3 h-3" />
              Resubmit
            </button>
          )}
        </div>
      </div>

      {showSubmitForm && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <label className="block text-xs font-medium text-gray-700 mb-2">Submission Content</label>
          <textarea
            value={submissionContent}
            onChange={e => setSubmissionContent(e.target.value)}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="Describe your work, paste links, or provide details about your submission..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSubmit}
              disabled={loading === 'submit' || !submissionContent.trim()}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loading === 'submit' ? <LoadingSpinner size="sm" /> : <Send className="w-3 h-3" />}
              Submit
            </button>
            <button
              onClick={() => setShowSubmitForm(false)}
              className="text-xs text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
          {task.resources.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Resources</span>
              </div>
              <ul className="space-y-1">
                {task.resources.map((r, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {task.submission && (
            <div>
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Submission</span>
              <p className="text-xs text-gray-600 mt-1 bg-white border border-gray-200 rounded-lg p-3 leading-relaxed">
                {task.submission}
              </p>
            </div>
          )}

          {task.feedback && (
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Feedback</span>
              <p className="text-xs text-gray-700 mt-1 bg-indigo-50 border border-indigo-100 rounded-lg p-3 leading-relaxed">
                {task.feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
