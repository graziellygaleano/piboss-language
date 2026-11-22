import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { homeStyles } from '@/styles/home';

export default function HomeScreen() {
  return (
    <View style={homeStyles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={homeStyles.logo}
        resizeMode="contain"
      />

      <Pressable onPress={() => router.push('/worlds')}>
        <Image
          source={require('@/assets/icons/play-button.png')}
          style={homeStyles.playButton}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}
