import { IVitalsReading } from '../models/VitalsReading'

interface SuggestionOutput {
  category: string
  severity: 'normal' | 'warning' | 'alert'
  title: string
  message: string
  action: string
}

export function generateVitalsSuggestions(
  vitals: Partial<IVitalsReading>
): SuggestionOutput[] {
  const suggestions: SuggestionOutput[] = []

  // ── Heart Rate ────────────────────────────────────
  if (vitals.heartRate !== null &&
      vitals.heartRate !== undefined) {
    const hr = vitals.heartRate
    if (hr < 50) {
      suggestions.push({
        category: 'heart',
        severity: 'warning',
        title: 'Low heart rate detected',
        message: `Your heart rate is ${hr} bpm which is below the normal resting range of 60–100 bpm. If you feel dizzy or short of breath please consult a doctor.`,
        action: 'Consult a healthcare professional',
      })
    } else if (hr >= 50 && hr <= 100) {
      suggestions.push({
        category: 'heart',
        severity: 'normal',
        title: 'Heart rate is normal',
        message: `Your resting heart rate of ${hr} bpm is within the healthy range of 60–100 bpm. Regular exercise can help lower resting heart rate over time.`,
        action: 'Keep up your activity routine',
      })
    } else if (hr > 100 && hr <= 120) {
      suggestions.push({
        category: 'heart',
        severity: 'warning',
        title: 'Elevated heart rate',
        message: `Your heart rate is ${hr} bpm which is slightly elevated. This can be caused by stress, caffeine, or physical activity. Try a 5-minute breathing exercise to calm your nervous system.`,
        action: 'Try breathing exercise',
      })
    } else if (hr > 120) {
      suggestions.push({
        category: 'heart',
        severity: 'alert',
        title: 'High heart rate — take action',
        message: `Your heart rate is ${hr} bpm which is significantly elevated at rest. Please sit down, breathe slowly, and avoid strenuous activity. If it persists for more than 30 minutes seek medical attention.`,
        action: 'Seek medical attention if persistent',
      })
    }
  }

  // ── Blood Pressure ────────────────────────────────
  if (vitals.systolicBP !== null &&
      vitals.systolicBP !== undefined &&
      vitals.diastolicBP !== null &&
      vitals.diastolicBP !== undefined) {
    const sys = vitals.systolicBP
    const dia = vitals.diastolicBP

    if (sys < 90 || dia < 60) {
      suggestions.push({
        category: 'blood_pressure',
        severity: 'warning',
        title: 'Low blood pressure',
        message: `Your BP reading of ${sys}/${dia} mmHg is below normal (120/80). Low BP can cause dizziness when standing. Stay hydrated and rise slowly from seated positions.`,
        action: 'Increase water and salt intake',
      })
    } else if (sys <= 120 && dia <= 80) {
      suggestions.push({
        category: 'blood_pressure',
        severity: 'normal',
        title: 'Blood pressure is healthy',
        message: `Your BP of ${sys}/${dia} mmHg is within the optimal range. Maintain this by staying active, eating well, and managing stress.`,
        action: 'Maintain healthy lifestyle',
      })
    } else if (
      (sys > 120 && sys <= 139) ||
      (dia > 80 && dia <= 89)
    ) {
      suggestions.push({
        category: 'blood_pressure',
        severity: 'warning',
        title: 'Pre-high blood pressure',
        message: `Your BP of ${sys}/${dia} mmHg is slightly elevated. Reduce salt intake, limit caffeine, exercise regularly and manage stress to bring it back to normal.`,
        action: 'Reduce salt and caffeine intake',
      })
    } else if (sys >= 140 || dia >= 90) {
      suggestions.push({
        category: 'blood_pressure',
        severity: 'alert',
        title: 'High blood pressure detected',
        message: `Your BP of ${sys}/${dia} mmHg is in the high range. Persistent high BP increases risk of heart disease and stroke. Please consult a doctor soon.`,
        action: 'Consult a doctor',
      })
    }
  }

  // ── SpO2 ──────────────────────────────────────────
  if (vitals.spO2 !== null &&
      vitals.spO2 !== undefined) {
    const spo2 = vitals.spO2
    if (spo2 >= 95) {
      suggestions.push({
        category: 'oxygen',
        severity: 'normal',
        title: 'Oxygen saturation is normal',
        message: `Your SpO2 of ${spo2}% is within the healthy range of 95–100%. Your lungs are functioning well.`,
        action: 'No action needed',
      })
    } else if (spo2 >= 90 && spo2 < 95) {
      suggestions.push({
        category: 'oxygen',
        severity: 'warning',
        title: 'Slightly low oxygen saturation',
        message: `Your SpO2 of ${spo2}% is slightly below the normal range. Try deep breathing exercises. If you feel short of breath or it stays low please see a doctor.`,
        action: 'Practice deep breathing',
      })
    } else if (spo2 < 90) {
      suggestions.push({
        category: 'oxygen',
        severity: 'alert',
        title: 'Low oxygen — seek help',
        message: `Your SpO2 of ${spo2}% is dangerously low. This may indicate a serious respiratory issue. Please seek medical attention immediately.`,
        action: 'Seek immediate medical attention',
      })
    }
  }

  // ── Temperature ───────────────────────────────────
  if (vitals.bodyTemperature !== null &&
      vitals.bodyTemperature !== undefined) {
    const temp = vitals.bodyTemperature
    if (temp < 36) {
      suggestions.push({
        category: 'temperature',
        severity: 'warning',
        title: 'Low body temperature',
        message: `Your temperature of ${temp}°C is below normal. Warm up with clothing or a warm drink. If it drops below 35°C seek medical help.`,
        action: 'Warm up and monitor',
      })
    } else if (temp >= 36 && temp <= 37.5) {
      suggestions.push({
        category: 'temperature',
        severity: 'normal',
        title: 'Temperature is normal',
        message: `Your body temperature of ${temp}°C is within the healthy range of 36–37.5°C.`,
        action: 'No action needed',
      })
    } else if (temp > 37.5 && temp <= 38.5) {
      suggestions.push({
        category: 'temperature',
        severity: 'warning',
        title: 'Mild fever detected',
        message: `Your temperature of ${temp}°C suggests a mild fever. Rest, stay hydrated, and monitor. If it rises above 39°C or persists more than 2 days see a doctor.`,
        action: 'Rest and stay hydrated',
      })
    } else if (temp > 38.5) {
      suggestions.push({
        category: 'temperature',
        severity: 'alert',
        title: 'High fever — take action',
        message: `Your temperature of ${temp}°C indicates a high fever. Please rest, take appropriate medication and consult a doctor if it does not reduce.`,
        action: 'Consult a doctor',
      })
    }
  }

  // ── Activity ──────────────────────────────────────
  if (vitals.steps !== null &&
      vitals.steps !== undefined) {
    const steps = vitals.steps
    if (steps < 3000) {
      suggestions.push({
        category: 'activity',
        severity: 'warning',
        title: 'Very low activity today',
        message: `You have only taken ${steps.toLocaleString()} steps today. Aim for at least 7000 steps daily for good health. Try a 15-minute walk to boost your count.`,
        action: 'Go for a 15-minute walk',
      })
    } else if (steps >= 3000 && steps < 7000) {
      suggestions.push({
        category: 'activity',
        severity: 'normal',
        title: 'Keep moving today',
        message: `You have taken ${steps.toLocaleString()} steps so far. You are halfway to the 7000 step daily goal. A short walk will get you there.`,
        action: 'Take a short walk',
      })
    } else if (steps >= 7000) {
      suggestions.push({
        category: 'activity',
        severity: 'normal',
        title: 'Great activity level!',
        message: `Excellent! You have taken ${steps.toLocaleString()} steps today which meets or exceeds the recommended daily goal. Keep it up!`,
        action: 'Keep up the great work',
      })
    }
  }

  return suggestions
}
