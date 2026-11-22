import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getHabitatThemeById } from '@/data/gameData';
import { habitatGameSharedStyles } from '@/styles/habitat-game/gameStyles';
import { speakWord, stopAllAudio } from '@/services/audioService';
import { ModuleSuccessOverlay } from '@/components/ModuleSuccessOverlay';

export default function HabitatIntroScreen() {
  const { themeId } = useLocalSearchParams<{ themeId?: string }>();
  const theme = useMemo(() => getHabitatThemeById(themeId), [themeId]);

  const [visibleCount, setVisibleCount] = useState(0);
  const [showModuleSuccess, setShowModuleSuccess] = useState(false);

  useEffect(() => {
    speakWord(theme.nameEn);
    return () => {
      stopAllAudio();
    };
  }, [theme]);

  useEffect(() => {
    setVisibleCount(0);
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < theme.animals.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [theme.animals.length]);

  const isReady = visibleCount >= theme.animals.length;
  const visibleAnimals = theme.animals.slice(0, visibleCount);

  const handleConfirm = () => {
    if (!isReady) return;
    stopAllAudio();
    setShowModuleSuccess(true);
  };

  return (
    <View style={habitatGameSharedStyles.screen}>
      <ModuleSuccessOverlay
        visible={showModuleSuccess}
        onFinish={() => {
          router.push({ pathname: '/habitat-game/ecosystem', params: { themeId: theme.id } });
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
          <View style={[habitatGameSharedStyles.stageDot, habitatGameSharedStyles.stageDotActive]} />
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={habitatGameSharedStyles.stageDot} />
          <View style={habitatGameSharedStyles.stageDot} />
        </View>
      </View>

      <View style={habitatGameSharedStyles.stageArea}>
        <View style={[habitatGameSharedStyles.bigHabitatBox, { backgroundColor: theme.color }]}>
          <Pressable
            style={habitatGameSharedStyles.boxAudioBtn}
            onPress={() => speakWord(theme.nameEn)}
          >
            <Image
              source={require('@/assets/icons/music-on.png')}
              style={habitatGameSharedStyles.boxAudioIcon}
              resizeMode="contain"
            />
          </Pressable>

          {theme.image ? (
            <Image source={theme.image} style={habitatGameSharedStyles.bigHabitatImage} resizeMode="cover" />
          ) : (
            <Text style={habitatGameSharedStyles.bigHabitatEmoji}>{theme.emoji}</Text>
          )}
          <Text style={habitatGameSharedStyles.bigHabitatTitle}>{theme.nameEn}</Text>
          <Text style={habitatGameSharedStyles.bigHabitatSub}>{theme.namePt}</Text>
        </View>

        <View style={habitatGameSharedStyles.sequentialAnimalsScroll}>
          {visibleAnimals.map((animal) => (
            <Pressable
              key={animal.id}
              style={habitatGameSharedStyles.introAnimalCard}
              onPress={() => speakWord(animal.nameEn)}
            >
              <Text style={habitatGameSharedStyles.introAnimalEmoji}>{animal.emoji}</Text>
              <Text style={habitatGameSharedStyles.introAnimalName}>{animal.nameEn}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        style={[
          habitatGameSharedStyles.bottomRow,
          { opacity: isReady ? 1 : 0, pointerEvents: isReady ? 'auto' : 'none' },
        ]}
      >
        <Pressable
          disabled={!isReady}
          style={habitatGameSharedStyles.confirmBtn}
          onPress={handleConfirm}
        >
          <Text style={habitatGameSharedStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
