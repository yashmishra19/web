import { useState } from 'react';
import { Button, Input, Select } from './ui';
import { X, Check } from 'lucide-react';
import type { HealthGoal } from '../hooks/useGoals';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: HealthGoal) => void;
}

const TEMPLATES = [
  { title: 'Walk 8000 steps daily', category: 'fitness', target: '8000 steps/day' },
  { title: 'Drink 2.5L water daily', category: 'nutrition', target: '2.5L/day' },
  { title: 'Sleep 8 hours nightly', category: 'sleep', target: '8 hrs/night' },
  { title: 'Meditate for 10 minutes', category: 'mental', target: '10 min/day' },
  { title: 'Exercise 3 times a week', category: 'fitness', target: '3x/week' },
  { title: 'Reduce stress to level 2', category: 'mental', target: 'Stress ≤ 2' },
  { title: 'Log vitals daily', category: 'vitals', target: 'Daily' },
  { title: 'No screens after 10pm', category: 'sleep', target: 'Daily' },
] as const;

const CATEGORIES = [
  { value: 'fitness', label: 'Fitness' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'mental', label: 'Mental Health' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'vitals', label: 'Vitals' },
  { value: 'custom', label: 'Custom' },
];

export default function GoalModal({ isOpen, onClose, onSave }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HealthGoal['category']>('fitness');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    
    const newGoal: HealthGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      category,
      target,
      deadline,
      completed: false,
      createdAt: new Date().toISOString()
    };
    onSave(newGoal);
    
    // reset
    setTitle('');
    setCategory('fitness');
    setTarget('');
    setDeadline('');
  };

  const applyTemplate = (t: typeof TEMPLATES[number]) => {
    setTitle(t.title);
    setCategory(t.category);
    setTarget(t.target);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-gray-800 dark:text-gray-100">Add health goal</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-2 mt-4">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t, idx) => (
            <div 
              key={idx}
              onClick={() => applyTemplate(t)}
              className={`text-xs px-3 py-1.5 rounded-xl border cursor-pointer transition-colors
                ${title === t.title 
                  ? 'border-mint-400 bg-mint-50 text-mint-700 dark:bg-mint-900/20 dark:text-mint-400' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-mint-100 hover:text-mint-700 dark:hover:bg-mint-900/30 dark:hover:text-mint-400 border-transparent'
                }`}
            >
              {t.title}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 text-center my-4">or create custom</div>

        <div className="space-y-4 mb-6">
          <Input 
            label="Goal" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Drink more tea"
            required 
          />
          <Select 
            label="Category" 
            options={CATEGORIES} 
            value={category} 
            onChange={e => setCategory(e.target.value as HealthGoal['category'])} 
          />
          <Input 
            label="Target" 
            placeholder="e.g. 30 min/day" 
            value={target}
            onChange={e => setTarget(e.target.value)}
          />
          <Input 
            label="By when" 
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>

        <Button 
          variant="primary" 
          className="w-full"
          onClick={handleSave}
          disabled={!title.trim()}
          leftIcon={<Check size={16} />}
        >
          Add goal
        </Button>
      </div>
    </div>
  );
}
