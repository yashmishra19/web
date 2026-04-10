import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Wind, Check } from 'lucide-react';
import { PageHeader, Card, Button, Badge, DisclaimerBanner, MoodPicker } from '../components/ui';

const TECHNIQUES = [
  {
    id: 'box',
    name: 'Box breathing',
    description: 'Used by Navy SEALs to stay calm under pressure',
    benefit: 'Reduces stress and anxiety',
    phases: [
      { label: 'Inhale',  duration: 4, color: '#22c55e' },
      { label: 'Hold',    duration: 4, color: '#3b82f6' },
      { label: 'Exhale',  duration: 4, color: '#f59e0b' },
      { label: 'Hold',    duration: 4, color: '#8b5cf6' },
    ],
    totalCycles: 4,
    difficulty: 'Beginner',
  },
  {
    id: '478',
    name: '4-7-8 breathing',
    description: 'A natural tranquiliser for the nervous system',
    benefit: 'Helps with sleep and anxiety',
    phases: [
      { label: 'Inhale',  duration: 4,  color: '#22c55e' },
      { label: 'Hold',    duration: 7,  color: '#3b82f6' },
      { label: 'Exhale',  duration: 8,  color: '#f59e0b' },
    ],
    totalCycles: 4,
    difficulty: 'Intermediate',
  },
  {
    id: 'calm',
    name: 'Calm breathing',
    description: 'Simple slow breathing to activate rest mode',
    benefit: 'Lowers heart rate quickly',
    phases: [
      { label: 'Inhale',  duration: 5, color: '#22c55e' },
      { label: 'Exhale',  duration: 5, color: '#3b82f6' },
    ],
    totalCycles: 6,
    difficulty: 'Beginner',
  },
  {
    id: 'energise',
    name: 'Energising breath',
    description: 'Quick breathing to boost alertness',
    benefit: 'Increases energy and focus',
    phases: [
      { label: 'Inhale',  duration: 3, color: '#22c55e' },
      { label: 'Hold',    duration: 1, color: '#3b82f6' },
      { label: 'Exhale',  duration: 2, color: '#f59e0b' },
    ],
    totalCycles: 6,
    difficulty: 'Beginner',
  },
];

