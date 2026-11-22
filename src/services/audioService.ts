import * as Speech from 'expo-speech';
import { createAudioPlayer, AudioPlayer, setAudioModeAsync } from 'expo-audio';

export const LOCAL_ANIMAL_SOUNDS: Record<string, any> = {
  cow: require('@/assets/sounds/cow.mp3'),
  dog: require('@/assets/sounds/dog.mp3'),
  cat: require('@/assets/sounds/cat.mp3'),
  bird: require('@/assets/sounds/bird.mp3'),
  pig: require('@/assets/sounds/pig.mp3'),
  duck: require('@/assets/sounds/duck.mp3'),
  chicken: require('@/assets/sounds/chicken.mp3'),
  rooster: require('@/assets/sounds/rooster.mp3'),
  horse: require('@/assets/sounds/horse.mp3'),
  lion: require('@/assets/sounds/lion.mp3'),
  elephant: require('@/assets/sounds/elephant.mp3'),
  frog: require('@/assets/sounds/frog.mp3'),
  bee: require('@/assets/sounds/bee.mp3'),
  cricket: require('@/assets/sounds/cricket.mp3'),
  fish: require('@/assets/sounds/fish.mp3'),
  hamster: require('@/assets/sounds/hamster.mp3'),
  mouse: require('@/assets/sounds/mice.mp3'),
  rabbit: require('@/assets/sounds/rabbit.mp3'),
  squirrel: require('@/assets/sounds/squirrel.mp3'),
  owl: require('@/assets/sounds/owl.mp3'),
  bear: require('@/assets/sounds/bear.mp3'),
  polar_bear: require('@/assets/sounds/bear.mp3'),
  penguin: require('@/assets/sounds/pinguin.mp3'),
  whale: require('@/assets/sounds/whale.mp3'),
  dolphin: require('@/assets/sounds/dolphin.mp3'),
  wolf: require('@/assets/sounds/wolf.mp3'),
  tiger: require('@/assets/sounds/tiger.mp3'),
  hippo: require('@/assets/sounds/hippo.mp3'),
  monkey: require('@/assets/sounds/monkey.mp3'),
  seal: require('@/assets/sounds/seal.mp3'),
  snake: require('@/assets/sounds/snake.mp3'),
};

let currentPlayer: AudioPlayer | null = null;
let currentSequenceTimer: any = null;
let lastSpeakTimestamp = 0;
let lastSpokenWord = '';

function shouldSkipDuplicateSpeech(word: string): boolean {
  const now = Date.now();
  if (word === lastSpokenWord && now - lastSpeakTimestamp < 450) {
    return true;
  }
  lastSpeakTimestamp = now;
  lastSpokenWord = word;
  return false;
}

async function ensureAudioMode() {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  } catch (error) {
    console.warn('Erro ao configurar modo de áudio:', error);
  }
}

ensureAudioMode();

export function stopAllAudio() {
  if (currentSequenceTimer) {
    clearTimeout(currentSequenceTimer);
    currentSequenceTimer = null;
  }

  try {
    Speech.stop();
  } catch {
  }

  if (currentPlayer) {
    try {
      currentPlayer.pause();
    } catch {
    }
  }
}

export function speakWord(word: string) {
  if (shouldSkipDuplicateSpeech(word)) return;

  stopAllAudio();
  ensureAudioMode();

  try {
    Speech.speak(word, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  } catch (error) {
    console.warn('Erro ao reproduzir voz:', error);
  }
}

export function playAnimalSound(animalId: string) {
  stopAllAudio();

  const soundSource = LOCAL_ANIMAL_SOUNDS[animalId];
  if (!soundSource) {
    return;
  }

  ensureAudioMode();

  try {
    if (!currentPlayer) {
      currentPlayer = createAudioPlayer(soundSource);
    } else {
      currentPlayer.pause();
      currentPlayer.replace(soundSource);
    }
    currentPlayer.play();
  } catch {
    try {
      currentPlayer = createAudioPlayer(soundSource);
      currentPlayer.play();
    } catch (error) {
      console.warn(`Erro ao tocar som do animal ${animalId}:`, error);
    }
  }
}

/**
 * Sequência estável: fala a palavra e, se o animal tiver som, toca o som após a pronúncia.
 * Animais sem som apenas pronunciam a palavra em inglês e ficam em silêncio.
 */
export function playWordThenAnimalSound(word: string, animalId: string) {
  if (shouldSkipDuplicateSpeech(word)) return;

  stopAllAudio();
  ensureAudioMode();

  // 1. Fala a palavra em inglês imediatamente com tom natural
  try {
    Speech.speak(word, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
    });
  } catch (err) {
    console.warn('Erro ao falar palavra:', err);
  }

  // 2. Se o animal tiver som característico, toca após a fala
  const soundSource = LOCAL_ANIMAL_SOUNDS[animalId];
  if (soundSource) {
    currentSequenceTimer = setTimeout(() => {
      ensureAudioMode();
      try {
        if (!currentPlayer) {
          currentPlayer = createAudioPlayer(soundSource);
        } else {
          currentPlayer.pause();
          currentPlayer.replace(soundSource);
        }
        currentPlayer.play();
      } catch {
        try {
          currentPlayer = createAudioPlayer(soundSource);
          currentPlayer.play();
        } catch (error) {
          console.warn(`Erro ao reproduzir som ${animalId}:`, error);
        }
      }
      currentSequenceTimer = null;
    }, 950);
  }
}
