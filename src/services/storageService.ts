import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KidProfile {
  name: string;
  avatarColor: string;
  avatarEmoji: string;
}

export interface AssessmentRecord {
  timestamp: number;
  themeId: string;
  animalId: string;
  module: 'presentation' | 'learning' | 'retention' | 'challenge' | 'ecosystem' | 'filter' | 'match';
  isCorrect: boolean;
  responseTimeMs: number;
  usedHint: boolean;
  qualityScore: number;
  recommendedAction: 'advance' | 'maintain' | 'support';
}

export interface ThemeStarsRecord {
  correct: number;
  total: number;
  passed: boolean;
}

export interface GameProgress {
  unlockedAnimalIds: string[];
  unlockedAnimalThemes: string[];
  unlockedHabitatThemes: string[];
  completedThemes: string[];
  totalStars: number;
  themeStars?: Record<string, ThemeStarsRecord>;
}

const STORAGE_KEYS = {
  PROFILE: '@pibo_kid_profile',
  PROGRESS: '@pibo_game_progress',
  METRICS_LOGS: '@pibo_assessment_logs',
};

const DEFAULT_PROFILE: KidProfile = {
  name: 'KidName',
  avatarColor: '#4D7BF3',
  avatarEmoji: '⭐',
};

export const ANIMAL_THEME_ORDER = ['farm', 'pets', 'forest', 'garden', 'savannah', 'ocean'];
export const HABITAT_THEME_ORDER = ['farm', 'home', 'forest', 'garden', 'savannah', 'sea'];

export const THEME_ANIMALS: Record<string, string[]> = {
  farm: ['cow', 'chicken', 'horse', 'pig', 'duck', 'rooster'],
  pets: ['dog', 'cat', 'bird', 'hamster'],
  home: ['dog', 'cat', 'bird', 'hamster'],
  forest: ['rabbit', 'snake', 'bear', 'squirrel', 'owl', 'mouse'],
  garden: ['butterfly', 'frog', 'bee', 'cricket', 'ladybug', 'ant'],
  savannah: ['lion', 'elephant', 'zebra', 'giraffe', 'hippo', 'tiger', 'monkey'],
  ocean: ['fish', 'shark', 'whale', 'dolphin', 'seal'],
  sea: ['fish', 'shark', 'whale', 'dolphin', 'seal'],
};

const DEFAULT_PROGRESS: GameProgress = {
  unlockedAnimalIds: [],
  unlockedAnimalThemes: ['farm'],
  unlockedHabitatThemes: ['farm'],
  completedThemes: [],
  totalStars: 0,
  themeStars: {},
};

export async function getKidProfile(): Promise<KidProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (error) {
    console.warn('[storageService] Erro ao carregar perfil:', error);
    return DEFAULT_PROFILE;
  }
}

export async function saveKidProfile(profile: Partial<KidProfile>): Promise<KidProfile> {
  try {
    const current = await getKidProfile();
    const updated: KidProfile = { ...current, ...profile };
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('[storageService] Erro ao salvar perfil:', error);
    return DEFAULT_PROFILE;
  }
}

