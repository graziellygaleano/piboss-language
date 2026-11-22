import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { summaryStyles } from '@/styles/summary';
import { stopAllAudio } from '@/services/audioService';

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    world?: string;
    themeId?: string;
    totalAnimals?: string;
    correctCount?: string;
    isApproved?: string;
  }>();

  const world = params.world === 'habitats' ? 'habitats' : 'animals';
  const total = Math.max(1, parseInt(params.totalAnimals ?? '5', 10) || 5);
  const correct = Math.max(0, Math.min(total, parseInt(params.correctCount ?? '0', 10) || 0));
  const isApproved = params.isApproved === 'true';

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleFinish = () => {
    stopAllAudio();
    router.replace({ pathname: '/levels', params: { world } });
  };

  return (
    <View
      style={[
        summaryStyles.container,
        {
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom, 16),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        },
      ]}
    >
      <View style={summaryStyles.topBar}>
        <Pressable style={summaryStyles.backButton} onPress={handleFinish}>
          <Text style={summaryStyles.backButtonText}>◀ Níveis</Text>
        </Pressable>
      </View>

      <View style={summaryStyles.centerContent}>
        <Text style={summaryStyles.title}>
          {isApproved ? 'Parabéns!' : 'Bom Trabalho!'}
        </Text>

        <View style={summaryStyles.starsRow}>
          {Array.from({ length: total }).map((_, index) => {
            const isAcertou = index < correct;
            return (
              <View
                key={index}
                style={[
                  summaryStyles.starContainer,
                  isAcertou ? summaryStyles.starActive : summaryStyles.starInactive,
                ]}
              >
                <Text style={summaryStyles.starEmoji}>⭐</Text>
              </View>
            );
          })}
        </View>

        <View style={summaryStyles.scoreBadge}>
          <Text style={summaryStyles.scoreText}>
            {correct} / {total}
          </Text>
        </View>
      </View>

      <View style={summaryStyles.bottomBar}>
        <Pressable style={summaryStyles.confirmBtn} onPress={handleFinish}>
          <Text style={summaryStyles.confirmBtnIcon}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}
