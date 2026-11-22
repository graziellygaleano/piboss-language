import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getHabitatThemeById, HABITAT_THEMES, HabitatTheme, AnimalItem } from '@/data/gameData';
import { habitatGameSharedStyles } from '@/styles/habitat-game/gameStyles';
import { speakWord, stopAllAudio } from '@/services/audioService';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';

interface FilterRound {
  targetAnimal: AnimalItem;
  choices: AnimalItem[];
}

function buildFilterRounds(currentTheme: HabitatTheme): FilterRound[] {
  const otherHabitats = HABITAT_THEMES.filter((h) => h.id !== currentTheme.id);
  const shuffledTargets = [...currentTheme.animals].sort(() => 0.5 - Math.random());

  return shuffledTargets.map((target) => {
    const randomHabitat =
      otherHabitats[Math.floor(Math.random() * otherHabitats.length)] ?? HABITAT_THEMES[0];
    const distractor =
      randomHabitat.animals[Math.floor(Math.random() * randomHabitat.animals.length)] ??
      currentTheme.animals[0];

    const choices = Math.random() > 0.5 ? [target, distractor] : [distractor, target];
    return { targetAnimal: target, choices };
  });
}

export default function HabitatFilterScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getHabitatThemeById(themeId), [themeId]);

  const [queue, setQueue] = useState<FilterRound[]>(() => buildFilterRounds(theme));
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
  const targetAnimal = currentRound.targetAnimal;
  const currentErrorCount = errorCountMap[targetAnimal.id] || 0;

  useEffect(() => {
    setStepStartTime(Date.now());
  }, [currentIndex]);

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
    speakWord(animal.nameEn);
  };

  const handlePlayHint = () => {
    setHasUsedHintInCurrentTurn(true);
    const animalHabitat = getHabitatThemeById(targetAnimal.habitatId);
    speakWord(animalHabitat.nameEn);
  };

  const handleConfirm = () => {
    if (!selectedAnimalId) return;
    stopAllAudio();

    const responseTimeMs = Date.now() - stepStartTime;
    setLastResponseTime(responseTimeMs);

    const chosenAnimal = currentRound.choices.find((a) => a.id === selectedAnimalId);
    const isCorrect = chosenAnimal ? chosenAnimal.habitatId === theme.id : false;
    const isLastRound = currentIndex + 1 >= queue.length;

    if (isCorrect) {
      triggerFlash('correct');
      const earned = hasUsedHintInCurrentTurn ? 15 : 20;
      setScore((prev) => prev + earned);

      if (!isLastRound) {
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
        [targetAnimal.id]: (prev[targetAnimal.id] || 0) + 1,
      }));

      setQueue((prev) => [...prev, currentRound]);

      setCurrentIndex((prev) => prev + 1);
      setSelectedAnimalId(null);
      setHasUsedHintInCurrentTurn(false);
    }
  };

  const isConfirmedReady = selectedAnimalId !== null;

  return (
    <View style={habitatGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.push({ pathname: '/habitat-game/match', params: { themeId: theme.id } });
        }}
      />
      {flashFeedback && (
        <View
          pointerEvents="none"
          style={[
            habitatGameSharedStyles.feedbackOverlay,
            flashFeedback === 'correct'
              ? habitatGameSharedStyles.overlayCorrect
              : habitatGameSharedStyles.overlayWrong,
          ]}
        />
      )}

      <View style={habitatGameSharedStyles.topNavigation}>
        <Pressable
          style={habitatGameSharedStyles.smallNavBtn}
          onPress={() => {
            stopAllAudio();
            router.replace({ pathname: '/levels', params: { world: 'habitats' } });
          }}
        >
          <Text style={habitatGameSharedStyles.smallNavBtnText}>◀ Níveis</Text>
        </Pressable>

        <View style={habitatGameSharedStyles.stageIndicator}>
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={[habitatGameSharedStyles.stageDot, habitatGameSharedStyles.stageDotActive]} />
          <View style={habitatGameSharedStyles.stageDot} />
        </View>

        <Text style={habitatGameSharedStyles.counterText}>
          {Math.min(currentIndex + 1, queue.length)}/{queue.length}
        </Text>
      </View>

      <View style={habitatGameSharedStyles.debugHud}>
        <Text style={habitatGameSharedStyles.debugHudText}>
          🎯 Pontos: {score}/{maxPossibleScore} ({Math.round((score / maxPossibleScore) * 100)}%) | Meta: 60% ({Math.round(maxPossibleScore * 0.6)} pts) | Tempo: {lastResponseTime ? (lastResponseTime / 1000).toFixed(1) + 's' : '-'} | Fila: {queue.length - currentIndex}
        </Text>
      </View>

      <View style={habitatGameSharedStyles.stageArea}>
        <View style={[habitatGameSharedStyles.bigHabitatBox, { backgroundColor: theme.color }]}>
          <Pressable
            style={[
              habitatGameSharedStyles.boxAudioBtn,
              currentErrorCount >= 2 && { backgroundColor: '#2563EB', borderColor: '#1D4ED8' },
            ]}
            onPress={() => {
              if (currentErrorCount >= 2) {
                handlePlayHint();
              } else {
                speakWord(theme.nameEn);
              }
            }}
          >
            <Image
              source={require('@/assets/icons/music-on.png')}
              style={habitatGameSharedStyles.boxAudioIcon}
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
                zIndex: 101,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 }}>Dica!</Text>
            </View>
          )}

          {theme.image ? (
            <Image source={theme.image} style={habitatGameSharedStyles.bigHabitatImage} resizeMode="cover" />
          ) : (
            <Text style={habitatGameSharedStyles.bigHabitatEmoji}>{theme.emoji}</Text>
          )}
          <Text style={habitatGameSharedStyles.bigHabitatTitle}>{theme.nameEn}</Text>
          <Text style={habitatGameSharedStyles.bigHabitatSub}>{theme.namePt}</Text>
        </View>

        <View style={habitatGameSharedStyles.twoChoicesRow}>
          {currentRound.choices.map((animal) => {
            const isSelected = selectedAnimalId === animal.id;
            return (
              <Pressable
                key={animal.id}
                style={[
                  habitatGameSharedStyles.animalChoiceCard,
                  isSelected && habitatGameSharedStyles.animalChoiceCardSelected,
                ]}
                onPress={() => handleSelectAnimal(animal)}
              >
                <Text style={habitatGameSharedStyles.animalChoiceEmoji}>{animal.emoji}</Text>
                <Text style={habitatGameSharedStyles.animalChoiceName}>{animal.nameEn}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[
          habitatGameSharedStyles.bottomRow,
          { opacity: isConfirmedReady ? 1 : 0.4, pointerEvents: isConfirmedReady ? 'auto' : 'none' },
        ]}
      >
        <Pressable
          disabled={!isConfirmedReady}
          style={[
            habitatGameSharedStyles.confirmBtn,
            !isConfirmedReady && habitatGameSharedStyles.confirmBtnDisabled,
          ]}
          onPress={handleConfirm}
        >
          <Text style={habitatGameSharedStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
