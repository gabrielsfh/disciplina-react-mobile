import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';

export default function RegisterTema({ route }) {
  const { professorId } = route.params;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');

  useEffect(() => {
    const carregarCursosDoProfessor = async () => {
      try {
        const profRef = doc(db, 'usuarios', professorId);
        const profSnap = await getDoc(profRef);

        if (!profSnap.exists()) {
          console.warn('Professor não encontrado');
          return;
        }

        const data = profSnap.data();
        if (!data || !data.cursos) return;

        const cursosSnapshot = await getDocs(collection(db, 'cursos'));
        const cursosLista = [];

        cursosSnapshot.forEach(docSnap => {
          if (data.cursos.includes(docSnap.id)) {
            cursosLista.push({ id: docSnap.id, ...docSnap.data() });
          }
        });

        setCursos(cursosLista);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      }
    };

    carregarCursosDoProfessor();
  }, []);

  useEffect(() => {
    if (cursoSelecionado) {
      const curso = cursos.find(c => c.id === cursoSelecionado);
      if (curso) {
        const qtd = parseInt(curso.quantidadePeriodos, 10);
        const lista = [];
        for (let i = 1; i <= qtd; i++) lista.push(i.toString());
        setPeriodos(lista);
        setPeriodoSelecionado('');
      }
    } else {
      setPeriodos([]);
      setPeriodoSelecionado('');
    }
  }, [cursoSelecionado]);

  const handleSalvarTema = async () => {
    if (!titulo || !descricao || !cursoSelecionado || !periodoSelecionado) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      await addDoc(collection(db, 'temas'), {
        titulo,
        descricao,
        cursoId: cursoSelecionado,
        periodo: periodoSelecionado,
        professorId
      });

      Alert.alert('Sucesso', 'Tema cadastrado com sucesso!');
      setTitulo('');
      setDescricao('');
      setCursoSelecionado('');
      setPeriodoSelecionado('');
      setPeriodos([]);
    } catch (error) {
      console.error('Erro ao cadastrar tema: ', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o tema.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Título do Tema:</Text>
      <TextInput
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Digite o título"
      />

      <Text style={styles.label}>Descrição:</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição do tema"
        multiline
      />

      {cursos.length > 0 && (
        <>
          <Text style={styles.label}>Curso:</Text>
          {cursos.map(curso => (
            <View key={curso.id} style={styles.checkboxContainer}>
              <Checkbox
                value={cursoSelecionado === curso.id}
                onValueChange={() => setCursoSelecionado(curso.id)}
              />
              <Text style={styles.checkboxLabel}>{curso.nome}</Text>
            </View>
          ))}
        </>
      )}

      {periodos.length > 0 && (
        <>
          <Text style={styles.label}>Período:</Text>
          {periodos.map(p => (
            <View key={p} style={styles.checkboxContainer}>
              <Checkbox
                value={periodoSelecionado === p}
                onValueChange={() => setPeriodoSelecionado(p)}
              />
              <Text style={styles.checkboxLabel}>{p}º</Text>
            </View>
          ))}
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Cadastrar Tema" onPress={handleSalvarTema} color="#007bff" />
      </View>
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
