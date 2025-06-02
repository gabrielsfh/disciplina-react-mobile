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
  updateDoc
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
    snapshot.forEach(doc => {
      const data = doc.data();
      map[doc.id] = data.nome;
    });
    setMapCursoIdNome(map);
  };

  const carregarTemas = async (alunoData) => {
    try {
      const snapshot = await getDocs(collection(db, 'temas'));
      const temasFiltrados = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const cursoId = data.cursoId;
        const periodo = data.periodo.toString();

        if (
          alunoData.cursos.includes(cursoId) &&
          alunoData.periodos?.[cursoId]?.toString() === periodo
        ) {
          temasFiltrados.push({ id: docSnap.id, ...data });
        }
      });

      setTemas(temasFiltrados);
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
    }
  };

  const verificarProjetosExistentes = async (alunoId) => {
    const q = query(collection(db, 'projetos'), where('alunoId', '==', alunoId));
    const snap = await getDocs(q);
    const projetos = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProjetosExistentes(projetos);
  };

  const limparCampos = () => {
    setTemaSelecionado('');
    setNomeProjeto('');
    setDescricaoProjeto('');
  };

  const handleSelecionarTema = (temaId) => {
    setTemaSelecionado(temaId);
    const tema = temas.find(t => t.id === temaId);
    if (!tema) return;

    const projetoExistente = projetosExistentes.find(
      p => p.cursoId === tema.cursoId && p.periodo === tema.periodo
    );

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

    const tema = temas.find(t => t.id === temaSelecionado);
    const projetoExistente = projetosExistentes.find(
      p => p.cursoId === tema.cursoId && p.periodo === tema.periodo
    );

    try {
      if (projetoExistente) {
        const projetoRef = doc(db, 'projetos', projetoExistente.id);
        await updateDoc(projetoRef, {
          nomeProjeto,
          descricaoProjeto
        });
        Alert.alert('Sucesso', 'Projeto atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'projetos'), {
          alunoId: usuario.uid,
          cursoId: tema.cursoId,
          periodo: tema.periodo,
          temaId: tema.id,
          nomeProjeto,
          descricaoProjeto
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
          const nomeCurso = mapCursoIdNome[tema.cursoId] || 'Curso desconhecido';
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
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 12
  }
});
