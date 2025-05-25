import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function RegisterAlunos({ navigation }) {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [nmatricula, setNmatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState([]);

  useEffect(() => {
    const fetchCursos = async () => {
      const cursosSnapshot = await getDocs(collection(db, 'cursos'));
      const cursosList = cursosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCursosDisponiveis(cursosList);
    };

    fetchCursos();
  }, []);

  useEffect(() => {
    if (!curso) {
      setPeriodosDisponiveis([]);
      setPeriodo('');
      return;
    }

    const cursoSelecionado = cursosDisponiveis.find(c => c.id === curso);

    if (cursoSelecionado && cursoSelecionado.quantidadePeriodos) {
      const qtd = parseInt(cursoSelecionado.quantidadePeriodos, 10);
      const periodos = [];
      for (let i = 1; i <= qtd; i++) {
        periodos.push(i.toString());
      }
      setPeriodosDisponiveis(periodos);
      setPeriodo('');
    } else {
      setPeriodosDisponiveis([]);
      setPeriodo('');
    }
  }, [curso, cursosDisponiveis]);

  const handleSubmit = async () => {
    if (!nome || !usuario || !nmatricula || !senha || !curso || !periodo) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    try {
      // Verificar se usuario já existe (tipo aluno)
      const usuarioQuery = query(
        collection(db, 'usuarios'), 
        where('usuario', '==', usuario),
        where('tipoUsuario', '==', 'aluno')
      );
      const matriculaQuery = query(
        collection(db, 'usuarios'), 
        where('nmatricula', '==', nmatricula),
        where('tipoUsuario', '==', 'aluno')
      );
      const usuarioSnapshot = await getDocs(usuarioQuery);
      const matriculaSnapshot = await getDocs(matriculaQuery);

      if (!usuarioSnapshot.empty) {
        Alert.alert("Erro", "Já existe um aluno com esse usuário.");
        return;
      }

      if (!matriculaSnapshot.empty) {
        Alert.alert("Erro", "Já existe um aluno com essa matrícula.");
        return;
      }

      await addDoc(collection(db, 'usuarios'), {
        nome,
        usuario,
        nmatricula,
        senha,
        curso,
        periodo,
        tipoUsuario: 'aluno'
      });

      Alert.alert("Sucesso", "Aluno cadastrado!");
      setNome('');
      setUsuario('');
      setNmatricula('');
      setSenha('');
      setCurso('');
      setPeriodo('');

    } catch (error) {
      Alert.alert("Erro", "Erro ao cadastrar o aluno.");
      console.error("Erro:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

      <Text style={styles.label}>Usuário:</Text>
      <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} placeholder="Nome de usuário" />

      <Text style={styles.label}>Número de Matrícula:</Text>
      <TextInput style={styles.input} value={nmatricula} onChangeText={setNmatricula} placeholder="Ex: 2023012345" keyboardType="numeric" />

      <Text style={styles.label}>Senha:</Text>
      <TextInput style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} placeholder="Senha" />

      <Text style={styles.label}>Curso:</Text>
      <Picker
        selectedValue={curso}
        style={styles.picker}
        onValueChange={(itemValue) => setCurso(itemValue)}
      >
        <Picker.Item label="Selecione um curso" value="" />
        {cursosDisponiveis.map(c => (
          <Picker.Item key={c.id} label={c.nome} value={c.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Período:</Text>
      <Picker
        selectedValue={periodo}
        style={styles.picker}
        onValueChange={(itemValue) => setPeriodo(itemValue)}
        enabled={periodosDisponiveis.length > 0}
      >
        <Picker.Item label="Selecione um período" value="" />
        {periodosDisponiveis.map(p => (
          <Picker.Item key={p} label={`${p}º`} value={p} />
        ))}
      </Picker>

      <Button title="Cadastrar Aluno" onPress={handleSubmit} color="#28a745" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  },
  picker: {
    height: 50,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ccc'
  }
});
