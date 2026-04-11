import { useState } from 'react';
import { PageHeader, Button } from '../components/ui';
import { Heart, Wind, Moon, Sun, Droplets, Activity, Brain, Apple, Coffee, BookOpen, Star, Clock, User, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CONDITIONS = [
  { id: 'anxiety', label: 'Anxiety', icon: Brain, color: 'purple', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-900/20', textLight: 'text-purple-700', textDark: 'dark:text-purple-300', borderLight: 'border-purple-200', borderDark: 'dark:border-purple-800' },
  { id: 'hypertension', label: 'High BP', icon: Activity, color: 'red', bgLight: 'bg-red-50', bgDark: 'dark:bg-red-900/20', textLight: 'text-red-700', textDark: 'dark:text-red-300', borderLight: 'border-red-200', borderDark: 'dark:border-red-800' },
  { id: 'diabetes', label: 'Diabetes', icon: Droplets, color: 'amber', bgLight: 'bg-amber-50', bgDark: 'dark:bg-amber-900/20', textLight: 'text-amber-700', textDark: 'dark:text-amber-300', borderLight: 'border-amber-200', borderDark: 'dark:border-amber-800' },
  { id: 'insomnia', label: 'Insomnia', icon: Moon, color: 'indigo', bgLight: 'bg-indigo-50', bgDark: 'dark:bg-indigo-900/20', textLight: 'text-indigo-700', textDark: 'dark:text-indigo-300', borderLight: 'border-indigo-200', borderDark: 'dark:border-indigo-800' },
  { id: 'depression', label: 'Depression', icon: Heart, color: 'pink', bgLight: 'bg-pink-50', bgDark: 'dark:bg-pink-900/20', textLight: 'text-pink-700', textDark: 'dark:text-pink-300', borderLight: 'border-pink-200', borderDark: 'dark:border-pink-800' },
  { id: 'back_pain', label: 'Back Pain', icon: User, color: 'orange', bgLight: 'bg-orange-50', bgDark: 'dark:bg-orange-900/20', textLight: 'text-orange-700', textDark: 'dark:text-orange-300', borderLight: 'border-orange-200', borderDark: 'dark:border-orange-800' },
  { id: 'general', label: 'General', icon: Star, color: 'mint', bgLight: 'bg-mint-50', bgDark: 'dark:bg-mint-900/20', textLight: 'text-mint-700', textDark: 'dark:text-mint-300', borderLight: 'border-mint-200', borderDark: 'dark:border-mint-800' },
];

const CONDITION_RECS: Record<string, any[]>  = {
  anxiety: [
    { title: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s. Activates your parasympathetic nervous system within 2 minutes. Do 4 cycles.', duration: '5 min', evidence: 'Clinical', action: 'breathing', icon: Wind },
    { title: 'Progressive Muscle Relaxation', desc: 'Tense each muscle group for 5s then release. Start from feet to face. Reduces physical anxiety symptoms.', duration: '10 min', evidence: 'Evidence-based', action: null, icon: User },
    { title: 'Cold water on wrists', desc: 'Run cold water over your wrists and behind your ears. Activates the dive reflex and slows heart rate quickly.', duration: '2 min', evidence: 'Proven', action: null, icon: Droplets },
    { title: 'Grounding — 5-4-3-2-1', desc: 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste. Stops panic spiral instantly.', duration: '3 min', evidence: 'Therapeutic', action: null, icon: Brain },
    { title: 'Limit caffeine after noon', desc: 'Caffeine has a 5-6 hour half life and worsens anxiety. Switch to herbal tea or water after 12pm.', duration: 'Daily habit', evidence: 'Scientific', action: null, icon: Coffee },
    { title: 'Journal your worries', desc: 'Write your anxiety triggers for 10 minutes. Studies show this reduces cortisol and gives mental clarity.', duration: '10 min', evidence: 'Research-backed', action: 'journal', icon: BookOpen },
  ],
  hypertension: [
    { title: 'DASH Diet basics', desc: 'Reduce sodium below 2.3g/day. Eat more potassium-rich foods: bananas, sweet potatoes, spinach. Can reduce BP by 11 mmHg.', duration: 'Daily', evidence: 'Clinical', action: null, icon: Apple },
    { title: '30-minute brisk walk', desc: 'Regular aerobic exercise lowers systolic BP by 5-8 mmHg. Even 3 ten-minute walks give the same benefit.', duration: '30 min', evidence: 'Evidence-based', action: null, icon: Activity },
    { title: 'Deep slow breathing', desc: '6 breaths per minute for 15 minutes daily. Shown to reduce systolic BP by 3.4 mmHg over weeks.', duration: '15 min', evidence: 'Clinical trial', action: 'breathing', icon: Wind },
    { title: 'Limit alcohol strictly', desc: 'More than 1 drink/day raises BP significantly. Even small reductions in alcohol lower readings within days.', duration: 'Ongoing', evidence: 'WHO guideline', action: null, icon: Droplets },
    { title: 'Sleep 7-9 hours', desc: 'Poor sleep raises cortisol which constricts blood vessels. People sleeping under 6 hrs have 20% higher BP risk.', duration: 'Nightly', evidence: 'Research-backed', action: null, icon: Moon },
    { title: 'Morning BP log', desc: 'Track BP at the same time each morning before eating. This gives your doctor the most accurate picture.', duration: '2 min', evidence: 'Medical guideline', action: 'vitals', icon: Heart },
  ],
  diabetes: [
    { title: 'Walk after meals', desc: 'A 10-minute walk within 30 min of eating reduces post-meal blood sugar spike by up to 22%. Most effective intervention.', duration: '10 min', evidence: 'Clinical', action: null, icon: Activity },
    { title: 'Eat protein first', desc: 'Eating protein and vegetables before carbs in the same meal reduces glucose spike by 37%. Sequence matters.', duration: 'Each meal', evidence: 'Research-backed', action: null, icon: Apple },
    { title: 'Stay well hydrated', desc: 'Dehydration concentrates blood glucose. Drink 2.5L of water daily. Avoid sugary drinks and fruit juices.', duration: 'Daily', evidence: 'Scientific', action: null, icon: Droplets },
    { title: 'Stress management', desc: 'Cortisol raises blood sugar. Chronic stress makes diabetes harder to manage. Daily breathing or meditation helps.', duration: '10 min', evidence: 'Clinical', action: 'breathing', icon: Wind },
    { title: 'Sleep quality matters', desc: 'Even one night of poor sleep increases insulin resistance. Prioritise 7-8 hours with a consistent schedule.', duration: 'Nightly', evidence: 'Evidence-based', action: null, icon: Moon },
    { title: 'Track vitals daily', desc: 'Log your blood glucose, steps and weight daily. Patterns reveal what foods and activities affect your levels.', duration: '5 min', evidence: 'Best practice', action: 'vitals', icon: Heart },
  ],
  insomnia: [
    { title: 'Fixed wake time', desc: 'Wake at the same time every day including weekends. This anchors your circadian rhythm faster than any other method.', duration: 'Daily', evidence: 'CBT-I gold standard', action: null, icon: Sun },
    { title: '4-7-8 sleep breathing', desc: 'Do 4 cycles of 4-7-8 breathing lying in bed. Slows heart rate and activates sleep mode in the nervous system.', duration: '5 min', evidence: 'Clinical', action: 'breathing', icon: Wind },
    { title: 'No screens 60 min before bed', desc: 'Blue light suppresses melatonin by 50%. Use night mode or blue-light glasses. Read a physical book instead.', duration: 'Nightly', evidence: 'Scientific', action: null, icon: Moon },
    { title: 'Keep bedroom cold', desc: 'Ideal sleep temperature is 16-19°C. Body temperature must drop to initiate sleep. A cooler room speeds this up.', duration: 'Nightly', evidence: 'Sleep science', action: null, icon: Droplets },
    { title: 'Worry journaling', desc: 'Write your worries and tomorrow tasks before bed. Empties working memory so your brain can switch off.', duration: '10 min', evidence: 'Research-backed', action: 'journal', icon: BookOpen },
    { title: 'Avoid caffeine after 2pm', desc: 'Caffeine blocks adenosine receptors. Its half-life is 5-6 hours so a 3pm coffee still affects 11pm sleep.', duration: 'Daily', evidence: 'Scientific', action: null, icon: Coffee },
  ],
  depression: [
    { title: 'Behavioural activation', desc: 'Do one small meaningful activity daily even when you do not feel like it. Action precedes motivation, not the other way round.', duration: 'Daily', evidence: 'CBT gold standard', action: null, icon: Star },
    { title: 'Morning sunlight', desc: '10-30 minutes of natural light within 1 hour of waking regulates cortisol and serotonin. Powerful natural antidepressant.', duration: '15 min', evidence: 'Chronobiology', action: null, icon: Sun },
    { title: 'Exercise — any type', desc: '30 min of moderate exercise has antidepressant effects equivalent to medication for mild to moderate depression.', duration: '30 min', evidence: 'Meta-analysis', action: null, icon: Activity },
    { title: 'Gratitude journaling', desc: 'Write 3 specific things you are grateful for daily. Rewires negative bias over weeks. Small but powerful effect.', duration: '5 min', evidence: 'Positive psychology', action: 'journal', icon: BookOpen },
    { title: 'Social connection', desc: 'Isolation worsens depression. Even a 10-minute phone call with a trusted person reduces loneliness markers.', duration: '10 min', evidence: 'Research-backed', action: null, icon: User },
    { title: 'Omega-3 rich foods', desc: 'Fatty fish, walnuts, flaxseeds. Omega-3 EPA specifically shown to reduce depressive symptoms in multiple trials.', duration: 'Daily', evidence: 'Clinical trials', action: null, icon: Apple },
  ],
  back_pain: [
    { title: 'Cat-cow stretch', desc: 'On hands and knees, alternate between arching and rounding your back. 10 repetitions. Lubricates spinal discs.', duration: '3 min', evidence: 'Physiotherapy', action: null, icon: User },
    { title: 'Child pose hold', desc: 'Kneel and reach arms forward, hold 30-60 seconds. Decompresses lumbar spine. Immediate pain relief for many.', duration: '2 min', evidence: 'Physical therapy', action: null, icon: User },
    { title: 'Core activation', desc: 'Gentle core exercises (bird-dog, dead bug) build spinal support. Weak core is the most common cause of back pain.', duration: '10 min', evidence: 'Evidence-based', action: null, icon: Activity },
    { title: 'Walk — do not rest', desc: 'Bed rest worsens most back pain. Gentle walking reduces stiffness and inflammation. Aim for 20 minutes daily.', duration: '20 min', evidence: 'Clinical guideline', action: null, icon: Activity },
    { title: 'Heat on lower back', desc: 'Apply a warm pad for 15-20 minutes. Heat relaxes muscles and increases blood flow. Better than ice for chronic pain.', duration: '15 min', evidence: 'Physiotherapy', action: null, icon: Sun },
    { title: 'Anti-inflammatory foods', desc: 'Turmeric, ginger, berries, leafy greens reduce systemic inflammation. Reduce refined sugar and processed foods.', duration: 'Daily', evidence: 'Nutritional science', action: null, icon: Apple },
  ],
  general: [
    { title: 'Drink water on waking', desc: 'Your body loses 400-500ml of water overnight. Drinking 500ml on waking kickstarts metabolism and hydration.', duration: '1 min', evidence: 'Scientific', action: null, icon: Droplets },
    { title: '20-20-20 eye rule', desc: 'Every 20 minutes look at something 20 feet away for 20 seconds. Prevents eye strain and headaches from screens.', duration: 'Hourly', evidence: 'Ophthalmology', action: null, icon: Sun },
    { title: 'Deep breathing break', desc: '5 minutes of slow deep breathing twice a day. Lowers cortisol, improves focus and heart rate variability.', duration: '5 min', evidence: 'Research-backed', action: 'breathing', icon: Wind },
    { title: 'Sleep consistent schedule', desc: 'Going to bed and waking at the same time stabilises your circadian rhythm within a week even if sleep is short.', duration: 'Daily', evidence: 'Chronobiology', action: null, icon: Moon },
    { title: 'Eat more fibre', desc: '30g of fibre daily from vegetables, legumes, whole grains. Reduces disease risk by 40%. Most people eat under 15g.', duration: 'Daily', evidence: 'WHO recommendation', action: null, icon: Apple },
    { title: 'Journal daily', desc: 'Writing for 15 minutes daily about thoughts and feelings reduces anxiety, improves immune function and clarity.', duration: '15 min', evidence: 'Research-backed', action: 'journal', icon: BookOpen },
  ],
};

const CRISIS_LINES = [
  { name: 'iCall — India', number: '9152987821', hours: 'Mon–Sat 8am–10pm', desc: 'Free psychological counselling' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', hours: '24 / 7', desc: 'Mental health helpline' },
  { name: 'AASRA', number: '9820466627', hours: '24 / 7', desc: 'Crisis and suicide prevention' },
];

export default function SelfCarePage() {
  const [selectedCondition, setSelectedCondition] = useState<string>('general');
  const [showCrisis, setShowCrisis] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === 'breathing') navigate('/breathing');
    else if (action === 'journal') navigate('/journal');
    else if (action === 'vitals') navigate('/vitals');
    else if (action === 'checkin') navigate('/checkin');
  };

  const getButtonText = (action: string) => {
    if (action === 'breathing') return 'Try breathing exercise';
    if (action === 'journal') return 'Open journal';
    if (action === 'vitals') return 'Track vitals';
    if (action === 'checkin') return 'Log check-in';
    return '';
  };

  const activeLabel = CONDITIONS.find(c => c.id === selectedCondition)?.label;

  return (
    <div className="space-y-5 page-enter max-w-2xl mx-auto pb-24 md:pb-6">
      <PageHeader 
        title="Self-Care Guide" 
        subtitle="Evidence-based recommendations for your health conditions"
      />

      {/* CONDITION SELECTOR */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Select your condition or focus area
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {CONDITIONS.map((c) => {
            const isSelected = selectedCondition === c.id;
            return (
              <div 
                key={c.id}
                onClick={() => setSelectedCondition(c.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all duration-150 border
                  ${isSelected 
                    ? `${c.bgLight} ${c.bgDark} ${c.textLight} ${c.textDark} ${c.borderLight} ${c.borderDark} shadow-sm` 
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
              >
                <c.icon size={14} />
                {c.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* RECOMMENDATIONS GRID */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          6 recommendations for {activeLabel}
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {(CONDITION_RECS[selectedCondition] || []).map((rec, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <rec.icon size={18} className="text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-lg">
                    <Clock size={10} /> {rec.duration}
                  </div>
                  <div className="bg-mint-50 dark:bg-mint-900/30 text-mint-700 dark:text-mint-400 text-xs px-2 py-1 rounded-lg">
                    {rec.evidence}
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-3">{rec.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{rec.desc}</p>

              {rec.action && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-3 text-xs"
                  onClick={() => handleAction(rec.action)}
                >
                  {getButtonText(rec.action)}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* QUICK WINS SECTION */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick wins right now</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 text-center cursor-pointer" onClick={() => navigate('/breathing')}>
            <Wind size={24} className="text-indigo-500 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Breathe</h4>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">5 min</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-center cursor-pointer" onClick={() => navigate('/journal')}>
            <BookOpen size={24} className="text-amber-500 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Journal</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400">Write freely</p>
          </div>
          <div className="bg-mint-50 dark:bg-mint-900/20 rounded-2xl p-4 text-center cursor-pointer" onClick={() => navigate('/checkin')}>
            <Heart size={24} className="text-mint-500 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-mint-800 dark:text-mint-300">Check-in</h4>
            <p className="text-xs text-mint-600 dark:text-mint-400">Log how you feel</p>
          </div>
        </div>
      </div>

      {/* CRISIS RESOURCES */}
      <div>
        <div 
          onClick={() => setShowCrisis(!showCrisis)}
          className="flex items-center justify-between w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-red-500">
            <Phone size={16} />
            <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Crisis support & helplines</h3>
          </div>
          {showCrisis ? <ChevronUp size={16} className="text-red-400" /> : <ChevronDown size={16} className="text-red-400" />}
        </div>

        {showCrisis && (
          <div className="space-y-2 mt-3">
            {CRISIS_LINES.map((line, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-red-100 dark:border-red-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">{line.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{line.desc}</p>
                  <p className="text-xs text-gray-400">{line.hours}</p>
                </div>
                <a href={`tel:${line.number}`}>
                  <Button variant="secondary" size="sm">{line.number}</Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
