import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

export default function RegistrarProjeto() {
  const [temas, setTemas] = useState([]);
  const [mapCursoIdNome, setMapCursoIdNome] = useState({});
  const [temaSelecionado, setTemaSelecionado] = useState('');
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [descricaoProjeto, setDescricaoProjeto] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [projetosExistentes, setProjetosExistentes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          Alert.alert('Erro', 'Usuário não encontrado.');
          return;
        }

        const userData = userSnap.data();

        if (userData.tipoUsuario !== 'aluno') {
          Alert.alert('Acesso negado', 'Somente alunos podem registrar projetos.');
          return;
        }

        setUsuario({ uid: user.uid, ...userData });

        await carregarCursos();
        await carregarTemas(userData);
        await verificarProjetosExistentes(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const carregarCursos = async () => {
    const snapshot = await getDocs(collection(db, 'cursos'));
    const map = {};
    snapshot.forEach((doc) => {
      map[doc.id] = doc.data().nome;
    });
    setMapCursoIdNome(map);
  };

  const carregarTemas = async (alunoData) => {
    try {
      const snapshot = await getDocs(collection(db, 'temas'));
      const temasFiltrados = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const cursoId = data.cursoId?.id || data.cursoId; // Pega o ID do curso
        const periodo = data.periodo?.toString();

        const alunoTemCurso = alunoData?.cursos?.includes(cursoId);
        const alunoTemPeriodo = alunoData?.periodos?.[cursoId]?.toString() === periodo;

        if (alunoTemCurso && alunoTemPeriodo) {
          temasFiltrados.push({ id: docSnap.id, ...data });
        }
      });

      setTemas(temasFiltrados);
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os temas.');
    }
  };

  const verificarProjetosExistentes = async (alunoId) => {
    try {
      const alunoRef = doc(db, 'usuarios', alunoId);
      const q = query(collection(db, 'projetos'), where('alunoId', '==', alunoRef));
      const snap = await getDocs(q);
      const projetos = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjetosExistentes(projetos);
    } catch (error) {
      console.error('Erro ao verificar projetos:', error);
      Alert.alert('Erro', 'Não foi possível verificar projetos existentes.');
    }
  };

  const limparCampos = () => {
    setTemaSelecionado('');
    setNomeProjeto('');
    setDescricaoProjeto('');
  };

  const handleSelecionarTema = (temaId) => {
    setTemaSelecionado(temaId);
    const tema = temas.find((t) => t.id === temaId);
    if (!tema) return;

    const cursoIdTema = tema.cursoId?.id || tema.cursoId;

    const projetoExistente = projetosExistentes.find((p) => {
      const cursoIdProjeto = p.cursoId?.id || p.cursoId;
      return cursoIdProjeto === cursoIdTema && p.periodo === tema.periodo;
    });

    if (projetoExistente) {
      setNomeProjeto(projetoExistente.nomeProjeto || '');
      setDescricaoProjeto(projetoExistente.descricaoProjeto || '');
    } else {
      setNomeProjeto('');
      setDescricaoProjeto('');
    }
  };

  const handleRegistrarProjeto = async () => {
    if (!nomeProjeto || !descricaoProjeto || !temaSelecionado) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const tema = temas.find((t) => t.id === temaSelecionado);
    if (!tema) {
      Alert.alert('Erro', 'Tema selecionado inválido.');
      return;
    }

    const alunoRef = doc(db, 'usuarios', usuario.uid);
    const temaRef = doc(db, 'temas', tema.id);
    const cursoId = tema.cursoId?.id || tema.cursoId;
    const cursoRef = doc(db, 'cursos', cursoId);

    const projetoExistente = projetosExistentes.find(
      (p) => (p.cursoId?.id || p.cursoId) === cursoId && p.periodo === tema.periodo
    );

    try {
      if (projetoExistente) {
        const projetoRef = doc(db, 'projetos', projetoExistente.id);
        await updateDoc(projetoRef, {
          nomeProjeto,
          descricaoProjeto,
          temaId: temaRef,
          alunoId: alunoRef,
          cursoId: cursoRef,
          periodo: tema.periodo,
        });
        Alert.alert('Sucesso', 'Projeto atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'projetos'), {
          alunoId: alunoRef,
          cursoId: cursoRef,
          periodo: tema.periodo,
          temaId: temaRef,
          nomeProjeto,
          descricaoProjeto,
        });
        Alert.alert('Sucesso', 'Projeto registrado com sucesso!');
      }

      await verificarProjetosExistentes(usuario.uid);
      limparCampos();
    } catch (error) {
      console.error('Erro ao registrar/atualizar projeto:', error);
      Alert.alert('Erro', 'Não foi possível registrar/atualizar o projeto.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar ou Editar Projeto</Text>

      <Text style={styles.label}>Selecione o curso e tema</Text>
      <Picker
        selectedValue={temaSelecionado}
        onValueChange={(itemValue) => handleSelecionarTema(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Selecione um tema" value="" />
        {temas.map((tema) => {
          const cursoId = tema.cursoId?.id || tema.cursoId;
          const nomeCurso = mapCursoIdNome[cursoId] || 'Curso desconhecido';
          return (
            <Picker.Item
              key={tema.id}
              label={`${tema.titulo} (${nomeCurso})`}
              value={tema.id}
            />
          );
        })}
      </Picker>

      <Text style={styles.label}>Título do Projeto:</Text>
      <TextInput
        style={styles.input}
        value={nomeProjeto}
        onChangeText={setNomeProjeto}
        placeholder="Título do Projeto"
      />

      <Text style={styles.label}>Descrição do Projeto:</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={descricaoProjeto}
        onChangeText={setDescricaoProjeto}
        placeholder="Descrição do Projeto"
        multiline
      />

      <Button title="Salvar Projeto" onPress={handleRegistrarProjeto} color="#007bff" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginTop: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 12,
  },
});