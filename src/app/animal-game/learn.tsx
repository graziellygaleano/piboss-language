import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getThemeById } from '@/data/gameData';
import { animalGameSharedStyles } from '@/styles/animal-game/gameStyles';
import { playWordThenAnimalSound, speakWord, stopAllAudio } from '@/services/audioService';
import { evaluatePiboStep } from '@/ai/piboAgent';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';

import { AnimalItem } from '@/data/gameData';

interface LearnRound {
  targetAnimal: AnimalItem;
  options: Array<{ isCorrect: boolean; animal: AnimalItem }>;
}

function buildLearnRounds(animals: AnimalItem[]): LearnRound[] {
  const shuffled = [...animals].sort(() => 0.5 - Math.random());

  return shuffled.map((target) => {
    const others = animals.filter((a) => a.id !== target.id);
    const distractor =
      others[Math.floor(Math.random() * others.length)] ?? animals[0];
    const correctOption = { isCorrect: true, animal: target };
    const wrongOption = { isCorrect: false, animal: distractor };
    const options =
      Math.random() > 0.5
        ? [correctOption, wrongOption]
        : [wrongOption, correctOption];

    return { targetAnimal: target, options };
  });
}

export default function LearnScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const [rounds] = useState<LearnRound[]>(() => buildLearnRounds(theme.animals));
  const [animalIndex, setAnimalIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasRetried, setHasRetried] = useState(false);
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [showModuleSuccess, setShowModuleSuccess] = useState(false);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const currentRound = rounds[animalIndex % rounds.length];
  const currentAnimal = currentRound.targetAnimal;
  const audioOptions = currentRound.options;

  const triggerFlash = (type: 'correct' | 'wrong') => {
    setFlashFeedback(type);
    setTimeout(() => {
      setFlashFeedback(null);
    }, 450);
  };

  const handleSelectAudioOption = (index: number) => {
    setSelectedOption(index);
    const option = audioOptions[index];
    playWordThenAnimalSound(option.animal.nameEn, option.animal.id);
  };

  const handleConfirm = () => {
    if (selectedOption === null) return;
    stopAllAudio();

    const chosen = audioOptions[selectedOption];
    const responseTimeMs = Date.now() - stepStartTime;

    evaluatePiboStep({
      themeId: theme.id,
      animalId: currentAnimal.id,
      module: 'learning',
      isCorrect: chosen.isCorrect,
      responseTimeMs,
      usedHint: hasRetried,
    });

    if (chosen.isCorrect) {
      triggerFlash('correct');
      if (animalIndex + 1 < rounds.length) {
        setAnimalIndex((prev) => prev + 1);
        setSelectedOption(null);
        setHasRetried(false);
        setStepStartTime(Date.now());
      } else {
        setShowModuleSuccess(true);
      }
    } else {
      triggerFlash('wrong');
      playWordThenAnimalSound(currentAnimal.nameEn, currentAnimal.id);

      if (!hasRetried) {
        setHasRetried(true);
      } else {
        if (animalIndex + 1 < rounds.length) {
          setAnimalIndex((prev) => prev + 1);
          setSelectedOption(null);
          setHasRetried(false);
          setStepStartTime(Date.now());
        } else {
          setShowModuleSuccess(true);
        }
      }
    }
  };

  return (
    <View style={animalGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.push({ pathname: '/animal-game/retain', params: { themeId: theme.id } });
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
          {animalIndex + 1}/{theme.animals.length}
        </Text>
      </View>

      <View style={animalGameSharedStyles.stageArea}>
        <View style={animalGameSharedStyles.bigBox}>
          <Pressable
            style={animalGameSharedStyles.boxAudioBtn}
            onPress={() => speakWord(currentAnimal.nameEn)}
          >
            <Image
              source={require('@/assets/icons/music-on.png')}
              style={animalGameSharedStyles.boxAudioIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={animalGameSharedStyles.bigAnimalEmoji}>
            {currentAnimal.emoji}
          </Text>
          <Text style={animalGameSharedStyles.bigAnimalName}>
            {currentAnimal.nameEn}
          </Text>
        </View>
      </View>

      <View style={animalGameSharedStyles.bottomRow}>
        {audioOptions.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isBlue = idx === 0;

          return (
            <Pressable
              key={idx}
              style={[
                animalGameSharedStyles.slotBase,
                isBlue
                  ? animalGameSharedStyles.slotBlue
                  : animalGameSharedStyles.slotGreen,
                isSelected && animalGameSharedStyles.slotSelected,
              ]}
              onPress={() => handleSelectAudioOption(idx)}
            >
              <Image
                source={require('@/assets/icons/music-on.png')}
                style={animalGameSharedStyles.learnAudioIcon}
                resizeMode="contain"
              />
              <Text style={animalGameSharedStyles.learnAudioText}>Ouvir</Text>
            </Pressable>
          );
        })}

        <Pressable
          style={[
            animalGameSharedStyles.confirmBtn,
            selectedOption === null && animalGameSharedStyles.confirmBtnDisabled,
          ]}
          disabled={selectedOption === null}
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
