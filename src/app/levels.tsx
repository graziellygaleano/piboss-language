import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HABITAT_THEMES, ANIMAL_THEMES } from '@/data/gameData';
import { levelsStyles } from '@/styles/levels';
import { speakWord, stopAllAudio } from '@/services/audioService';
import { getGameProgress, GameProgress } from '@/services/storageService';

export default function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const { world } = useLocalSearchParams<{ world: 'animals' | 'habitats' }>();
  const [activeWorld, setActiveWorld] = useState<'animals' | 'habitats'>(
    world === 'habitats' ? 'habitats' : 'animals'
  );
  const [progress, setProgress] = useState<GameProgress>({
    unlockedAnimalIds: [],
    unlockedAnimalThemes: ['farm'],
    unlockedHabitatThemes: ['farm'],
    completedThemes: [],
    totalStars: 0,
  });

  useFocusEffect(
    useCallback(() => {
      getGameProgress().then(setProgress);
    }, [])
  );

  React.useEffect(() => {
    if (world) {
      setActiveWorld(world);
    }
  }, [world]);

  const handleSelectTheme = (themeId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      speakWord('Locked! Complete previous level first.');
      return;
    }
    stopAllAudio();
    if (activeWorld === 'animals') {
      router.push({ pathname: '/animal-game/present', params: { themeId } });
    } else {
      router.push({ pathname: '/habitat-game/intro', params: { themeId } });
    }
  };

  return (
    <View
      style={[
        levelsStyles.container,
        activeWorld === 'animals'
          ? levelsStyles.containerAnimals
          : levelsStyles.containerHabitats,
        {
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 14),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        },
      ]}
    >
      <View style={levelsStyles.topBar}>
        <Pressable
          style={levelsStyles.backButton}
          onPress={() => {
            stopAllAudio();
            router.replace('/worlds');
          }}
        >
          <Text style={levelsStyles.backButtonText}>◀ Mundos</Text>
        </Pressable>

        <View style={levelsStyles.worldTabs}>
          <Pressable
            style={[
              levelsStyles.worldTab,
              activeWorld === 'animals'
                ? levelsStyles.worldTabActive
                : levelsStyles.worldTabInactive,
            ]}
            onPress={() => setActiveWorld('animals')}
          >
            <Text
              style={[
                levelsStyles.worldTabText,
                activeWorld === 'animals'
                  ? levelsStyles.worldTabTextActive
                  : levelsStyles.worldTabTextInactive,
              ]}
            >
              🐾 Animais
            </Text>
          </Pressable>

          <Pressable
            style={[
              levelsStyles.worldTab,
              activeWorld === 'habitats'
                ? levelsStyles.worldTabActive
                : levelsStyles.worldTabInactive,
            ]}
            onPress={() => setActiveWorld('habitats')}
          >
            <Text
              style={[
                levelsStyles.worldTabText,
                activeWorld === 'habitats'
                  ? levelsStyles.worldTabTextActive
                  : levelsStyles.worldTabTextInactive,
              ]}
            >
              🌍 Habitats
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={levelsStyles.grid}>
        {(activeWorld === 'animals' ? ANIMAL_THEMES : HABITAT_THEMES).map((theme) => {
          const unlockedList =
            activeWorld === 'animals'
              ? progress.unlockedAnimalThemes
              : progress.unlockedHabitatThemes;
          const isUnlocked = unlockedList.includes(theme.id);
          const isCompleted = progress.completedThemes.includes(theme.id);
          const starsKey = `${activeWorld}:${theme.id}`;
          const starsRecord = progress.themeStars?.[starsKey];

          return (
            <Pressable
              key={theme.id}
              style={[levelsStyles.card, !isUnlocked && levelsStyles.cardLocked]}
              onPress={() => handleSelectTheme(theme.id, isUnlocked)}
            >
              {isUnlocked ? (
                <View style={[levelsStyles.levelBadge, { backgroundColor: theme.color }]}>
                  <Text style={levelsStyles.levelBadgeText}>
                    Nível {theme.level}
                  </Text>
                </View>
              ) : (
                <View style={levelsStyles.lockBadge}>
                  <Text style={levelsStyles.lockBadgeText}>🔒 Nível {theme.level}</Text>
                </View>
              )}

              {activeWorld === 'habitats' && theme.image ? (
                <Image source={theme.image} style={levelsStyles.cardImage} resizeMode="cover" />
              ) : (
                <Text style={levelsStyles.cardEmoji}>{theme.emoji}</Text>
              )}
              <Text style={levelsStyles.cardTitleEn}>{theme.nameEn}</Text>
              <Text style={levelsStyles.cardTitlePt}>
                {isUnlocked ? theme.namePt : 'Bloqueado'}
              </Text>

              {starsRecord ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={levelsStyles.cardStarsRow}>
                    {Array.from({ length: starsRecord.total }).map((_, idx) => {
                      const isAcertou = idx < starsRecord.correct;
                      const starStyle = starsRecord.passed
                        ? isAcertou
                          ? levelsStyles.cardStarActive
                          : levelsStyles.cardStarInactive
                        : isAcertou
                        ? levelsStyles.cardStarPracticeActive
                        : levelsStyles.cardStarPracticeInactive;

                      return (
                        <Text key={idx} style={[levelsStyles.cardStarEmoji, starStyle]}>
                          ⭐
                        </Text>
                      );
                    })}
                  </View>

                  {!starsRecord.passed && (
                    <View style={levelsStyles.practiceBadge}>
                      <Text style={levelsStyles.practiceBadgeText}>🎯 Em treino</Text>
                    </View>
                  )}
                </View>
              ) : null}

              <View style={levelsStyles.animalPreviewRow}>
                {theme.animals.slice(0, 5).map((animal) => (
                  <Text key={animal.id} style={levelsStyles.animalPreviewEmoji}>
                    {isUnlocked ? animal.emoji : '❓'}
                  </Text>
                ))}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
