import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToastContext } from '@/components/ui';
import { profileApi } from '../api';
import { useBackend } from '../context/BackendContext';
import Button from '@/components/ui/Button';
import type {
  Gender,
  ActivityLevel,
  DietPreference,
  HealthGoal,
  OnboardingPayload,
} from '../../../shared/types';

// ─── Step definitions ────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

interface FormData extends OnboardingPayload {}

const DEFAULT_FORM: FormData = {
  age:               25,
  gender:            'prefer_not_to_say',
  heightCm:          170,
  weightKg:          70,
  sleepHours:        7,
  activityLevel:     'lightly_active',
  waterIntakeLiters: 2,
  dietPreference:    'omnivore',
  stressLevel:       3,
  moodBaseline:      3,
  workStudyHours:    8,
  mainGoal:          'general_health',
  existingConditions: [],
};

// ─── Option arrays ───────────────────────────────────────────────────────────

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',               label: '♂  Male'             },
  { value: 'female',             label: '♀  Female'           },
  { value: 'non_binary',         label: '⚧  Non-binary'       },
  { value: 'prefer_not_to_say',  label: '—  Prefer not to say' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary',        label: 'Sedentary',         desc: 'Desk job, little movement'         },
  { value: 'lightly_active',   label: 'Lightly active',    desc: '1–3 light workouts / week'         },
  { value: 'moderately_active',label: 'Moderately active', desc: '3–5 moderate workouts / week'      },
  { value: 'very_active',      label: 'Very active',       desc: '6–7 intense workouts / week'       },
  { value: 'extra_active',     label: 'Extra active',      desc: 'Athlete / very physical job'       },
];

const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
  { value: 'omnivore',     label: '🍖 Omnivore'      },
  { value: 'vegetarian',   label: '🥗 Vegetarian'    },
  { value: 'vegan',        label: '🌱 Vegan'         },
  { value: 'pescatarian',  label: '🐟 Pescatarian'   },
  { value: 'keto',         label: '🥑 Keto'          },
  { value: 'paleo',        label: '🦴 Paleo'         },
  { value: 'gluten_free',  label: '🌾 Gluten-free'   },
  { value: 'other',        label: '🍽️ Other'         },
];

const GOAL_OPTIONS: { value: HealthGoal; label: string; icon: string }[] = [
  { value: 'reduce_stress',     label: 'Reduce stress',       icon: '🧘' },
  { value: 'improve_sleep',     label: 'Improve sleep',       icon: '😴' },
  { value: 'improve_fitness',   label: 'Improve fitness',     icon: '💪' },
  { value: 'mental_wellness',   label: 'Mental wellness',     icon: '🧠' },
  { value: 'better_nutrition',  label: 'Better nutrition',    icon: '🥗' },
  { value: 'lose_weight',       label: 'Lose weight',         icon: '⚖️' },
  { value: 'gain_muscle',       label: 'Gain muscle',         icon: '🏋️' },
  { value: 'general_health',    label: 'General health',      icon: '❤️' },
];

// ─── Helper components ───────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {children}
    </label>
  );
}

