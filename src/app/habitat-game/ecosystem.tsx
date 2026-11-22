import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getHabitatThemeById, HABITAT_THEMES, HabitatTheme, AnimalItem } from '@/data/gameData';
import { habitatGameSharedStyles } from '@/styles/habitat-game/gameStyles';
import { speakWord, stopAllAudio } from '@/services/audioService';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';

interface EcosystemRound {
  targetAnimal: AnimalItem;
  choices: AnimalItem[];
}

function buildEcosystemRounds(currentTheme: HabitatTheme): EcosystemRound[] {
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

export default function HabitatEcosystemScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getHabitatThemeById(themeId), [themeId]);

  const [rounds] = useState<EcosystemRound[]>(() => buildEcosystemRounds(theme));
  const [animalIndex, setAnimalIndex] = useState(0);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalItem | null>(null);
  const [revealedHabitat, setRevealedHabitat] = useState<HabitatTheme | null>(null);
  const [showModuleSuccess, setShowModuleSuccess] = useState(false);

  const currentRound = rounds[animalIndex % rounds.length];

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleSelectAnimal = (animal: AnimalItem) => {
    stopAllAudio();
    setSelectedAnimal(animal);
    speakWord(animal.nameEn);

    const animalHabitat = getHabitatThemeById(animal.habitatId);
    setTimeout(() => {
      setRevealedHabitat(animalHabitat);
      speakWord(animalHabitat.nameEn);
    }, 900);
  };

  const handleConfirm = () => {
    if (!revealedHabitat) return;
    stopAllAudio();

    if (animalIndex + 1 < rounds.length) {
      setAnimalIndex((prev) => prev + 1);
      setSelectedAnimal(null);
      setRevealedHabitat(null);
    } else {
      setShowModuleSuccess(true);
    }
  };

  const isConfirmedReady = revealedHabitat !== null;

  return (
    <View style={habitatGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.push({ pathname: '/habitat-game/filter', params: { themeId: theme.id } });
        }}
      />
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
          <View style={[habitatGameSharedStyles.stageDot, habitatGameSharedStyles.stageDotActive]} />
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={habitatGameSharedStyles.stageDot} />
        </View>

        <Text style={habitatGameSharedStyles.counterText}>
          {animalIndex + 1}/{rounds.length}
        </Text>
      </View>

      <View style={habitatGameSharedStyles.stageArea}>
        {revealedHabitat ? (
          <View style={[habitatGameSharedStyles.bigHabitatBox, { backgroundColor: revealedHabitat.color }]}>
            <Pressable
              style={habitatGameSharedStyles.boxAudioBtn}
              onPress={() => speakWord(revealedHabitat.nameEn)}
            >
              <Image
                source={require('@/assets/icons/music-on.png')}
                style={habitatGameSharedStyles.boxAudioIcon}
                resizeMode="contain"
              />
            </Pressable>

            {revealedHabitat.image ? (
              <Image
                source={revealedHabitat.image}
                style={habitatGameSharedStyles.bigHabitatImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={habitatGameSharedStyles.bigHabitatEmoji}>{revealedHabitat.emoji}</Text>
            )}
            <Text style={habitatGameSharedStyles.bigHabitatTitle}>{revealedHabitat.nameEn}</Text>
            <Text style={habitatGameSharedStyles.bigHabitatSub}>{revealedHabitat.namePt}</Text>
          </View>
        ) : (
          <View style={habitatGameSharedStyles.emptyStageBox}>
            <Text style={habitatGameSharedStyles.emptyStageQuestion}>❓</Text>
            <Text style={habitatGameSharedStyles.emptyStageText}>Escolha um animal!</Text>
          </View>
        )}

        <View style={habitatGameSharedStyles.twoChoicesRow}>
          {currentRound.choices.map((animal) => {
            const isSelected = selectedAnimal?.id === animal.id;
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
