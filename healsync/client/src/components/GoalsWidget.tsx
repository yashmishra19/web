import { useState } from 'react';
import { useGoals } from '../hooks/useGoals';
import GoalModal from './GoalModal';
import { Plus, Trash2, Check, Target } from 'lucide-react';

interface GoalsWidgetProps {}

export default function GoalsWidget({}: GoalsWidgetProps = {}) {
  const [showModal, setShowModal] = useState(false);
  const { goals, addGoal, toggleGoal, deleteGoal } = useGoals();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-gray-500 dark:text-gray-400" />
          <h2 className="text-sm font-medium text-gray-800 dark:text-gray-100">Health goals</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-8 h-8 rounded-full bg-mint-500 hover:bg-mint-600 text-white flex items-center justify-center transition-colors"
          aria-label="Add goal"
        >
          <Plus size={16} />
        </button>
      </div>

      {!goals.length ? (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">No goals yet</p>
          <p className="text-xs text-gray-400 mt-1">Tap + to add your first health goal</p>
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map(g => (
            <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <button 
                onClick={() => toggleGoal(g.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  ${g.completed 
                    ? 'bg-mint-500 border-mint-500' 
                    : 'border-gray-300 dark:border-gray-600'
                  }`}
              >
                {g.completed && <Check size={12} className="text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-gray-700 dark:text-gray-300 truncate ${g.completed ? 'line-through opacity-60' : ''}`}>
                  {g.title}
                </p>
                {g.target && <p className="text-xs text-gray-400 truncate">{g.target}</p>}
              </div>
              <button 
                onClick={() => deleteGoal(g.id)}
                className="text-gray-300 hover:text-red-400 shrink-0 ml-auto transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <GoalModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSave={(goal) => {
          addGoal(goal);
          setShowModal(false);
        }}
      />
    </div>
  );
}
