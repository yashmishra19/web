import { useState } from 'react';
import { useJournal } from '../hooks/useJournal';
import { useToastContext } from '../components/ui';
import {
  PageHeader, Button, Textarea, MoodPicker, EmptyState, SkeletonCard
} from '../components/ui';
import {
  Plus, Trash2, Edit3, BookOpen, ChevronDown, ChevronUp, X, Save, Search, AlertCircle
} from 'lucide-react';

export default function JournalPage() {
  const { entries, isLoading, error, addEntry, deleteEntry, updateEntry } = useJournal();
  const { showToast } = useToastContext();

  const [isWriting, setIsWriting] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newMoodTag, setNewMoodTag] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMoodTag, setEditMoodTag] = useState<number | null>(null);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const promptChips = [
    "What am I grateful for today?",
    "What challenged me today and how did I handle it?",
    "What do I want to let go of?",
  ];

  const moodEmojis: Record<number, string> = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😊' };

  const handleSaveEntry = () => {
    setIsSaving(true);
    setTimeout(() => {
      addEntry({ content: newContent, moodTag: newMoodTag !== null ? String(newMoodTag) : undefined } as any);
      setNewContent('');
      setNewMoodTag(null);
      setIsWriting(false);
      setIsSaving(false);
      if (showToast) showToast('Journal entry saved 🌿', 'success');
    }, 500);
  };

  const handleUpdateEntry = (id: string) => {
    updateEntry(id, editContent, editMoodTag);
    setEditingId(null);
    if (showToast) showToast('Entry updated', 'success');
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    setDeleteConfirmId(null);
    if (showToast) showToast('Entry deleted', 'info');
  };

  const startEditing = (entry: any) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setEditMoodTag(entry.moodTag ? parseInt(entry.moodTag, 10) : null);
  };

  const filteredEntries = entries.filter((e) =>
    e.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const moodCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  entries.forEach((e) => {
    if (e.moodTag) {
      const tag = parseInt(e.moodTag, 10);
      if (!isNaN(tag)) moodCounts[tag]++;
    }
  });
  const maxCount = Math.max(...Object.values(moodCounts), 1);

  if (error) {
    return (
      <div className="card mt-12 max-w-sm mx-auto border-red-100 bg-red-50 dark:bg-red-900/20 text-center py-8">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <div className="text-sm font-medium text-red-700">Something went wrong</div>
        <div className="text-xs text-red-500 mb-4">{error}</div>
        <Button variant="secondary" onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 page-enter max-w-2xl mx-auto pb-24 md:pb-6 mt-6 px-1">
      <PageHeader
        title="Journal"
        subtitle="A private space to reflect on your thoughts and feelings"
        action={
          <Button
            variant={isWriting ? 'ghost' : 'primary'}
            onClick={() => {
              setIsWriting(!isWriting);
              setNewContent('');
              setNewMoodTag(null);
            }}
          >
            <div className="flex items-center gap-2">
              {isWriting ? <X size={16} /> : <Plus size={16} />}
              {isWriting ? 'Cancel' : 'New entry'}
            </div>
          </Button>
        }
      />

      {isWriting && (
        <div className="page-enter card border-2 border-mint-200 dark:border-mint-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-mint-500" />
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <MoodPicker
            label="How are you feeling right now?"
            value={newMoodTag}
            onChange={setNewMoodTag}
            size="sm"
          />

          <div className="mt-4">
            <Textarea
              label=""
              placeholder="What's on your mind today? Write freely — this is just for you..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              maxLength={2000}
              showCount
              rows={6}
              autoFocus
            />
          </div>

          {newContent.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mt-2">
              <div className="text-xs text-gray-400 mb-2">Need a prompt? Try one of these:</div>
              <div className="flex flex-wrap gap-2">
                {promptChips.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setNewContent(prompt)}
                    className="text-xs text-gray-500 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:border-mint-300 hover:text-mint-600 cursor-pointer transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div>{/* character count hint is handled by Textarea showCount */}</div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsWriting(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={isSaving}
                disabled={newContent.trim().length === 0}
                onClick={handleSaveEntry}
              >
                <div className="flex items-center gap-2">
                  <Save size={16} />
                  Save entry
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {entries.length > 3 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search your entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-10 py-2.5 text-sm outline-none focus:border-mint-500 dark:focus:border-mint-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <>
            <SkeletonCard showAvatar lines={3} />
            <SkeletonCard showAvatar lines={3} />
            <SkeletonCard showAvatar lines={3} />
          </>
        ) : filteredEntries.length === 0 && searchQuery ? (
          <EmptyState
            title="No entries found"
            description={`No journal entries match "${searchQuery}"`}
            action={{ label: 'Clear search', onClick: () => setSearchQuery('') }}
          />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={24} className="text-gray-400" />}
            title="Your journal is empty"
            description="Write your first entry to start reflecting on your day"
            action={{ label: 'Write first entry', onClick: () => setIsWriting(true) }}
          />
        ) : (
          filteredEntries.map((entry) => {
            const isEditing = editingId === entry.id;
            const isExpanded = expandedId === entry.id;
            const contentPreview = isExpanded ? entry.content : entry.content.slice(0, 150) + (entry.content.length > 150 ? '...' : '');

            return (
              <div key={entry.id} className="card transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    {entry.moodTag && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-lg flex items-center justify-center">
                        {moodEmojis[parseInt(entry.moodTag || '', 10)] || ''}
                      </div>
                    )}
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      {new Date(entry.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(entry.date).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditing(entry)}
                      className="px-1.5 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(entry.id)}
                      className="px-1.5 py-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    {entry.content.length > 150 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="px-1.5 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-2">
                    <MoodPicker value={editMoodTag} onChange={setEditMoodTag} size="sm" />
                    <div className="mt-2">
                      <Textarea
                        label=""
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        maxLength={2000}
                        showCount
                        rows={5}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" onClick={() => handleUpdateEntry(entry.id)}>Save changes</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                      {contentPreview}
                    </div>
                    {entry.content.length > 150 && (
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="text-xs text-mint-600 hover:text-mint-700 cursor-pointer mt-2"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </div>
                    )}
                  </div>
                )}

                {deleteConfirmId === entry.id && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 mt-4 border border-red-100 dark:border-red-800 animate-in slide-in-from-top-2 fade-in">
                    <div className="text-xs text-red-700 dark:text-red-400 mb-3">
                      Delete this entry? This cannot be undone.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
                      >
                        Keep it
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {entries.length >= 3 && (
        <div className="card">
          <div className="text-sm font-medium mb-4 text-gray-800 dark:text-gray-200">Mood in your journal</div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((level) => {
              const count = moodCounts[level];
              const percent = (count / maxCount) * 100;
              return (
                <div key={level} className="flex items-center gap-3">
                  <div className="text-sm w-4">{moodEmojis[level]}</div>
                  <div className="text-xs text-gray-500 w-14">{
                    level === 5 ? 'Great' : level === 4 ? 'Good' : level === 3 ? 'Neutral' : level === 2 ? 'Low' : 'Very low'
                  }</div>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="bg-mint-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 w-4 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
