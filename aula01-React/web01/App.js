import React from 'react';
import { View, StyleSheet, Image } from 'react-native'; // Added Image import
import Hello from './components/Hello';
import Greeting from './components/Greeting';
import Counter from "./components/Counter";
import '@expo/metro-runtime';

export default function App() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={{
          uri: "https://media.tenor.com/DFfCL02_DCcAAAAe/cat-look.png",
        }}
      />
      <Counter/>
      <Hello/>
      <Greeting name="Rafael"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  logo: {  // Added a style for the logo
    width: 200,  // Set the width of the image
    height: 200,  // Set the height of the image
    resizeMode: 'contain',  // Keeps the aspect ratio
    alignSelf: 'center',  // Centers the image
  },
  text: {
    fontSize: 100,
    textAlign: 'center',
    margin: 10,
  }
});