export async function getGameProgress(): Promise<GameProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    const progress: GameProgress = {
      unlockedAnimalIds: parsed.unlockedAnimalIds ?? DEFAULT_PROGRESS.unlockedAnimalIds,
      unlockedAnimalThemes: parsed.unlockedAnimalThemes ?? DEFAULT_PROGRESS.unlockedAnimalThemes,
      unlockedHabitatThemes: parsed.unlockedHabitatThemes ?? DEFAULT_PROGRESS.unlockedHabitatThemes,
      completedThemes: parsed.completedThemes ?? DEFAULT_PROGRESS.completedThemes,
      totalStars: parsed.totalStars ?? DEFAULT_PROGRESS.totalStars,
      themeStars: parsed.themeStars ?? DEFAULT_PROGRESS.themeStars,
    };

    let updated = false;
    const effectiveCompleted = new Set<string>(progress.completedThemes);

    if (
      progress.unlockedAnimalThemes.includes('pets') ||
      progress.unlockedHabitatThemes.includes('home')
    ) {
      effectiveCompleted.add('farm');
    }
    if (
      progress.unlockedAnimalThemes.includes('forest') ||
      progress.unlockedHabitatThemes.includes('forest')
    ) {
      effectiveCompleted.add('farm');
      effectiveCompleted.add('pets');
      effectiveCompleted.add('home');
    }

    for (const themeId of effectiveCompleted) {
      const themeAnimals = THEME_ANIMALS[themeId] || [];
      for (const aId of themeAnimals) {
        if (!progress.unlockedAnimalIds.includes(aId)) {
          progress.unlockedAnimalIds.push(aId);
          progress.totalStars += 1;
          updated = true;
        }
      }
    }

    if (updated) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }

    return progress;
  } catch (error) {
    console.warn('[storageService] Erro ao carregar progresso:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function unlockAnimal(animalId: string): Promise<GameProgress> {
  try {
    const progress = await getGameProgress();
    if (!progress.unlockedAnimalIds.includes(animalId)) {
      progress.unlockedAnimalIds.push(animalId);
      progress.totalStars += 1;
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }
    return progress;
  } catch (error) {
    console.warn('[storageService] Erro ao desbloquear animal:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function unlockAnimals(animalIds: string[]): Promise<GameProgress> {
  try {
    const progress = await getGameProgress();
    let updated = false;
    for (const id of animalIds) {
      if (!progress.unlockedAnimalIds.includes(id)) {
        progress.unlockedAnimalIds.push(id);
        progress.totalStars += 1;
        updated = true;
      }
    }
    if (updated) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }
    return progress;
  } catch (error) {
    console.warn('[storageService] Erro ao desbloquear animais:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function completeTheme(themeId: string): Promise<GameProgress> {
  try {
    const progress = await getGameProgress();
    if (!progress.completedThemes.includes(themeId)) {
      progress.completedThemes.push(themeId);
      progress.totalStars += 3;
    }

    const themeAnimals = THEME_ANIMALS[themeId] || [];
    for (const aId of themeAnimals) {
      if (!progress.unlockedAnimalIds.includes(aId)) {
        progress.unlockedAnimalIds.push(aId);
        progress.totalStars += 1;
      }
    }

    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return progress;
  } catch (error) {
    console.warn('[storageService] Erro ao concluir tema:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function unlockNextTheme(
  currentThemeId: string,
  world: 'animals' | 'habitats'
): Promise<{ nextThemeId: string | null; isNewUnlock: boolean }> {
  try {
    const progress = await getGameProgress();
    const order = world === 'animals' ? ANIMAL_THEME_ORDER : HABITAT_THEME_ORDER;
    const targetList =
      world === 'animals' ? progress.unlockedAnimalThemes : progress.unlockedHabitatThemes;

    const currentIndex = order.indexOf(currentThemeId);
    if (currentIndex >= 0 && currentIndex + 1 < order.length) {
      const nextThemeId = order[currentIndex + 1];
      if (!targetList.includes(nextThemeId)) {
        targetList.push(nextThemeId);
        progress.totalStars += 2;
        await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
        return { nextThemeId, isNewUnlock: true };
      }
      return { nextThemeId, isNewUnlock: false };
    }
    return { nextThemeId: null, isNewUnlock: false };
  } catch (error) {
    console.warn('[storageService] Erro ao desbloquear próximo tema:', error);
    return { nextThemeId: null, isNewUnlock: false };
  }
}

export async function saveThemeStars(
  world: 'animals' | 'habitats',
  themeId: string,
  correct: number,
  total: number,
  passed: boolean = false
): Promise<GameProgress> {
  try {
    const progress = await getGameProgress();
    const key = `${world}:${themeId}`;
    const prev = progress.themeStars?.[key];
    const isNowPassed = prev?.passed || passed;
    progress.themeStars = {
      ...(progress.themeStars || {}),
      [key]: {
        correct: Math.max(prev?.correct ?? 0, correct),
        total,
        passed: isNowPassed,
      },
    };
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    return progress;
  } catch (error) {
    console.warn('[storageService] Erro ao salvar estrelas do tema:', error);
    return DEFAULT_PROGRESS;
  }
}

export async function resetGameProgress(): Promise<GameProgress> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS);
    return DEFAULT_PROGRESS;
  } catch (error) {
    return DEFAULT_PROGRESS;
  }
}

/**
 * ========================================================
 * SERVIÇO DE LOGS DO AGENTE PIBO (MÉTRICAS CONICT 2026)
 * ========================================================
 */
export async function logAssessment(record: AssessmentRecord): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.METRICS_LOGS);
    const logs: AssessmentRecord[] = raw ? JSON.parse(raw) : [];
    logs.push(record);

    // Mantém no máximo os últimos 200 registros de sessões
    if (logs.length > 200) {
      logs.shift();
    }
    await AsyncStorage.setItem(STORAGE_KEYS.METRICS_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.warn('[storageService] Erro ao salvar log de métrica:', error);
  }
}

export async function getAssessmentLogs(): Promise<AssessmentRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.METRICS_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('[storageService] Erro ao carregar logs:', error);
    return [];
  }
}
