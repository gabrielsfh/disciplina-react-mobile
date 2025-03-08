import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, KeyboardAvoidingView, TextInput, Button, ScrollView } from 'react-native';
import { useState } from 'react';
import '@expo/metro-runtime'

export default function App() {
  const [input, setInput] = useState('');

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.text}> Formulário </Text>
        {Array.from({ length: 10 }).map((_, index) => ( 
          <TextInput 
            key={index}
            style={styles.input}
            placeholder={`Campoa ${index + 1}`}
            value={input}
            onChangeText={setInput}
          />
        ))}
        <Button title="Enviar" onPress={() => alert('Dados enviados!')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    padding: 20
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8
  }
});