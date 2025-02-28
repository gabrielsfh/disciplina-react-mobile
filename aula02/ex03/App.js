import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import '@expo/metro-runtime';

export default function App(){
  return(
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Caixa 1</Text>
      </View>
      <View style={styles.box}>
        <Text style={styles.text}>Caixa 2</Text>
      </View>
      <View style={styles.box}>
        <Text style={styles.text}>Caixa 3</Text>
      </View>
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



