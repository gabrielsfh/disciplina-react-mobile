import React from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { useState } from 'react';


export default function Counter() {
  const [count, setCount] = useState(987654321);

  return (
    <View style={styles.container}>
          <Text style={styles.text}> Você clicou {count} vezes</Text>
          <Button style={styles.button} title="Clique aqui" onPress={ () => {setCount (count + 1)}}/>
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
    text:{
      fontSize: 100,
      fontFamily: "Comic Sans MS",
      textAlign: 'center', 
      margin:10,
      color: "white",
      backgroundColor: "blue"
    }
  });
  