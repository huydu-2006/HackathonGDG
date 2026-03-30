'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/app/lib/api';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Plus, Trash2, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MemberInput {
  name: string;
  role: string;
  skills: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [totalWeeks, setTotalWeeks] = useState(8);
  const [members, setMembers] = useState<MemberInput[]>([{ name: '', role: '', skills: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMember = () => setMembers([...members, { name: '', role: '', skills: '' }]);

  const removeMember = (index: number) => {
    if (members.length === 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof MemberInput, value: string) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        total_weeks: totalWeeks,
        members: members
          .filter(m => m.name.trim())
          .map(m => ({
            name: m.name.trim(),
            role: m.role.trim(),
            skills: m.skills.split(',').map(s => s.trim()).filter(Boolean),
          })),
      };
      const project = await api.createProject(payload);
      router.push(`/projects/${project.id}`);
    } catch {
      setError('Failed to create project. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-500 mt-1">Set up a new AI-powered research project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Project Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Machine Learning Research on Climate Data"
              required
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your research project goals and scope..."
              className="w-full text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Project Duration: <span className="text-indigo-600 font-semibold">{totalWeeks} weeks</span>
            </label>
            <input
              type="range"
              min={4}
              max={12}
              value={totalWeeks}
              onChange={e => setTotalWeeks(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>4 weeks</span>
              <span>12 weeks</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Team Members</h2>
            <button
              type="button"
              onClick={addMember}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Member
            </button>
          </div>

          {members.map((member, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Member {index + 1}</span>
                </div>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={e => updateMember(index, 'name', e.target.value)}
                    placeholder="Full name"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={e => updateMember(index, 'role', e.target.value)}
                    placeholder="e.g., Researcher"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Skills <span className="text-gray-400">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={member.skills}
                  onChange={e => updateMember(index, 'skills', e.target.value)}
                  placeholder="e.g., Python, Machine Learning, Data Analysis"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
