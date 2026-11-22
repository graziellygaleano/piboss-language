import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getThemeById, AnimalItem } from '@/data/gameData';
import { animalGameSharedStyles } from '@/styles/animal-game/gameStyles';
import { speakWord, playAnimalSound, stopAllAudio } from '@/services/audioService';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';

interface RetainRound {
  targetAnimal: AnimalItem;
  choices: AnimalItem[];
}

function buildRetainRounds(animals: AnimalItem[]): RetainRound[] {
  const shuffled = [...animals].sort(() => 0.5 - Math.random());
  return shuffled.map((target) => {
    const others = animals.filter((a) => a.id !== target.id);
    const distractor =
      others[Math.floor(Math.random() * others.length)] ?? animals[0];
    const choices =
      Math.random() > 0.5 ? [target, distractor] : [distractor, target];
    return { targetAnimal: target, choices };
  });
}

export default function RetainScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const [queue, setQueue] = useState<RetainRound[]>(() => buildRetainRounds(theme.animals));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showModuleSuccess, setShowModuleSuccess] = useState(false);

  const [score, setScore] = useState(0);
  const [errorCountMap, setErrorCountMap] = useState<Record<string, number>>({});
  const [hasUsedHintInCurrentTurn, setHasUsedHintInCurrentTurn] = useState(false);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);

  const maxPossibleScore = theme.animals.length * 20;
  const currentRound = queue[currentIndex] ?? queue[0];
  const currentAnimal = currentRound.targetAnimal;
  const choices = currentRound.choices;
  const currentErrorCount = errorCountMap[currentAnimal.id] || 0;

  useEffect(() => {
    speakWord(currentAnimal.nameEn);
    setStepStartTime(Date.now());
  }, [currentIndex, currentAnimal]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const triggerFlash = (type: 'correct' | 'wrong') => {
    setFlashFeedback(type);
    setTimeout(() => {
      setFlashFeedback(null);
    }, 450);
  };

  const handleSelectAnimal = (animal: AnimalItem) => {
    stopAllAudio();
    setSelectedAnimalId(animal.id);
  };

  const handlePlayHint = () => {
    setHasUsedHintInCurrentTurn(true);
    playAnimalSound(currentAnimal.id);
  };

  const handleConfirm = () => {
    if (selectedAnimalId === null) return;
    stopAllAudio();

    const responseTimeMs = Date.now() - stepStartTime;
    setLastResponseTime(responseTimeMs);

    const isCorrect = selectedAnimalId === currentAnimal.id;

    if (isCorrect) {
      triggerFlash('correct');
      const earned = hasUsedHintInCurrentTurn ? 15 : 20;
      setScore((prev) => prev + earned);

      if (currentIndex + 1 < queue.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnimalId(null);
        setHasUsedHintInCurrentTurn(false);
      } else {
        setShowModuleSuccess(true);
      }
    } else {
      triggerFlash('wrong');
      setScore((prev) => prev - 5);
      setErrorCountMap((prev) => ({
        ...prev,
        [currentAnimal.id]: (prev[currentAnimal.id] || 0) + 1,
      }));

      setQueue((prev) => [...prev, currentRound]);

      if (currentIndex + 1 < queue.length + 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnimalId(null);
        setHasUsedHintInCurrentTurn(false);
      }
    }
  };

  return (
    <View style={animalGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.push({ pathname: '/animal-game/challenge', params: { themeId: theme.id } });
        }}
      />
      <View style={animalGameSharedStyles.topNavigation}>
        <Pressable
          style={animalGameSharedStyles.smallNavBtn}
          onPress={() => {
            stopAllAudio();
            router.replace({ pathname: '/levels', params: { world: 'animals' } });
          }}
        >
          <Text style={animalGameSharedStyles.smallNavBtnText}>◀ Níveis</Text>
        </Pressable>

        <Text style={animalGameSharedStyles.counterText}>
          {Math.min(currentIndex + 1, queue.length)}/{queue.length}
        </Text>
      </View>

      <View style={animalGameSharedStyles.debugHud}>
        <Text style={animalGameSharedStyles.debugHudText}>
          🎯 Pontos: {score}/{maxPossibleScore} ({Math.round((score / maxPossibleScore) * 100)}%) | Meta: 60% ({Math.round(maxPossibleScore * 0.6)} pts) | Tempo: {lastResponseTime ? (lastResponseTime / 1000).toFixed(1) + 's' : '-'} | Fila: {queue.length - currentIndex}
        </Text>
      </View>

      <View style={animalGameSharedStyles.stageArea}>
        <View style={animalGameSharedStyles.bigBox}>
          <Pressable
            style={[
              animalGameSharedStyles.boxAudioBtn,
              currentErrorCount >= 2 && { backgroundColor: '#2563EB', borderColor: '#1D4ED8' },
            ]}
            onPress={() => {
              if (currentErrorCount >= 2) {
                handlePlayHint();
              } else {
                speakWord(currentAnimal.nameEn);
              }
            }}
          >
            <Image
              source={require('@/assets/icons/music-on.png')}
              style={animalGameSharedStyles.boxAudioIcon}
              resizeMode="contain"
            />
          </Pressable>

          {currentErrorCount >= 2 && (
            <View
              style={{
                position: 'absolute',
                top: 12,
                left: 56,
                backgroundColor: '#2563EB',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 }}>Dica!</Text>
            </View>
          )}

          <Image
            source={require('@/assets/icons/music-on.png')}
            style={animalGameSharedStyles.listenLargeIcon}
            resizeMode="contain"
          />
          <Text style={animalGameSharedStyles.bigAnimalName}>
            &quot;{currentAnimal.nameEn}&quot;
          </Text>
        </View>
      </View>

      <View style={animalGameSharedStyles.bottomRow}>
        {choices.map((animal, idx) => {
          const isSelected = selectedAnimalId === animal.id;
          const isBlue = idx === 0;

          return (
            <Pressable
              key={animal.id}
              style={[
                animalGameSharedStyles.slotBase,
                isBlue
                  ? animalGameSharedStyles.slotBlue
                  : animalGameSharedStyles.slotGreen,
                isSelected && animalGameSharedStyles.slotSelected,
              ]}
              onPress={() => handleSelectAnimal(animal)}
            >
              <Text style={animalGameSharedStyles.slotEmoji}>
                {animal.emoji}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            animalGameSharedStyles.confirmBtn,
            selectedAnimalId === null && animalGameSharedStyles.confirmBtnDisabled,
          ]}
          disabled={selectedAnimalId === null}
          onPress={handleConfirm}
        >
          <Text style={animalGameSharedStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>

      {flashFeedback && (
        <View
          pointerEvents="none"
          style={[
            animalGameSharedStyles.feedbackOverlay,
            flashFeedback === 'correct'
              ? animalGameSharedStyles.overlayCorrect
              : animalGameSharedStyles.overlayWrong,
          ]}
        />
      )}
    </View>
  );
}
