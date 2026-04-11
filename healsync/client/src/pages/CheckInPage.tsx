import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckIn } from '../hooks/useCheckIn';
import { useStreak } from '../hooks/useStreak';
import { useToastContext } from '../components/ui';
import {
  SliderInput,
  MoodPicker,
  Textarea,
  Button,
  PageHeader,
  DisclaimerBanner,
  ProgressRing
} from '../components/ui';
import {
  Moon,
  Activity,
  Zap,
  CheckCircle,
  Smile,
  Lightbulb,
  BookOpen
} from 'lucide-react';

export default function CheckInPage() {
  const navigate = useNavigate();
  const { saveCheckIn, hasCheckedInToday, computeWellnessScore } = useCheckIn();
  const { recordCheckIn } = useStreak();
  const { showToast } = useToastContext();

  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedScore, setSavedScore] = useState(0);

  const [mood, setMood] = useState<number>(3);
  const [stress, setStress] = useState<number>(3);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<number>(2);
  const [stepsOrMinutes, setStepsOrMinutes] = useState<number>(20);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const checkToday = async () => {
      const checked = await hasCheckedInToday()
      setAlreadyCheckedIn(checked)
    }
    checkToday()
  }, [])

  const liveScore = computeWellnessScore({
    mood, stress, sleepHours, waterIntakeLiters, stepsOrMinutes, energyLevel, notes
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const result = await saveCheckIn({
        mood,
        stress,
        sleepHours,
        waterIntakeLiters,
        stepsOrMinutes,
        energyLevel,
        notes,
      })

      setSavedScore(result.wellnessScore)
      setIsSubmitted(true)

      const streakResult = recordCheckIn()
      if (
        streakResult &&
        streakResult.currentStreak > 1
      ) {
        showToast(
          `🔥 ${streakResult.currentStreak} day streak!`,
          'success',
          5000
        )
      }

    } catch (err: any) {
      showToast(
        'Could not save check-in. Please try again.',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (alreadyCheckedIn) {
    return (
      <div className="card max-w-md mx-auto text-center py-10 page-enter mt-10">
        <CheckCircle className="w-12 h-12 text-mint-500 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100">You're all caught up!</h2>
        <p className="text-sm text-gray-400 mt-2 mb-6">You have already logged your check-in for today.</p>
        <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
          View dashboard
        </Button>
        <div className="mt-2" />
        <Button variant="ghost" fullWidth onClick={() => navigate('/analytics')}>
          View analytics
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="card max-w-md mx-auto text-center py-10 page-enter mt-10">
        <div className="w-16 h-16 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-mint-500" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 dark:text-gray-100 mt-2">Check-in saved!</h2>
        <p className="text-sm text-gray-400 mt-1 mb-6">Great job taking care of yourself today.</p>
        
        <div className="bg-mint-50 dark:bg-mint-900/20 rounded-xl p-4 mb-6">
          <div className="text-xs text-gray-500 mb-1">Your wellness score today</div>
          <div className="text-3xl font-medium text-mint-600">
            {savedScore} <span className="text-sm text-gray-400">/ 100</span>
          </div>
        </div>

        <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>
          Back to dashboard
        </Button>
        <div className="mt-2" />
        <Button variant="ghost" fullWidth onClick={() => navigate('/analytics')}>
          View analytics
        </Button>
      </div>
    );
  }

  const stressTip = 
    stress <= 2 ? "Great! Low stress supports better sleep and immune function." :
    stress === 3 ? "Moderate stress is normal. Try a 5-min breathing exercise." :
    stress === 4 ? "High stress detected. Consider taking short breaks today." :
    "Very high stress. Please be kind to yourself today. A breathing exercise or short walk may help.";

  const activityTip =
    stepsOrMinutes <= 10 ? "Even a 10-minute walk can boost your mood significantly." :
    stepsOrMinutes <= 29 ? "Good start! Try to reach 30 minutes for full benefits." :
    stepsOrMinutes <= 59 ? "Great work! You've hit the daily activity target." :
    "Excellent! You're very active today.";

  const progressRingColor = 
    liveScore >= 75 ? '#22c55e' : 
    liveScore >= 50 ? '#f59e0b' : 
    '#ef4444';

  return (
    <div className="max-w-2xl mx-auto space-y-5 page-enter pb-24 md:pb-6 mt-6">
      <div>
        <PageHeader
          title="Daily Check-In"
          subtitle="Take 2 minutes to log how you're feeling today"
          backHref="/dashboard"
        />
        <div className="text-xs text-gray-400 mt-2 px-1">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      {/* CARD 1 — How are you feeling? */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Smile className="w-[18px] h-[18px] text-mint-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mood & Energy</h2>
        </div>

        <MoodPicker
          label="How is your mood today?"
          value={mood}
          onChange={setMood}
          size="md"
        />

        <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>

        <SliderInput
          label="Energy level"
          value={energyLevel}
          onChange={setEnergyLevel}
          min={1} max={5} step={1}
          leftLabel="Drained"
          rightLabel="Energised"
          description="How energetic do you feel overall today?"
          colorMap={{
            1: 'bg-red-100 text-red-700',
            2: 'bg-orange-100 text-orange-700',
            3: 'bg-yellow-100 text-yellow-700',
            4: 'bg-mint-100 text-mint-700',
            5: 'bg-mint-100 text-mint-700',
          }}
        />
      </div>

      {/* CARD 2 — Stress */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-[18px] h-[18px] text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Stress Level</h2>
        </div>

        <SliderInput
          label="How stressed do you feel today?"
          value={stress}
          onChange={setStress}
          min={1} max={5} step={1}
          leftLabel="Very calm"
          rightLabel="Very stressed"
          colorMap={{
            1: 'bg-mint-100 text-mint-700',
            2: 'bg-mint-100 text-mint-700',
            3: 'bg-yellow-100 text-yellow-700',
            4: 'bg-orange-100 text-orange-700',
            5: 'bg-red-100 text-red-700',
          }}
        />

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mt-3 flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">{stressTip}</p>
        </div>
      </div>

      {/* CARD 3 — Sleep & Hydration */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-[18px] h-[18px] text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Sleep & Hydration</h2>
        </div>

        <SliderInput
          label="How many hours did you sleep last night?"
          value={sleepHours}
          onChange={setSleepHours}
          min={0} max={12} step={0.5}
          leftLabel="0 hrs"
          rightLabel="12 hrs"
          colorMap={{
            0:  'bg-red-100 text-red-700',
            1:  'bg-red-100 text-red-700',
            2:  'bg-red-100 text-red-700',
            3:  'bg-red-100 text-red-700',
            4:  'bg-red-100 text-red-700',
            5:  'bg-orange-100 text-orange-700',
            6:  'bg-yellow-100 text-yellow-700',
            7:  'bg-mint-100 text-mint-700',
            8:  'bg-mint-100 text-mint-700',
            9:  'bg-calm-100 text-calm-700',
            10: 'bg-calm-100 text-calm-700',
            11: 'bg-calm-100 text-calm-700',
            12: 'bg-calm-100 text-calm-700',
          }}
        />

        <div className="border-t border-gray-100 dark:border-gray-800 my-4"></div>

        <SliderInput
          label="How much water have you had today?"
          value={waterIntakeLiters}
          onChange={setWaterIntakeLiters}
          min={0} max={5} step={0.25}
          leftLabel="0 L"
          rightLabel="5 L"
          colorMap={{
            0:    'bg-red-100 text-red-700',
            0.25: 'bg-red-100 text-red-700',
            0.5:  'bg-red-100 text-red-700',
            0.75: 'bg-red-100 text-red-700',
            1:    'bg-orange-100 text-orange-700',
            1.25: 'bg-orange-100 text-orange-700',
            1.5:  'bg-orange-100 text-orange-700',
            1.75: 'bg-orange-100 text-orange-700',
            2:    'bg-yellow-100 text-yellow-700',
            2.25: 'bg-mint-100 text-mint-700',
            2.5:  'bg-mint-100 text-mint-700',
            3:    'bg-mint-100 text-mint-700',
            3.25: 'bg-mint-100 text-mint-700',
            3.5:  'bg-mint-100 text-mint-700',
            3.75: 'bg-mint-100 text-mint-700',
            4:    'bg-mint-100 text-mint-700',
            4.25: 'bg-mint-100 text-mint-700',
            4.5:  'bg-mint-100 text-mint-700',
            4.75: 'bg-mint-100 text-mint-700',
            5:    'bg-mint-100 text-mint-700',
          }}
        />
      </div>

      {/* CARD 4 — Activity */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-[18px] h-[18px] text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Physical Activity</h2>
        </div>

        <SliderInput
          label="How many minutes of activity did you get today?"
          value={stepsOrMinutes}
          onChange={setStepsOrMinutes}
          min={0} max={120} step={5}
          leftLabel="None"
          rightLabel="2 hrs"
          description="Include walking, exercise, stretching — any movement counts"
          colorMap={{
            0:   'bg-red-100 text-red-700',
            5:   'bg-red-100 text-red-700',
            10:  'bg-orange-100 text-orange-700',
            15:  'bg-orange-100 text-orange-700',
            20:  'bg-yellow-100 text-yellow-700',
            25:  'bg-yellow-100 text-yellow-700',
            30:  'bg-mint-100 text-mint-700',
            45:  'bg-mint-100 text-mint-700',
            60:  'bg-mint-100 text-mint-700',
            90:  'bg-mint-100 text-mint-700',
            120: 'bg-mint-100 text-mint-700',
            35:  'bg-mint-100 text-mint-700',
            40:  'bg-mint-100 text-mint-700',
            50:  'bg-mint-100 text-mint-700',
            55:  'bg-mint-100 text-mint-700',
            65:  'bg-mint-100 text-mint-700',
            70:  'bg-mint-100 text-mint-700',
            75:  'bg-mint-100 text-mint-700',
            80:  'bg-mint-100 text-mint-700',
            85:  'bg-mint-100 text-mint-700',
            95:  'bg-mint-100 text-mint-700',
            100: 'bg-mint-100 text-mint-700',
            105: 'bg-mint-100 text-mint-700',
            110: 'bg-mint-100 text-mint-700',
            115: 'bg-mint-100 text-mint-700',
          }}
        />

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mt-3 flex items-start gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">{activityTip}</p>
        </div>
      </div>

      {/* CARD 5 — Notes (Optional) */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-[18px] h-[18px] text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Journal Note (optional)</h2>
        </div>

        <Textarea
          label="Anything on your mind today?"
          placeholder="How was your day? Any thoughts, wins, or struggles..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          showCount
          rows={4}
        />
        
        <p className="text-xs text-gray-400 mt-2">
          Your notes are private and saved only on your device.
        </p>
      </div>

      {/* WELLNESS SCORE PREVIEW */}
      <div className="card bg-gradient-to-r from-mint-50 to-calm-50 dark:from-mint-900/20 dark:to-calm-900/20 border border-mint-100 dark:border-mint-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Estimated wellness score</div>
            <div className="text-2xl font-medium text-gray-800 dark:text-gray-100">
              {liveScore} <span className="text-sm text-gray-400">/ 100</span>
            </div>
          </div>
          <ProgressRing
            value={liveScore}
            size={56}
            strokeWidth={5}
            color={progressRingColor}
          />
        </div>
      </div>

      <DisclaimerBanner />

      <Button
        variant="primary"
        fullWidth
        size="lg"
        loading={isSubmitting}
        onClick={handleSubmit}
      >
        Save today's check-in
      </Button>
    </div>
  );
}
