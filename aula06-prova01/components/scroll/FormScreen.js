import React, { useState } from "react";
import {
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Text,
  StyleSheet,
  View,
  Button,
} from "react-native";
const FormScreen = () => {
  // Inicializa um array com 10 entradas vazias.
  const [inputs, setInputs] = useState(Array(10).fill(""));
  const handleInputChange = (text, index) => {
    const updatedInputs = [...inputs];
    updatedInputs[index] = text;
    setInputs(updatedInputs);
  };
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Formulário</Text>
        {Array.from({ length: 10 }).map((_, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Campo ${index + 1}`}
            value={inputs[index]} // Valor correspondente ao índice
            // Atualiza o valor do índice específico
            onChangeText={(text) => handleInputChange(text, index)}
          />
        ))}
        <Button
          title="Enviar"
          onPress={() => alert(`Dados enviados: ${JSON.stringify(inputs)}`)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});
export default FormScreen;
