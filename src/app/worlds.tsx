import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { worldsStyles } from '@/styles/worlds';
import { speakWord, stopAllAudio } from '@/services/audioService';
import { getKidProfile, KidProfile } from '@/services/storageService';

export default function WorldsScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<KidProfile>({
    name: 'KidName',
    avatarColor: '#4D7BF3',
    avatarEmoji: '⭐',
  });

  useFocusEffect(
    useCallback(() => {
      getKidProfile().then(setProfile);
    }, [])
  );

  const kidName = profile.name;
  const profileColor = profile.avatarColor;

  const handleSelectWorld = (worldType: 'animals' | 'habitats') => {
    stopAllAudio();
    router.push({ pathname: '/levels', params: { world: worldType } });
  };

  const handleSpeakKidName = () => {
    speakWord(kidName);
  };

  const handleOpenProfile = () => {
    stopAllAudio();
    router.push('/profile');
  };

  return (
    <View
      style={[
        worldsStyles.container,
        {
          paddingTop: Math.max(insets.top, 14),
          paddingBottom: Math.max(insets.bottom, 14),
          paddingLeft: Math.max(insets.left, 28),
          paddingRight: Math.max(insets.right, 28),
        },
      ]}
    >
      <View style={worldsStyles.topBar}>
        <Pressable
          style={worldsStyles.backButton}
          onPress={() => {
            stopAllAudio();
            router.replace('/');
          }}
        >
          <Text style={worldsStyles.backButtonText}>◀ Início</Text>
        </Pressable>
      </View>

      <View style={worldsStyles.content}>
        <View style={worldsStyles.profileContainer}>
          <Pressable style={worldsStyles.profileAvatarBtn} onPress={handleOpenProfile}>
            <View style={[worldsStyles.profileAvatarCircle, { backgroundColor: profileColor }]}>
              <Text style={worldsStyles.profileAvatarText}>{profile.avatarEmoji || '⭐'}</Text>
            </View>
            <View style={worldsStyles.pencilBadge}>
              <Text style={worldsStyles.pencilBadgeText}>✏️</Text>
            </View>
          </Pressable>

          <Pressable style={worldsStyles.nameBadgeBox} onPress={handleSpeakKidName}>
            <View style={worldsStyles.listenKidNameBtn}>
              <Image
                source={require('@/assets/icons/music-on.png')}
                style={worldsStyles.listenKidNameIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={worldsStyles.kidNameText}>{kidName}</Text>
          </Pressable>
        </View>

        <Text style={worldsStyles.title}>Mundos:</Text>

        <View style={worldsStyles.worldsContainer}>
          <Pressable
            style={[worldsStyles.worldCardBtn, worldsStyles.worldCardAnimals]}
            onPress={() => handleSelectWorld('animals')}
          >
            <Text style={worldsStyles.worldCardEmoji}>🐾</Text>
            <Text style={worldsStyles.worldCardTitle}>Animais</Text>
          </Pressable>

          <Pressable
            style={[worldsStyles.worldCardBtn, worldsStyles.worldCardHabitats]}
            onPress={() => handleSelectWorld('habitats')}
          >
            <Text style={worldsStyles.worldCardEmoji}>🌍</Text>
            <Text style={worldsStyles.worldCardTitle}>Habitat</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
