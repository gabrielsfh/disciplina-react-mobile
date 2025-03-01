import React from 'react';
import { View, StyleSheet } from 'react-native';
import Box from "./components/Box";
import '@expo/metro-runtime';

export default function App(){
  return(
    <View style={styles.container}>
      <Box nome="Caixa 1"/>
      <Box nome="Caixa 2"/>
      <Box nome="Caixa 3"/>
      <Box nome="Caixa 4"/>
    </View>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'blue'
  },
  box: {
    width: 200,
    height: 200,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: 'white',
    fontSize: 18
  }
});



