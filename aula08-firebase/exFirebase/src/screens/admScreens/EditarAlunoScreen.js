import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView
} from 'react-native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';

export default function EditarAlunoScreen({ navigation, route }) { // Fixed syntax: added comma
  const { uid } = route.params;

  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [nmatricula, setNmatricula] = useState('');
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [cursosSelecionados, setCursosSelecionados] = useState([]);
  const [periodosPorCurso, setPeriodosPorCurso] = useState({});
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cursos'));
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCursosDisponiveis(lista);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      }
    };
    fetchCursos();
  }, []);


  const fetchAluno = useCallback(async () => {
    try {
      const alunoRef = doc(db, 'usuarios', uid);
      const alunoSnap = await getDoc(alunoRef);
      if (!alunoSnap.exists()) {
        Alert.alert('Erro', 'Aluno não encontrado.');
        navigation.goBack();
        return;
      }

      const data = alunoSnap.data();
      if (data.tipoUsuario !== 'aluno') {
        Alert.alert('Erro', 'Usuário não é um aluno.');
        navigation.goBack();
        return;
      }

      setNome(data.nome || '');
      setUsuario(data.usuario || '');
      setNmatricula(data.nmatricula || '');
      setCursosSelecionados(data.cursos || []);
      setPeriodosPorCurso(data.periodos || {});

      await fetchProjetosETemas(alunoRef);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do aluno.');
      navigation.goBack();
    }
  }, [uid, navigation]);

  useEffect(() => {
    fetchAluno();
  }, [fetchAluno]);

  
  const fetchProjetosETemas = useCallback(async (alunoRef) => {
    try {
   
      const q = query(collection(db, 'projetos'), where('alunoId', '==', alunoRef));
      const snap = await getDocs(q);

      const projetosExistentes = await Promise.all(snap.docs.map(async (docProjeto) => {
        const projetoData = docProjeto.data();
        const temaRef = projetoData.temaId;
        let temaData = null;
        let cursoData = null;

        const temaSnap = await getDoc(temaRef);
        if (temaSnap.exists()) {
          temaData = { id: temaSnap.id, ...temaSnap.data() };
          const cursoRef = temaData.cursoId;
          if (cursoRef) {
            const cursoSnap = await getDoc(cursoRef);
            if (cursoSnap.exists()) {
              cursoData = cursoSnap.data();
            }
          }
        }

        return {
          id: docProjeto.id,
          key: docProjeto.id, 
          ...projetoData,
          tema: temaData,
          curso: cursoData,
          novo: false,
        };
      }));

    
      const novosProjetos = [];
      let tempIndex = 0; 
      for (const cursoId of cursosSelecionados) {
        const periodo = periodosPorCurso[cursoId];
        if (!periodo) continue;

        const temasSnap = await getDocs(query(
          collection(db, 'temas'),
          where('cursoId', '==', doc(db, 'cursos', cursoId)),
          where('periodo', '==', periodo.toString())
        ));

        for (const docTema of temasSnap.docs) {
          const tema = { id: docTema.id, ...docTema.data() };
          const jaTemProjeto = projetosExistentes.some(p => p.temaId?.id === docTema.id);
          if (!jaTemProjeto) {
            novosProjetos.push({
              id: `temp-${tempIndex++}`, 
              key: `temp-${tempIndex}`, 
              temaId: doc(db, 'temas', docTema.id),
              nomeProjeto: '',
              descricaoProjeto: '',
              novo: true,
              tema,
              curso: cursosDisponiveis.find(c => c.id === cursoId)
            });
          }
        }
      }

      const combinedProjetos = [...projetosExistentes, ...novosProjetos];
      setProjetos(combinedProjetos);
    } catch (error) {
      console.error('Erro ao buscar projetos e temas:', error);
      setProjetos([]);
    }
  }, [cursosSelecionados, periodosPorCurso, cursosDisponiveis]);

 
  const toggleCurso = useCallback((cursoId) => {
    setCursosSelecionados(prev => {
      if (prev.includes(cursoId)) {
        const updatedPeriods = { ...periodosPorCurso };
        delete updatedPeriods[cursoId];
        setPeriodosPorCurso(updatedPeriods);
        return prev.filter(id => id !== cursoId);
      }
      setPeriodosPorCurso(prevPeriods => ({ ...prevPeriods, [cursoId]: null }));
      return [...prev, cursoId];
    });
    fetchProjetosETemas(doc(db, 'usuarios', uid));
  }, [periodosPorCurso, uid, fetchProjetosETemas]);

 
  const handlePeriodoChange = useCallback((cursoId, periodo) => {
    const numero = parseInt(periodo, 10);
    setPeriodosPorCurso(prev => ({
      ...prev,
      [cursoId]: isNaN(numero) ? null : numero
    }));
    fetchProjetosETemas(doc(db, 'usuarios', uid));
  }, [uid, fetchProjetosETemas]);


  const handleProjetoChange = useCallback((key, campo, valor) => {
    setProjetos(prev =>
      prev.map(p => (p.key === key ? { ...p, [campo]: valor } : p))
    );
  }, []);


  const deletarProjeto = useCallback(async (id) => {
    try {
      const avaliacoesRef = collection(db, 'avaliacoes');
      const q = query(avaliacoesRef, where('projetoId', '==', doc(db, 'projetos', id)));
      const snapshot = await getDocs(q);

      const batchDeletes = snapshot.docs.map(av => deleteDoc(av.ref));
      await Promise.all(batchDeletes);

      await deleteDoc(doc(db, 'projetos', id));
      await fetchProjetosETemas(doc(db, 'usuarios', uid));

      Alert.alert('Sucesso', 'Projeto e avaliações associadas deletados com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      Alert.alert('Erro', 'Não foi possível deletar o projeto.');
    }
  }, [uid, fetchProjetosETemas]);


  const adicionarProjeto = useCallback(async (projeto) => {
    if (!projeto.nomeProjeto || !projeto.descricaoProjeto) {
      Alert.alert('Erro', 'Preencha o nome e a descrição do projeto.');
      return;
    }

    if (isAddingProject) return;
    setIsAddingProject(true);

    try {
      const alunoRef = doc(db, 'usuarios', uid);
      const novoProjetoRef = await addDoc(collection(db, 'projetos'), {
        alunoId: alunoRef,
        temaId: projeto.temaId,
        nomeProjeto: projeto.nomeProjeto,
        descricaoProjeto: projeto.descricaoProjeto,
        cursoId: projeto.curso?.id ? doc(db, 'cursos', projeto.curso.id) : null,
        periodo: periodosPorCurso[projeto.curso?.id] || null
      });

      setProjetos(prev =>
        prev.map(p =>
          p.key === projeto.key
            ? { ...p, id: novoProjetoRef.id, novo: false }
            : p
        )
      );
      Alert.alert('Sucesso', 'Projeto adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o projeto.');
    } finally {
      setIsAddingProject(false);
    }
  }, [isAddingProject, periodosPorCurso, uid]);

  // Save changes
  const handleSalvar = useCallback(async () => {
    if (!nome || !usuario || !nmatricula || cursosSelecionados.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos e selecione ao menos um curso.');
      return;
    }

    const periodosValidos = cursosSelecionados.every(
      cursoId => periodosPorCurso[cursoId] !== null && periodosPorCurso[cursoId] !== undefined
    );
    if (!periodosValidos) {
      Alert.alert('Erro', 'Selecione um período para cada curso.');
      return;
    }

    try {
      const alunoRef = doc(db, 'usuarios', uid);
      await updateDoc(alunoRef, {
        nome,
        usuario,
        nmatricula,
        cursos: cursosSelecionados,
        periodos: periodosPorCurso
      });

      for (const projeto of projetos) {
        if (!projeto.novo) {
          const projRef = doc(db, 'projetos', projeto.id);
          await updateDoc(projRef, {
            nomeProjeto: projeto.nomeProjeto,
            descricaoProjeto: projeto.descricaoProjeto
          });
        } else if (projeto.nomeProjeto && projeto.descricaoProjeto) {
          await addDoc(collection(db, 'projetos'), {
            alunoId: alunoRef,
            temaId: projeto.temaId,
            nomeProjeto: projeto.nomeProjeto,
            descricaoProjeto: projeto.descricaoProjeto,
            cursoId: projeto.curso?.id ? doc(db, 'cursos', projeto.curso.id) : null,
            periodo: periodosPorCurso[projeto.curso?.id] || null
          });
        }
      }

      Alert.alert('Sucesso', 'Aluno e projetos atualizados com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  }, [nome, usuario, nmatricula, cursosSelecionados, periodosPorCurso, projetos, uid, navigation]);


  const deletarAluno = useCallback(async () => {
    Alert.alert('Confirmação', 'Deseja realmente deletar este aluno, seus projetos e avaliações associadas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            const alunoRef = doc(db, 'usuarios', uid);

          
            const projetosQuery = query(collection(db, 'projetos'), where('alunoId', '==', alunoRef));
            const projetosSnap = await getDocs(projetosQuery);

            for (const projetoDoc of projetosSnap.docs) {
              const projetoId = projetoDoc.id;

              
              const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('projetoId', '==', doc(db, 'projetos', projetoId)));
              const avaliacoesSnap = await getDocs(avaliacoesQuery);
              const batchDeletes = avaliacoesSnap.docs.map(av => deleteDoc(av.ref));
              await Promise.all(batchDeletes);

           
              await deleteDoc(doc(db, 'projetos', projetoId));
            }

           
            await deleteDoc(alunoRef);

            Alert.alert('Sucesso', 'Aluno, seus projetos e avaliações associadas foram deletados com sucesso!');
            navigation.goBack();
          } catch (error) {
            console.error('Erro ao deletar aluno:', error);
            Alert.alert('Erro', 'Não foi possível deletar o aluno.');
          }
        },
      },
    ]);
  }, [uid, navigation]);

  
  const projectList = useMemo(() => {
    return projetos.map(projeto => (
      <View key={projeto.key} style={styles.projetoContainer}>
        <Text style={{ fontWeight: 'bold' }}>
          Tema: {projeto.tema ? projeto.tema.titulo : 'Sem tema'}
          {'\n'}Curso: {projeto.curso ? projeto.curso.nome : 'Curso não encontrado'}
          {'\n'}Período: {projeto.tema ? projeto.tema.periodo : '-'}
        </Text>

        <TextInput
          style={styles.input}
          value={projeto.nomeProjeto}
          onChangeText={text => handleProjetoChange(projeto.key, 'nomeProjeto', text)}
          placeholder="Nome do Projeto"
        />
        <TextInput
          style={styles.input}
          value={projeto.descricaoProjeto}
          onChangeText={text => handleProjetoChange(projeto.key, 'descricaoProjeto', text)}
          placeholder="Descrição do Projeto"
        />

        {projeto.novo ? (
          <Button
            title={isAddingProject ? "Adicionando..." : "Adicionar Projeto"}
            onPress={() => adicionarProjeto(projeto)}
            color="#4CAF50"
            disabled={isAddingProject}
          />
        ) : (
          <Button
            title="Deletar Projeto"
            color="#ff4d4d"
            onPress={() =>
              Alert.alert(
                'Confirmação',
                'Tem certeza que deseja deletar este projeto?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sim', onPress: () => deletarProjeto(projeto.id) }
                ]
              )
            }
          />
        )}
      </View>
    ));
  }, [projetos, isAddingProject, handleProjetoChange, adicionarProjeto, deletarProjeto]);

  
  useEffect(() => {
    if (!loading) {
      fetchProjetosETemas(doc(db, 'usuarios', uid));
    }
  }, [cursosSelecionados, periodosPorCurso, fetchProjetosETemas, loading, uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome completo"
      />

      <Text style={styles.label}>Nome de usuário:</Text>
      <TextInput
        style={styles.input}
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Nome de usuário"
      />

      <Text style={styles.label}>Número de Matrícula:</Text>
      <TextInput
        style={styles.input}
        value={nmatricula}
        onChangeText={setNmatricula}
        placeholder="Ex: 2023012345"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Editar cursos associados:</Text>
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
        const curso = cursosDisponiveis.find(c => c.id === cursoId) || {};
        const total = parseInt(curso.quantidadePeriodos || '0', 10);
        const periodos = Array.from({ length: total }, (_, i) => (i + 1).toString());
        return (
          <View key={cursoId}>
            <Text style={styles.label}>Período no curso {curso.nome}:</Text>
            <Picker
              selectedValue={periodosPorCurso[cursoId]?.toString() || ''}
              onValueChange={value => handlePeriodoChange(cursoId, value)}
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

      {projetos.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Projetos do Aluno:</Text>
          {projectList}
        </View>
      )}

      <View style={styles.saveButton}>
        <Button title="Salvar Alterações" onPress={handleSalvar} color="#007bff" />
      </View>
      <View style={styles.deleteButton}>
        <Button title="Deletar Aluno" onPress={deletarAluno} color="#ff4d4d" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 5,
    borderRadius: 5
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  checkboxLabel: {
    marginLeft: 8
  },
  picker: {
    marginTop: 5
  },
  projetoContainer: {
    marginTop: 15,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 10
  },
  deleteButton: {
    marginBottom: 20
  }
});