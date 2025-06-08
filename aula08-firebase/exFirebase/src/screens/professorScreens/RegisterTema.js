import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, addDoc, getDocs, doc, getDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
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
  const [tipoUsuario, setTipoUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProfessorId(user.uid);
        const userRef = doc(db, 'usuarios', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setTipoUsuario(data.tipoUsuario || 'professor');

          if (data.tipoUsuario === 'administrador') {
            await carregarTodosCursosEPeriodos();
          } else {
            await carregarCursosDoProfessor(user.uid);
          }
        }
      }
    });

    return unsubscribe;
  }, []);

  const carregarCursosDoProfessor = async (uid) => {
    try {
      const profRef = doc(db, 'usuarios', uid);
      const profSnap = await getDoc(profRef);

      if (!profSnap.exists()) return;

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

  const carregarTodosCursosEPeriodos = async () => {
    try {
      const cursosSnapshot = await getDocs(collection(db, 'cursos'));
      const cursosLista = [];
      const todosPeriodos = {};

      cursosSnapshot.forEach(docSnap => {
        const cursoData = docSnap.data();
        const quantidadePeriodos = cursoData.quantidadePeriodos || 1;

        cursosLista.push({ id: docSnap.id, ...cursoData });
        todosPeriodos[docSnap.id] = Array.from({ length: quantidadePeriodos }, (_, i) => (i + 1).toString());
      });

      setCursos(cursosLista);
      setPeriodosDoProfessor(todosPeriodos);
    } catch (error) {
      console.error('Erro ao carregar todos os cursos e períodos:', error);
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
        const novoTemaRef = await addDoc(collection(db, 'temas'), {
          titulo,
          descricao,
          cursoId: cursoRef,
          periodo: periodoSelecionado,
          professorId: professorRef
        });

        setTemaId(novoTemaRef.id); // <== aqui está a correção

        Alert.alert('Sucesso', 'Tema cadastrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      Alert.alert('Erro', 'Não foi possível salvar o tema.');
    }
  };

  const handleDeletarTema = async () => {
    if (!temaId) {
      Alert.alert('Erro', 'Nenhum tema selecionado para deletar.');
      return;
    }

    if (tipoUsuario !== 'administrador') {
      Alert.alert('Permissão negada', 'Somente administradores podem deletar temas.');
      return;
    }

    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja deletar este tema? Isso também removerá todos os projetos, avaliações e a associação com professores/avaliadores. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              const temaRef = doc(db, 'temas', temaId);

              // Deletar projetos
              const projetosQuery = query(collection(db, 'projetos'), where('temaId', '==', temaRef));
              const projetosSnapshot = await getDocs(projetosQuery);
              for (const projetoDoc of projetosSnapshot.docs) {
                await deleteDoc(projetoDoc.ref);
              }

              // Deletar avaliações
              const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('temaId', '==', temaRef));
              const avaliacoesSnapshot = await getDocs(avaliacoesQuery);
              for (const avaliacaoDoc of avaliacoesSnapshot.docs) {
                await deleteDoc(avaliacaoDoc.ref);
              }

              // Remover o tema do array 'temas' dos usuários
              const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
              for (const usuarioDoc of usuariosSnapshot.docs) {
                const usuarioData = usuarioDoc.data();
                if (Array.isArray(usuarioData.temas) && usuarioData.temas.includes(temaId)) {
                  const novosTemas = usuarioData.temas.filter(id => id !== temaId);
                  await updateDoc(usuarioDoc.ref, { temas: novosTemas });
                }
              }

              // Deletar o tema
              await deleteDoc(temaRef);

              setTitulo('');
              setDescricao('');
              setTemaId(null);

              Alert.alert('Sucesso', 'Tema, projetos, avaliações e vínculos com usuários removidos.');
            } catch (error) {
              console.error('Erro ao deletar tema e relacionados:', error);
              Alert.alert('Erro', 'Falha ao deletar o tema e seus vínculos.');
            }
          }
        }
      ]
    );
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

      {temaId && tipoUsuario === 'administrador' && (
        <View style={{ marginTop: 10 }}>
          <Button title="Deletar Tema" onPress={handleDeletarTema} color="red" />
        </View>
      )}

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
