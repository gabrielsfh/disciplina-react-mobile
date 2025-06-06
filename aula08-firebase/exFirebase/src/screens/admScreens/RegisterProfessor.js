import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';

export default function RegisterProfessor({ navigation }) {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [idfuncionario, setIdfuncionario] = useState('');
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
        [cursoId]: [],
      });
    }
  };

  const togglePeriodo = (cursoId, periodo) => {
    const selecionados = periodosPorCurso[cursoId] || [];
    const atualizados = selecionados.includes(periodo)
      ? selecionados.filter(p => p !== periodo)
      : [...selecionados, periodo];
    setPeriodosPorCurso({
      ...periodosPorCurso,
      [cursoId]: atualizados,
    });
  };

  const handleSubmit = async () => {
    if (!nome || !usuario || !email || !senha || !idfuncionario || cursosSelecionados.length === 0) {
      Alert.alert("Erro", "Preencha todos os campos e selecione ao menos um curso.");
      return;
    }

    const periodosSelecionados = Object.values(periodosPorCurso).flat();
    if (periodosSelecionados.length === 0) {
      Alert.alert("Erro", "Selecione ao menos um período.");
      return;
    }

    try {
      const qUser = query(
        collection(db, 'usuarios'),
        where('usuario', '==', usuario),
        where('tipoUsuario', '==', 'professor')
      );
      const qId = query(
        collection(db, 'usuarios'),
        where('idfuncionario', '==', idfuncionario),
        where('tipoUsuario', '==', 'professor')
      );
      const [userSnap, idSnap] = await Promise.all([getDocs(qUser), getDocs(qId)]);
      if (!userSnap.empty) {
        Alert.alert("Erro", "Já existe um professor com esse usuário.");
        return;
      }
      if (!idSnap.empty) {
        Alert.alert("Erro", "Já existe um professor com esse ID de funcionário.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const { uid } = userCredential.user;

      const periodosOrdenados = {};
      Object.keys(periodosPorCurso).forEach(cursoId => {
        periodosOrdenados[cursoId] = [...periodosPorCurso[cursoId]].sort((a, b) => a - b);
      });

      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        nome,
        email,
        usuario,
        idfuncionario,
        cursos: cursosSelecionados,
        periodos: periodosOrdenados,
        tipoUsuario: 'professor'
      });

      Alert.alert("Sucesso", "Professor cadastrado!");
      setNome('');
      setUsuario('');
      setEmail('');
      setSenha('');
      setIdfuncionario('');
      setCursosSelecionados([]);
      setPeriodosPorCurso({});

      navigation.navigate('UsersList');

    } catch (error) {
      console.error("Erro ao cadastrar professor: ", error);
      Alert.alert("Erro", "Não foi possível cadastrar o professor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

      <Text style={styles.label}>Usuário:</Text>
      <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} placeholder="Nome de usuário" />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha:</Text>
      <TextInput style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} placeholder="Senha" />

      <Text style={styles.label}>ID Funcionário:</Text>
      <TextInput style={styles.input} value={idfuncionario} onChangeText={setIdfuncionario} placeholder="Ex: FUNC123" />

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
        const selecionados = periodosPorCurso[cursoId] || [];

        return (
          <View key={cursoId}>
            <Text style={styles.label}>Períodos para {curso.nome}:</Text>
            {[...Array(total)].map((_, i) => {
              const p = i + 1;
              return (
                <View key={p} style={styles.checkboxContainer}>
                  <Checkbox
                    value={selecionados.includes(p)}
                    onValueChange={() => togglePeriodo(cursoId, p)}
                  />
                  <Text style={styles.checkboxLabel}>{p}º</Text>
                </View>
              );
            })}
          </View>
        );
      })}

      <Button title="Cadastrar Professor" onPress={handleSubmit} color="#007bff" />
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
  }
});