export default function BreathingPage() {
  const navigate = useNavigate();
  
  const [selectedTechnique, setSelectedTechnique] = useState(TECHNIQUES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(TECHNIQUES[0].phases[0].duration);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [postMood, setPostMood] = useState<number | null>(null);
  
  const [totalSessions, setTotalSessions] = useState<number>(() => {
    const saved = localStorage.getItem('healsync_breath_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setPhaseSecondsLeft((prev) => {
          if (prev > 1) return prev - 1;

          // Move to next phase
          setCurrentPhaseIndex((prevPhase) => {
            const phases = selectedTechnique.phases;
            const nextPhase = (prevPhase + 1) % phases.length;
            const isNewCycle = nextPhase === 0;

            if (isNewCycle) {
              setCurrentCycle((prevCycle) => {
                if (prevCycle >= selectedTechnique.totalCycles) {
                  // Session complete
                  setIsRunning(false);
                  setIsComplete(true);
                  setTotalSessions((s) => {
                    const newTotal = s + 1;
                    localStorage.setItem('healsync_breath_sessions', newTotal.toString());
                    return newTotal;
                  });
                  return prevCycle;
                }
                return prevCycle + 1;
              });
            }

            // Set seconds for next phase
            setPhaseSecondsLeft(phases[nextPhase].duration);
            return nextPhase;
          });

          return 0; // will be overwritten by setPhaseSecondsLeft above
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedTechnique]);

  const resetExercise = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setPhaseSecondsLeft(selectedTechnique.phases[0].duration);
    setCurrentCycle(1);
    setIsComplete(false);
    setPostMood(null);
  }, [selectedTechnique]);

  useEffect(() => {
    resetExercise();
  }, [selectedTechnique, resetExercise]);

  const currentPhase = selectedTechnique.phases[currentPhaseIndex];
  const isStarted = isRunning || currentCycle > 1 || currentPhaseIndex > 0;
  
  const totalSeconds = selectedTechnique.phases.reduce((sum, p) => sum + p.duration, 0) * selectedTechnique.totalCycles;

  return (
    <div className="space-y-6 page-enter max-w-2xl mx-auto pb-12">
      <PageHeader
        title="Breathing Exercise"
        subtitle="Take a moment to breathe and reset"
        backHref="/dashboard"
      />

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 px-4 md:px-0">
        <Wind size={16} className="text-mint-500" />
        You have completed {totalSessions} breathing session{totalSessions === 1 ? '' : 's'}
      </div>

      {isComplete ? (
        <Card className="text-center py-12 page-enter">
          <div className="w-20 h-20 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-mint-500" />
          </div>

          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-100 mt-2">Session complete!</h2>
          <p className="text-sm text-gray-400 mt-1">
            You completed {selectedTechnique.totalCycles} cycles of {selectedTechnique.name}
          </p>

          <div className="flex justify-center gap-8 mt-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-800 dark:text-gray-100">{selectedTechnique.totalCycles}</div>
              <div className="text-xs text-gray-400 mt-1">Cycles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-800 dark:text-gray-100">{totalSeconds}s</div>
              <div className="text-xs text-gray-400 mt-1">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-medium text-gray-800 dark:text-gray-100">{totalSessions}</div>
              <div className="text-xs text-gray-400 mt-1">Total sessions</div>
            </div>
          </div>

          <div className="bg-mint-50 dark:bg-mint-900/20 rounded-xl p-4 mb-6">
            <h3 className="text-xs text-gray-500 mb-2">How do you feel?</h3>
            <MoodPicker size="sm" value={postMood as any} onChange={setPostMood} label="" />
          </div>

          <div className="space-y-2">
            <Button variant="primary" className="w-full" onClick={resetExercise}>
              Start another session
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {(!isRunning && !isComplete && currentCycle === 1 && currentPhaseIndex === 0) && (
            <div className="px-4 md:px-0">
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Choose a technique</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TECHNIQUES.map((tech) => {
                  const isSelected = selectedTechnique.id === tech.id;
                  return (
                    <div
                      key={tech.id}
                      onClick={() => setSelectedTechnique(tech)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
                        isSelected
                          ? 'border-mint-400 bg-mint-50 dark:bg-mint-900/20 dark:border-mint-700'
                          : 'border-gray-200 dark:border-gray-700 hover:border-mint-300 bg-white dark:bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tech.name}</span>
                        <Badge color={tech.difficulty === 'Beginner' ? 'green' : 'blue'}>
                          {tech.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{tech.description}</p>
                      <p className="text-xs text-mint-600 dark:text-mint-400 mt-1 flex items-center gap-1">
                        <Check size={12} /> {tech.benefit}
                      </p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {tech.phases.map((phase, i) => (
                          <div
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${phase.color}26`, // 15% opacity roughly
                              color: phase.color,
                            }}
                          >
                            {phase.label} {phase.duration}s
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Card className="text-center py-8 md:py-12">
            <div className="relative mx-auto w-[80%] max-w-[280px] aspect-square md:w-56 md:h-56">
              {/* Ring 1 (outermost pulse — only when isRunning) */}
              {(isRunning && currentPhase.label === 'Inhale') && (
                <div
                  className="absolute inset-0 rounded-full opacity-20 animate-ping"
                  style={{ backgroundColor: currentPhase.color }}
                />
              )}

              {/* Ring 2 (middle ring) */}
              <div
                className={`absolute inset-4 rounded-full opacity-30 transition-transform ${
                  currentPhase.label === 'Inhale' ? 'scale-100' : 'scale-90'
                }`}
                style={{
                  backgroundColor: currentPhase.color,
                  transitionDuration: `${currentPhase.duration * 1000}ms`
                }}
              />

              {/* Ring 3 (inner solid circle) */}
              <div
                className="absolute inset-8 rounded-full flex flex-col items-center justify-center transition-colors duration-500"
                style={{ backgroundColor: currentPhase.color }}
              >
                <div className="text-white font-medium text-lg">
                  {isStarted ? currentPhase.label : 'Ready'}
                </div>
                <div className="text-white/80 text-3xl font-light">
                  {isStarted ? phaseSecondsLeft : selectedTechnique.phases[0].duration}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {!isRunning && currentPhaseIndex === 0 && currentCycle === 1 ? (
                <p className="text-sm text-gray-400">Press play to begin</p>
              ) : (
                <p className="text-sm text-gray-400">
                  Cycle {currentCycle} of {selectedTechnique.totalCycles}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-center mt-3">
              {selectedTechnique.phases.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i === currentPhaseIndex
                      ? ''
                      : i < currentPhaseIndex
                      ? 'bg-gray-400 dark:bg-gray-600'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                  style={i === currentPhaseIndex ? { backgroundColor: currentPhase.color } : {}}
                />
              ))}
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw size={16} />}
                onClick={resetExercise}
                disabled={!isRunning && currentCycle === 1 && currentPhaseIndex === 0}
              >
                Reset
              </Button>

              <Button
                variant="primary"
                size="lg"
                leftIcon={isRunning ? <Pause size={18} /> : <Play size={18} />}
                onClick={() => setIsRunning(!isRunning)}
                style={isRunning ? { backgroundColor: currentPhase.color, borderColor: currentPhase.color } : {}}
              >
                {isRunning ? 'Pause' : currentCycle > 1 ? 'Resume' : 'Start'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 md:p-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">This session</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {selectedTechnique.phases.map((phase, i) => {
                const isActive = i === currentPhaseIndex;
                return (
                  <div
                    key={i}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 rounded-xl px-4 py-3 text-xs transition-colors duration-300 ${
                      isActive
                        ? 'border-2'
                        : 'border border-gray-100 dark:border-gray-800'
                    }`}
                    style={
                      isActive
                        ? { borderColor: phase.color, backgroundColor: `${phase.color}1A` } // ~10% opacity
                        : {}
                    }
                  >
                    <span
                      className="font-medium"
                      style={isActive ? { color: phase.color } : { color: 'var(--tw-prose-body)' }}
                    >
                      {phase.label}
                    </span>
                    <span className="text-gray-400">{phase.duration}s</span>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Total: {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s · {selectedTechnique.totalCycles} cycles
            </div>
          </Card>

          <Card className="bg-calm-50 dark:bg-calm-900/20 border-calm-100 dark:border-calm-800">
            <h2 className="text-sm font-medium text-calm-800 dark:text-calm-300 mb-3">Tips for best results</h2>
            <ul className="space-y-2">
              {[
                "Find a comfortable seated position with your back straight",
                "Breathe through your nose during inhale phases",
                "If you feel dizzy, stop and breathe normally",
                "Practice daily for best results — even one session helps"
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-calm-700 dark:text-calm-400">
                  <Check size={12} className="text-calm-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          <DisclaimerBanner />
        </>
      )}
    </div>
  );
}
