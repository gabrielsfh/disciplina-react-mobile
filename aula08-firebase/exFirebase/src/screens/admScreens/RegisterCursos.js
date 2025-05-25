// src/screens/RegisterCursos.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function RegisterCursos() {
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidadePeriodos, setQuantidadePeriodos] = useState('');

  const handleSubmit = async () => {
    if (!nome || !codigo || !quantidadePeriodos) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    const qtd = parseInt(quantidadePeriodos);
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert("Erro", "Quantidade de períodos deve ser um número válido maior que zero.");
      return;
    }

    try {
      const q = query(collection(db, 'cursos'), where('codigo', '==', codigo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        Alert.alert("Erro", "Já existe um curso com esse código.");
        return;
      }

      await addDoc(collection(db, 'cursos'), {
        nome,
        codigo,
        quantidadePeriodos: qtd,
      });

      Alert.alert("Sucesso", "Curso cadastrado!");
      setNome('');
      setCodigo('');
      setQuantidadePeriodos('');

    } catch (error) {
      Alert.alert("Erro", "Erro ao cadastrar o curso.");
      console.error("Erro:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Curso:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Engenharia de Software"
        value={nome}
        onChangeText={setNome}
      />

      <Text style={styles.label}>Código do Curso:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: ESW01"
        value={codigo}
        onChangeText={setCodigo}
      />

      <Text style={styles.label}>Quantidade de Períodos:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 8"
        value={quantidadePeriodos}
        onChangeText={setQuantidadePeriodos}
        keyboardType="numeric"
      />

      <Button title="Cadastrar Curso" onPress={handleSubmit} color="#007bff" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  label: {
    fontSize: 16,
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginTop: 4
  }
});
