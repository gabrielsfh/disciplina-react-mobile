import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';

export default function RegisterAlunos({ navigation }) {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [nmatricula, setNmatricula] = useState('');
  const [senha, setSenha] = useState('');
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [cursosSelecionados, setCursosSelecionados] = useState([]);
  const [periodosPorCurso, setPeriodosPorCurso] = useState({});

  useEffect(() => {
    const fetchCursos = async () => {
      const snapshot = await getDocs(collection(db, 'cursos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCursosDisponiveis(lista);
    };
    fetchCursos();
  }, []);

  const toggleCurso = (cursoId) => {
    if (cursosSelecionados.includes(cursoId)) {
      setCursosSelecionados(cursosSelecionados.filter(id => id !== cursoId));
      const updated = { ...periodosPorCurso };
      delete updated[cursoId];
      setPeriodosPorCurso(updated);
    } else {
      setCursosSelecionados([...cursosSelecionados, cursoId]);
      setPeriodosPorCurso({
        ...periodosPorCurso,
        [cursoId]: '',
      });
    }
  };

  const handlePeriodoChange = (cursoId, periodo) => {
    setPeriodosPorCurso({
      ...periodosPorCurso,
      [cursoId]: periodo,
    });
  };

  const handleSubmit = async () => {
    if (!nome || !usuario || !email || !nmatricula || !senha || cursosSelecionados.length === 0) {
      Alert.alert("Erro", "Preencha todos os campos e selecione ao menos um curso.");
      return;
    }

    const periodosPreenchidos = cursosSelecionados.every(cursoId => periodosPorCurso[cursoId]);
    if (!periodosPreenchidos) {
      Alert.alert("Erro", "Selecione um período para cada curso.");
      return;
    }

    try {
      const [usuarioSnap, matriculaSnap, emailSnap] = await Promise.all([
        getDocs(query(collection(db, 'usuarios'), where('usuario', '==', usuario), where('tipoUsuario', '==', 'aluno'))),
        getDocs(query(collection(db, 'usuarios'), where('nmatricula', '==', nmatricula), where('tipoUsuario', '==', 'aluno'))),
        getDocs(query(collection(db, 'usuarios'), where('email', '==', email), where('tipoUsuario', '==', 'aluno')))
      ]);

      if (!usuarioSnap.empty) {
        Alert.alert("Erro", "Já existe um aluno com esse nome de usuário.");
        return;
      }

      if (!matriculaSnap.empty) {
        Alert.alert("Erro", "Já existe um aluno com essa matrícula.");
        return;
      }

      if (!emailSnap.empty) {
        Alert.alert("Erro", "Já existe um aluno com esse email.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        nome,
        usuario,
        email,
        nmatricula,
        cursos: cursosSelecionados,
        periodos: periodosPorCurso,
        tipoUsuario: 'aluno'
      });

      Alert.alert("Sucesso", "Aluno cadastrado!");
      setNome('');
      setUsuario('');
      setEmail('');
      setNmatricula('');
      setSenha('');
      setCursosSelecionados([]);
      setPeriodosPorCurso({});

      navigation.navigate('UsersList');
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);
      Alert.alert("Erro", "Não foi possível cadastrar o aluno.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

      <Text style={styles.label}>Nome de usuário:</Text>
      <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} placeholder="Nome de usuário" />

      <Text style={styles.label}>Email:</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Número de Matrícula:</Text>
      <TextInput style={styles.input} value={nmatricula} onChangeText={setNmatricula} placeholder="Ex: 2023012345" keyboardType="numeric" />

      <Text style={styles.label}>Senha:</Text>
      <TextInput style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} placeholder="Senha" />

      <Text style={styles.label}>Cursos:</Text>
      {cursosDisponiveis.map(curso => (
        <View key={curso.id} style={styles.checkboxContainer}>
          <Checkbox
            value={cursosSelecionados.includes(curso.id)}
            onValueChange={() => toggleCurso(curso.id)}
          />
          <Text style={styles.checkboxLabel}>{curso.nome}</Text>
        </View>
      ))}

      {cursosSelecionados.map(cursoId => {
        const curso = cursosDisponiveis.find(c => c.id === cursoId);
        const total = parseInt(curso?.quantidadePeriodos || '0', 10);
        const periodos = Array.from({ length: total }, (_, i) => (i + 1).toString());

        return (
          <View key={cursoId}>
            <Text style={styles.label}>Período para {curso.nome}:</Text>
            <Picker
              selectedValue={periodosPorCurso[cursoId] || ''}
              onValueChange={(value) => handlePeriodoChange(cursoId, value)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um período" value="" />
              {periodos.map(p => (
                <Picker.Item key={p} label={`${p}º`} value={p} />
              ))}
            </Picker>
          </View>
        );
      })}

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4
  },
  checkboxLabel: {
    marginLeft: 8
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 4
  }
});
