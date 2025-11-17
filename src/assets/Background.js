// src/assets/Background.js
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import background from '../assets/backgroundImg.png'; 

export default function Background({ children }) {
  return (
    <ImageBackground
      source={background}
      style={styles.background}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});