function NumberInput({
  label, value, onChange, min, max, step = 1, unit,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-mint-400 text-sm"
        />
        {unit && <span className="text-sm text-gray-400 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

function StressSlider({
  label, value, onChange, leftLabel, rightLabel,
}: {
  label: string; value: number; onChange: (v: number) => void;
  leftLabel: string; rightLabel: string;
}) {
  return (
    <div>
      <Label>{label} — <span className="text-mint-600 font-semibold">{value}</span>/5</Label>
      <input
        type="range" min={1} max={5} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-mint-500"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate                     = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { showToast }                = useToastContext();
  const { isOnline }                 = useBackend();

  const [step, setStep]           = useState(1);
  const [formData, setFormData]   = useState<FormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData(prev => ({ ...prev, [key]: value }));
  }

  const progressPct = (step / TOTAL_STEPS) * 100;

  // ── Step pages ──────────────────────────────────────────────────────────────

  function StepAboutYou() {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Tell us about yourself
        </h2>

        {/* Gender */}
        <div>
          <Label>Gender</Label>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('gender', opt.value)}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors text-left
                  ${formData.gender === opt.value
                    ? 'bg-mint-50 border-mint-400 text-mint-700 dark:bg-mint-900/30 dark:border-mint-600 dark:text-mint-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <NumberInput label="Age"       value={formData.age}       onChange={v => set('age', v)}       min={13} max={100} unit="years" />
        <NumberInput label="Height"    value={formData.heightCm}  onChange={v => set('heightCm', v)}  min={100} max={250} unit="cm" />
        <NumberInput label="Weight"    value={formData.weightKg}  onChange={v => set('weightKg', v)}  min={30} max={300} step={0.5} unit="kg" />
      </div>
    );
  }

  function StepLifestyle() {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Your lifestyle
        </h2>

        {/* Activity level */}
        <div>
          <Label>Activity level</Label>
          <div className="space-y-2">
            {ACTIVITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('activityLevel', opt.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors text-left
                  ${formData.activityLevel === opt.value
                    ? 'bg-mint-50 border-mint-400 text-mint-700 dark:bg-mint-900/30 dark:border-mint-600 dark:text-mint-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span className="text-gray-400 ml-2 text-xs">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <NumberInput label="Work / study hours per day" value={formData.workStudyHours} onChange={v => set('workStudyHours', v)} min={0} max={18} unit="hrs" />
        <NumberInput label="Average sleep hours" value={formData.sleepHours} onChange={v => set('sleepHours', v)} min={2} max={14} step={0.5} unit="hrs" />
        <NumberInput label="Water intake" value={formData.waterIntakeLiters} onChange={v => set('waterIntakeLiters', v)} min={0} max={6} step={0.25} unit="L / day" />
      </div>
    );
  }

  function StepWellness() {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Wellness baseline
        </h2>

        <StressSlider
          label="Typical stress level"
          value={formData.stressLevel}
          onChange={v => set('stressLevel', v)}
          leftLabel="Very calm"
          rightLabel="Very stressed"
        />
        <StressSlider
          label="Typical mood"
          value={formData.moodBaseline}
          onChange={v => set('moodBaseline', v)}
          leftLabel="Low"
          rightLabel="Great"
        />

        {/* Diet */}
        <div>
          <Label>Diet preference</Label>
          <div className="grid grid-cols-2 gap-2">
            {DIET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('dietPreference', opt.value)}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors text-left
                  ${formData.dietPreference === opt.value
                    ? 'bg-mint-50 border-mint-400 text-mint-700 dark:bg-mint-900/30 dark:border-mint-600 dark:text-mint-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function StepGoal() {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          What's your main goal?
        </h2>
        <p className="text-sm text-gray-400">
          HealSync will personalise your recommendations around this.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('mainGoal', opt.value)}
              className={`px-3 py-3 rounded-xl text-sm border transition-colors text-left flex items-center gap-2
                ${formData.mainGoal === opt.value
                  ? 'bg-mint-50 border-mint-400 text-mint-700 dark:bg-mint-900/30 dark:border-mint-600 dark:text-mint-300 font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (isOnline) {
        try {
          await profileApi.saveOnboarding(formData as OnboardingPayload);
        } catch {
          // silent — local state still updates below
        }
      }

      // Mark user as onboarded in local state
      completeOnboarding(formData as OnboardingPayload);

      showToast(
        `Welcome to HealSync, ${user?.name?.split(' ')[0]}! 🌿`,
        'success',
        5000
      );
      navigate('/dashboard');

    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-calm-50
                    dark:from-gray-950 dark:to-gray-900
                    flex items-center justify-center p-4">
      <div className="card w-full max-w-lg">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-mint-500 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                fill="none" stroke="white" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                className="h-6 w-6">
                <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.75 8.66A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Let's personalise HealSync
              </h1>
              <p className="text-xs text-gray-400">
                Step {step} of {TOTAL_STEPS}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-mint-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          {step === 1 && <StepAboutYou   />}
          {step === 2 && <StepLifestyle  />}
          {step === 3 && <StepWellness   />}
          {step === 4 && <StepGoal       />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep(s => s - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}

          {step < TOTAL_STEPS ? (
            <Button
              variant="primary"
              onClick={() => setStep(s => s + 1)}
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              loading={isSubmitting}
              onClick={handleSubmit}
              className="flex-1"
            >
              Complete setup
            </Button>
          )}
        </div>

        {/* Skip */}
        <p className="text-xs text-gray-400 text-center mt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
