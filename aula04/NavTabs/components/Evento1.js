import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

function Evento1({ evento }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{evento}</Text>
      <Image 
        source={{ uri: 'https://images7.memedroid.com/images/UPLOADED601/61f49bdcf034b.jpeg' }} 
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Centers the content
    padding: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: 200, // Define a width
    height: 200, // Define a height
    borderRadius: 10, // Optional: to round the corners of the image
    resizeMode: 'cover', // Ensures the image covers the space
  },
});

export default Evento1;
