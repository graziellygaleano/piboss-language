
import {
  logAssessment,
  unlockAnimals,
  unlockNextTheme,
  completeTheme,
  THEME_ANIMALS,
  AssessmentRecord,
} from '@/services/storageService';

export const SCORE_RULES = {
  CORRECT_FIRST_TRY: 20,
  CORRECT_WITH_HINT: 15,
  WRONG: -5,
  APPROVAL_QUALITY_THRESHOLD: 0.60,
};

export interface PiboInput {
  themeId: string;
  animalId: string;
  module: 'presentation' | 'learning' | 'retention' | 'challenge' | 'ecosystem' | 'filter' | 'match';
  world?: 'animals' | 'habitats';
  isCorrect: boolean;
  responseTimeMs: number;
  usedHint?: boolean;
}

export interface PiboDecision {
  qualityScore: number;
  action: 'advance' | 'maintain' | 'support';
  pedagogicalFeedback: string;
  shouldReactivateHint: boolean;
  speechRate: number;
  starsEarned: number;
}

export interface SessionResultItem {
  animalId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  usedHint: boolean;
  pointsEarned: number;
  qualityScore?: number;
  action?: 'advance' | 'maintain' | 'support';
}

export interface SessionSummaryDecision {
  isApproved: boolean;
  totalScore: number;
  maxPossibleScore: number;
  scorePercentage: number;
  accuracyRate: number;
  averageQuality: number;
  averageQualityPercentage: number;
  nextThemeUnlocked: string | null;
  message: string;
}

function fuzzyFast(t: number): number {
  if (t <= 2000) return 1.0;
  if (t >= 3800) return 0.0;
  return (3800 - t) / (3800 - 2000);
}

function fuzzyMedium(t: number): number {
  if (t <= 2200 || t >= 6500) return 0.0;
  if (t <= 4000) return (t - 2200) / (4000 - 2200);
  return (6500 - t) / (6500 - 4000);
}

function fuzzySlow(t: number): number {
  if (t <= 4500) return 0.0;
  if (t >= 7500) return 1.0;
  return (t - 4500) / (7500 - 4500);
}

export async function evaluatePiboStep(input: PiboInput): Promise<PiboDecision> {
  const {
    themeId,
    animalId,
    module,
    isCorrect,
    responseTimeMs,
    usedHint = false,
  } = input;

  const uFast = fuzzyFast(responseTimeMs);
  const uMed = fuzzyMedium(responseTimeMs);
  const uSlow = fuzzySlow(responseTimeMs);

  const timeScore = uFast * 1.0 + uMed * 0.75 + uSlow * 0.5;

  let quality = 0.0;
  if (!isCorrect) {
    quality = Math.max(0.1, timeScore * 0.3);
  } else {
    const hintPenalty = usedHint ? 0.2 : 0.0;
    quality = Math.max(0.35, Math.min(1.0, timeScore - hintPenalty));
  }

  let action: 'advance' | 'maintain' | 'support' = 'maintain';
  let pedagogicalFeedback = '';
  let shouldReactivateHint = false;
  let speechRate = 0.9;
  let starsEarned = 0;

  if (quality >= 0.75) {
    action = 'advance';
    starsEarned = 1;
    pedagogicalFeedback = 'Excelente! A criança demonstrou autonomia e rapidez.';
    speechRate = 0.95;
  } else if (quality >= 0.45) {
    action = 'maintain';
    pedagogicalFeedback = 'Bom trabalho! Vocabulário compreendido, consolidando retenção.';
    speechRate = 0.9;
  } else {
    action = 'support';
    shouldReactivateHint = true;
    speechRate = 0.75;
    pedagogicalFeedback = 'Dificuldade detectada. O PIBO ativou reforço de áudio e ritmo pausado.';
  }

  const logRecord: AssessmentRecord = {
    timestamp: Date.now(),
    themeId,
    animalId,
    module,
    isCorrect,
    responseTimeMs,
    usedHint,
    qualityScore: Number(quality.toFixed(2)),
    recommendedAction: action,
  };
  await logAssessment(logRecord);

  return {
    qualityScore: Number(quality.toFixed(2)),
    action,
    pedagogicalFeedback,
    shouldReactivateHint,
    speechRate,
    starsEarned,
  };
}

