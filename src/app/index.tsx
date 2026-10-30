import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { homeStyles } from '@/styles/home';
import { Link } from 'expo-router';


export default function HomeScreen() {
  
  return (
      
    <View style={homeStyles.container}>
   
      <Image 
        source={require('../../assets/images/logo.png')} 
        style={homeStyles.logo}
        resizeMode="contain"
      />

  <Link href="/levels" asChild>
    <TouchableOpacity >
      <Image 
        source={require('../../assets/icons/play-button.png')} 
        style={{ width: 90, height: 90, paddingLeft: 20 }} 
        resizeMode="contain"
      />
    </TouchableOpacity>
  </Link>


    </View>
  );
}

