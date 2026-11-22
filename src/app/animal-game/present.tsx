import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getThemeById, AnimalItem } from '@/data/gameData';
import { animalGameSharedStyles } from '@/styles/animal-game/gameStyles';
import { playWordThenAnimalSound, stopAllAudio } from '@/services/audioService';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';

export default function PresentScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const [pendingAnimals, setPendingAnimals] = useState<AnimalItem[]>([]);
  const [presentedAnimal, setPresentedAnimal] = useState<AnimalItem | null>(null);
  const [showModuleSuccess, setShowModuleSuccess] = useState(false);

  useEffect(() => {
    const shuffled = [...theme.animals].sort(() => 0.5 - Math.random());
    setPendingAnimals(shuffled);
    setPresentedAnimal(null);
  }, [theme]);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const leftAnimal = pendingAnimals[0] ?? null;
  const rightAnimal = pendingAnimals.length > 1 ? pendingAnimals[1] : null;

  const handleSelectAnimal = (animal: AnimalItem) => {
    setPresentedAnimal(animal);
    playWordThenAnimalSound(animal.nameEn, animal.id);
  };

  const handleConfirm = () => {
    if (!presentedAnimal) return;
    stopAllAudio();

    const updated = pendingAnimals.filter((a) => a.id !== presentedAnimal.id);
    setPendingAnimals(updated);
    setPresentedAnimal(null);

    if (updated.length === 0) {
      setShowModuleSuccess(true);
    }
  };

  return (
    <View style={animalGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.push({ pathname: '/animal-game/learn', params: { themeId: theme.id } });
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
          {theme.animals.length - pendingAnimals.length}/{theme.animals.length}
        </Text>
      </View>

      <View style={animalGameSharedStyles.stageArea}>
        <View style={animalGameSharedStyles.bigBox}>
          {presentedAnimal && (
            <Pressable
              style={animalGameSharedStyles.boxAudioBtn}
              onPress={() => {
                playWordThenAnimalSound(presentedAnimal.nameEn, presentedAnimal.id);
              }}
            >
              <Image
                source={require('@/assets/icons/music-on.png')}
                style={animalGameSharedStyles.boxAudioIcon}
                resizeMode="contain"
              />
            </Pressable>
          )}

          {presentedAnimal ? (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={animalGameSharedStyles.bigAnimalEmoji}>
                {presentedAnimal.emoji}
              </Text>
              <Text style={animalGameSharedStyles.bigAnimalName}>
                {presentedAnimal.nameEn}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={animalGameSharedStyles.bottomRow}>
        {leftAnimal ? (
          <Pressable
            style={[
              animalGameSharedStyles.slotBase,
              animalGameSharedStyles.slotBlue,
              presentedAnimal?.id === leftAnimal.id &&
                animalGameSharedStyles.slotSelected,
            ]}
            onPress={() => handleSelectAnimal(leftAnimal)}
          >
            {presentedAnimal?.id === leftAnimal.id ? null : (
              <Text style={animalGameSharedStyles.slotEmoji}>
                {leftAnimal.emoji}
              </Text>
            )}
          </Pressable>
        ) : null}

        {rightAnimal ? (
          <Pressable
            style={[
              animalGameSharedStyles.slotBase,
              animalGameSharedStyles.slotGreen,
              presentedAnimal?.id === rightAnimal.id &&
                animalGameSharedStyles.slotSelected,
            ]}
            onPress={() => handleSelectAnimal(rightAnimal)}
          >
            {presentedAnimal?.id === rightAnimal.id ? null : (
              <Text style={animalGameSharedStyles.slotEmoji}>
                {rightAnimal.emoji}
              </Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          style={[
            animalGameSharedStyles.confirmBtn,
            !presentedAnimal && animalGameSharedStyles.confirmBtnDisabled,
          ]}
          disabled={!presentedAnimal}
          onPress={handleConfirm}
        >
          <Text style={animalGameSharedStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
