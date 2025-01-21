import React from 'react';
import {Image, SafeAreaView, StyleSheet, Text, View} from 'react-native';

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Welcome to Zenix</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  image: {
    width: 100, // Set the width
    height: 100, // Set the height
    resizeMode: 'contain', // You can also use 'cover', 'stretch', etc.
  },
});