export async function evaluateSessionCompletion(params: {
  themeId: string;
  world: 'animals' | 'habitats';
  totalThemeAnimals: number;
  results: SessionResultItem[];
}): Promise<SessionSummaryDecision> {
  const { themeId, world, totalThemeAnimals, results } = params;

  const maxPossibleScore = Math.max(1, totalThemeAnimals * SCORE_RULES.CORRECT_FIRST_TRY);

  if (results.length === 0) {
    return {
      isApproved: false,
      totalScore: 0,
      maxPossibleScore,
      scorePercentage: 0,
      accuracyRate: 0,
      averageQuality: 0,
      averageQualityPercentage: 0,
      nextThemeUnlocked: null,
      message: 'Nenhuma resposta registrada.',
    };
  }

  const totalScore = results.reduce(
    (acc, r) => acc + (r.pointsEarned ?? (r.isCorrect ? (r.usedHint ? 15 : 20) : -5)),
    0
  );
  const scorePercentage = Math.max(0, totalScore) / maxPossibleScore;

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const accuracyRate = correctAnswers / results.length;

  let sumQuality = 0;
  for (const item of results) {
    const uFast = fuzzyFast(item.responseTimeMs);
    const uMed = fuzzyMedium(item.responseTimeMs);
    const uSlow = fuzzySlow(item.responseTimeMs);
    const timeScore = uFast * 1.0 + uMed * 0.75 + uSlow * 0.5;

    let q = 0.1;
    if (item.isCorrect) {
      const hintPenalty = item.usedHint ? 0.2 : 0.0;
      q = Math.max(0.35, Math.min(1.0, timeScore - hintPenalty));
    }
    sumQuality += q;
  }
  const averageQuality = sumQuality / results.length;

  const isApproved = averageQuality >= SCORE_RULES.APPROVAL_QUALITY_THRESHOLD;
  const avgQualityPercent = Math.round(averageQuality * 100);

  if (isApproved) {
    const themeAnimals = THEME_ANIMALS[themeId] || [];
    const correctAnimalIds = results.filter((r) => r.isCorrect).map((r) => r.animalId);
    const toUnlock = Array.from(new Set([...themeAnimals, ...correctAnimalIds]));
    if (toUnlock.length > 0) {
      await unlockAnimals(toUnlock);
    }
    await completeTheme(themeId);
    const unlockResult = await unlockNextTheme(themeId, world);
    return {
      isApproved: true,
      totalScore,
      maxPossibleScore,
      scorePercentage: Number((scorePercentage * 100).toFixed(1)),
      accuracyRate: Number(accuracyRate.toFixed(2)),
      averageQuality: Number(averageQuality.toFixed(2)),
      averageQualityPercentage: avgQualityPercent,
      nextThemeUnlocked: unlockResult.nextThemeId,
      message: `Parabéns! Aprovado com ${avgQualityPercent}% de qualidade média (${totalScore} pts)!`,
    };
  }

  // Reprovação: NÃO completa tema e NÃO desbloqueia o próximo habitat
  return {
    isApproved: false,
    totalScore,
    maxPossibleScore,
    scorePercentage: Number((scorePercentage * 100).toFixed(1)),
    accuracyRate: Number(accuracyRate.toFixed(2)),
    averageQuality: Number(averageQuality.toFixed(2)),
    averageQualityPercentage: avgQualityPercent,
    nextThemeUnlocked: null,
    message: `Qualidade média: ${avgQualityPercent}% (Meta: ≥ 60%). Tente novamente!`,
  };
}
