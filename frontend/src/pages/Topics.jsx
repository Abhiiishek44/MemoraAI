import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, Library, MoreVertical, Plus, X, Pencil, Trash2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useTopics } from '../context/TopicContext';

/* ─── Helpers ─────────────────────────────────────── */
const topicId = (t) => t.id ?? t._id;

/* ─── Skeleton Card ───────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-gray-100" />
          <div className="h-3 w-48 rounded bg-gray-100" />
        </div>
      </div>
      <div className="h-2 w-full rounded bg-gray-100 mb-6" />
      <div className="flex gap-6 border-t border-gray-100 pt-4">
        <div className="h-3 w-20 rounded bg-gray-100" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
    </div>
  );
}

/* ─── Topic Form Modal ────────────────────────────── */
function TopicFormModal({ initial, onClose, onSubmit, submitting }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const isEdit = Boolean(initial);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">{isEdit ? 'Edit Topic' : 'Create New Topic'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={submitting}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="topicName">Topic Name</Label>
              <Input
                id="topicName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Machine Learning"
                autoFocus
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topicDesc">Description (Optional)</Label>
              <Textarea
                id="topicDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe this topic..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !name.trim()}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? 'Saving…' : 'Creating…'}
                  </span>
                ) : isEdit ? 'Save Changes' : 'Create Topic'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Delete Confirm Modal ────────────────────────── */
function DeleteConfirmModal({ topic, onClose, onConfirm, submitting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg text-red-600">Delete Topic</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={submitting}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900">"{topic.name}"</span>? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Topic Card Dropdown ─────────────────────────── */
function TopicCardMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="text-gray-400 hover:text-gray-900 rounded p-1 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Topic options"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 rounded-lg border border-gray-100 bg-white shadow-lg py-1">
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="h-4 w-4 text-gray-400" /> Edit
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────── */
export default function Topics() {
  const navigate = useNavigate();
  const { topics, loading, error, fetchTopics, addTopic, editTopic, removeTopic } = useTopics();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // topic object being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // topic object being deleted
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Load topics on mount
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  /* ── Create ── */
  const handleCreate = async (formData) => {
    setSubmitting(true);
    setActionError(null);
    try {
      await addTopic(formData);
      setShowCreate(false);
    } catch (err) {
      setActionError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to create topic. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = async (formData) => {
    if (!editTarget) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await editTopic(topicId(editTarget), formData);
      setEditTarget(null);
    } catch (err) {
      setActionError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to update topic. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await removeTopic(topicId(deleteTarget));
      setDeleteTarget(null);
    } catch (err) {
      setActionError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to delete topic. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progressColor = (pct) => {
    if (pct >= 80) return '[&>div]:bg-green-500';
    if (pct >= 60) return '[&>div]:bg-blue-500';
    return '[&>div]:bg-orange-500';
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Topics</h1>
          <p className="mt-2 text-gray-500">Manage your isolated learning workspaces.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/upload')} variant="outline" className="gap-2">
            Upload Material
          </Button>
          <Button onClick={() => { setActionError(null); setShowCreate(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Topic
          </Button>
        </div>
      </div>

      {/* Action-level error banner */}
      {actionError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Fetch error banner */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTopics}
            className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && topics.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No topics yet</h3>
          <p className="mt-2 text-gray-500">Create your first topic workspace to get started.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => { setActionError(null); setShowCreate(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Create Topic
            </Button>
          </div>
        </div>
      )}

      {/* Topic Grid */}
      {!loading && topics.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topicId(topic)}
              className="group cursor-pointer hover:border-blue-200 transition-colors"
              onClick={() => navigate(`/topics/${topicId(topic)}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    {topic.description && (
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{topic.description}</p>
                    )}
                  </div>
                </div>
                <TopicCardMenu
                  onEdit={() => { setActionError(null); setEditTarget(topic); }}
                  onDelete={() => { setActionError(null); setDeleteTarget(topic); }}
                />
              </CardHeader>
              <CardContent className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">Understanding</span>
                  <span className="font-bold text-gray-900">{topic.understanding ?? 0}%</span>
                </div>
                <Progress
                  value={topic.understanding ?? 0}
                  className={`h-2 ${progressColor(topic.understanding ?? 0)}`}
                />
                <div className="mt-6 flex gap-6 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Layers className="h-4 w-4 text-gray-400" />
                    <span><strong className="text-gray-900">{topic.flashcards ?? 0}</strong> Flashcards</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Library className="h-4 w-4 text-gray-400" />
                    <span><strong className="text-gray-900">{topic.tests ?? 0}</strong> Tests</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/upload?topicId=${topicId(topic)}`);
                    }}
                  >
                    Add Material
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <TopicFormModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <TopicFormModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEdit}
          submitting={submitting}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          topic={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          submitting={submitting}
        />
      )}
    </div>
  );
}
