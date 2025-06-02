import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, addDoc, getDocs, doc, getDoc, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';

export default function ManageTema() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cursos, setCursos] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState('');
  const [periodos, setPeriodos] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');
  const [professorId, setProfessorId] = useState(null);
  const [temaId, setTemaId] = useState(null);
  const [periodosDoProfessor, setPeriodosDoProfessor] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProfessorId(user.uid);
        await carregarCursosDoProfessor(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const carregarCursosDoProfessor = async (uid) => {
    try {
      const profRef = doc(db, 'usuarios', uid);
      const profSnap = await getDoc(profRef);

      if (!profSnap.exists()) {
        console.warn('Professor não encontrado');
        return;
      }

      const data = profSnap.data();
      if (!data?.cursos) return;

      setPeriodosDoProfessor(data.periodos || {});

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

  useEffect(() => {
    if (cursoSelecionado) {
      const periodosPermitidos = periodosDoProfessor[cursoSelecionado] || [];
      setPeriodos(periodosPermitidos.map(p => p.toString()));
      setPeriodoSelecionado('');
      setTitulo('');
      setDescricao('');
      setTemaId(null);
    } else {
      setPeriodos([]);
      setPeriodoSelecionado('');
      setTitulo('');
      setDescricao('');
      setTemaId(null);
    }
  }, [cursoSelecionado, periodosDoProfessor]);

  useEffect(() => {
    if (cursoSelecionado && periodoSelecionado) {
      carregarTemaExistente(cursoSelecionado, periodoSelecionado);
    } else {
      setTitulo('');
      setDescricao('');
      setTemaId(null);
    }
  }, [cursoSelecionado, periodoSelecionado]);

  const carregarTemaExistente = async (cursoId, periodo) => {
    try {
      const temasRef = collection(db, 'temas');
      const q = query(
        temasRef,
        where('cursoId', '==', doc(db, 'cursos', cursoId)),
        where('periodo', '==', periodo)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const temaDoc = querySnapshot.docs[0];
        const temaData = temaDoc.data();

        setTitulo(temaData.titulo || '');
        setDescricao(temaData.descricao || '');
        setTemaId(temaDoc.id);
      } else {
        setTitulo('');
        setDescricao('');
        setTemaId(null);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
      Alert.alert('Erro', 'Não foi possível carregar o tema existente.');
    }
  };

  const handleSalvarTema = async () => {
    if (!titulo || !descricao || !cursoSelecionado || !periodoSelecionado) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      const cursoRef = doc(db, 'cursos', cursoSelecionado);
      const professorRef = doc(db, 'usuarios', professorId);

      if (temaId) {
        const temaRef = doc(db, 'temas', temaId);
        await updateDoc(temaRef, {
          titulo,
          descricao,
          professorId: professorRef
        });

        Alert.alert('Sucesso', 'Tema atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'temas'), {
          titulo,
          descricao,
          cursoId: cursoRef,
          periodo: periodoSelecionado,
          professorId: professorRef
        });

        Alert.alert('Sucesso', 'Tema cadastrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      Alert.alert('Erro', 'Não foi possível salvar o tema.');
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
        <Button title="Salvar Tema" onPress={handleSalvarTema} color="#007bff" />
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
