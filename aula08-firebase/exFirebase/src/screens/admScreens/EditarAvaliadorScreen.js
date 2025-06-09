import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, FlatList } from 'react-native';
import { collection, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';

export default function EditarAvaliadorScreen({ navigation, route }) {
  const { uid } = route.params;


  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [temas, setTemas] = useState([]);
  const [temasSelecionados, setTemasSelecionados] = useState([]);
  const [isProfessor, setIsProfessor] = useState(false);
  const [loading, setLoading] = useState(true);

 
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [notas, setNotas] = useState({});
  const [notasMedias, setNotasMedias] = useState({});

 
  const fetchData = useCallback(async () => {
    try {
      
      const avaliadorRef = doc(db, 'usuarios', uid);
      const avaliadorSnap = await getDoc(avaliadorRef);
      if (!avaliadorSnap.exists()) {
        Alert.alert('Erro', 'Avaliador não encontrado.');
        navigation.goBack();
        return;
      }

      const data = avaliadorSnap.data();
      if (data.tipoUsuario !== 'avaliador' && !data.avaliador) {
        Alert.alert('Erro', 'Usuário não é um avaliador.');
        navigation.goBack();
        return;
      }

      setNome(data.nome || '');
      setUsuario(data.usuario || '');
      setTemasSelecionados(Array.isArray(data.temas) ? data.temas : []);
      setIsProfessor(data.tipoUsuario === 'professor');

   
      const temasRefs = data.temas || [];
      let temasCarregados = [];
      if (temasRefs.length > 0) {
        const temasQuery = query(collection(db, 'temas'), where('__name__', 'in', temasRefs));
        const temasSnapshot = await getDocs(temasQuery);
        temasCarregados = await Promise.all(
          temasSnapshot.docs.map(async (docSnap) => {
            const tema = { id: docSnap.id, ...docSnap.data() };
            if (tema.cursoId) {
              const cursoSnap = await getDoc(tema.cursoId);
              tema.nomeCurso = cursoSnap.exists() ? cursoSnap.data().nome || 'Curso desconhecido' : 'Curso desconhecido';
            } else {
              tema.nomeCurso = 'Curso desconhecido';
            }
            return tema;
          })
        );
      }
      setTemas(temasCarregados);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do avaliador.');
      navigation.goBack();
    }
  }, [uid, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const toggleTema = (id) => {
    setTemasSelecionados(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  
  const carregarProjetosDoTema = useCallback(async (temaId) => {
    try {
      setTemaSelecionado(temaId);
      const temaRef = doc(db, 'temas', temaId);
      const projetosQuery = query(collection(db, 'projetos'), where('temaId', '==', temaRef));
      const projetosSnapshot = await getDocs(projetosQuery);
      const listaProjetos = projetosSnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setProjetos(listaProjetos);

      const avaliadorRef = doc(db, 'usuarios', uid);
      const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('temaId', '==', temaRef));
      const avaliacoesSnapshot = await getDocs(avaliacoesQuery);

      const notasDoAvaliador = {};
      const somaNotas = {};
      const contagemNotas = {};

      avaliacoesSnapshot.docs.forEach((docAval) => {
        const data = docAval.data();
        const projetoId = data.projetoId.id;
        const e = Number(data.execucao || 0);
        const c = Number(data.criatividade || 0);
        const v = Number(data.vibes || 0);
        const media = (e + c + v) / 3;

        if (data.avaliadorId.id === uid) {
          notasDoAvaliador[projetoId] = {
            execucao: e,
            criatividade: c,
            vibes: v,
            docId: docAval.id,
          };
        }

        if (!somaNotas[projetoId]) {
          somaNotas[projetoId] = 0;
          contagemNotas[projetoId] = 0;
        }
        somaNotas[projetoId] += media;
        contagemNotas[projetoId]++;
      });

      const medias = {};
      for (const projetoId of Object.keys(somaNotas)) {
        medias[projetoId] = contagemNotas[projetoId] > 0 ? (somaNotas[projetoId] / contagemNotas[projetoId]).toFixed(2) : '0.00';
        const projetoRef = doc(db, 'projetos', projetoId);
        await updateDoc(projetoRef, { notaMedia: medias[projetoId] });
      }

      setNotas(notasDoAvaliador);
      setNotasMedias(medias);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os projetos.');
    }
  }, [uid]);

 
  const handleNotaChange = (projetoId, tipo, valor) => {
    setNotas(prev => ({
      ...prev,
      [projetoId]: {
        ...prev[projetoId],
        [tipo]: valor,
      },
    }));
  };


  const salvarNota = useCallback(async (projetoId) => {
    if (!notas[projetoId] || !notas[projetoId].execucao || !notas[projetoId].criatividade || !notas[projetoId].vibes) {
      Alert.alert('Erro', 'Preencha todas as notas antes de salvar.');
      return;
    }

    try {
      const avaliadorRef = doc(db, 'usuarios', uid);
      const projetoRef = doc(db, 'projetos', projetoId);
      const temaRef = doc(db, 'temas', temaSelecionado);

      const avaliacoesRef = collection(db, 'avaliacoes');
      const avaliacaoQuery = query(
        avaliacoesRef,
        where('avaliadorId', '==', avaliadorRef),
        where('projetoId', '==', projetoRef)
      );
      const avaliacaoSnapshot = await getDocs(avaliacaoQuery);

      const dataToSave = {
        avaliadorId: avaliadorRef,
        projetoId: projetoRef,
        temaId: temaRef,
        execucao: Number(notas[projetoId].execucao),
        criatividade: Number(notas[projetoId].criatividade),
        vibes: Number(notas[projetoId].vibes),
      };

      if (avaliacaoSnapshot.empty) {
        await addDoc(avaliacoesRef, dataToSave);
      } else {
        const docId = avaliacaoSnapshot.docs[0].id;
        const docRef = doc(db, 'avaliacoes', docId);
        await updateDoc(docRef, dataToSave);
      }

      Alert.alert('Sucesso', 'Nota salva com sucesso!');
      carregarProjetosDoTema(temaSelecionado);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      Alert.alert('Erro', 'Não foi possível salvar a nota.');
    }
  }, [notas, temaSelecionado, uid, carregarProjetosDoTema]);


  const deletarNota = useCallback(async (projetoId) => {
    const nota = notas[projetoId];
    if (!nota || !nota.docId) {
      Alert.alert('Erro', 'Não há nota para deletar.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'avaliacoes', nota.docId));

      const projetoAvaliacoesQuery = query(collection(db, 'avaliacoes'), where('projetoId', '==', doc(db, 'projetos', projetoId)));
      const projetoAvaliacoesSnap = await getDocs(projetoAvaliacoesQuery);
      let soma = 0;
      let count = 0;
      projetoAvaliacoesSnap.forEach((docAval) => {
        const data = docAval.data();
        const e = Number(data.execucao || 0);
        const c = Number(data.criatividade || 0);
        const v = Number(data.vibes || 0);
        const media = (e + c + v) / 3;
        soma += media;
        count++;
      });
      const novaMedia = count > 0 ? (soma / count).toFixed(2) : '0.00';

      await updateDoc(doc(db, 'projetos', projetoId), { notaMedia: novaMedia });

      setNotas(prev => {
        const updated = { ...prev };
        delete updated[projetoId];
        return updated;
      });
      setNotasMedias(prev => ({ ...prev, [projetoId]: novaMedia }));

      Alert.alert('Sucesso', 'Nota deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      Alert.alert('Erro', 'Não foi possível deletar a nota.');
    }
  }, [notas]);

  
  const handleSalvar = useCallback(async () => {
    if (!nome || !usuario || temasSelecionados.length === 0) {
      Alert.alert('Erro', 'Preencha o nome, usuário e selecione ao menos um tema.');
      return;
    }

    try {
      const avaliadorRef = doc(db, 'usuarios', uid);
      if (isProfessor) {
        await updateDoc(avaliadorRef, {
          nome,
          usuario,
          temas: temasSelecionados,
          avaliador: true,
        });
      } else {
        await updateDoc(avaliadorRef, {
          nome,
          usuario,
          temas: temasSelecionados,
        });
      }

      Alert.alert('Sucesso', 'Dados do avaliador atualizados com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar avaliador:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  }, [nome, usuario, temasSelecionados, isProfessor, uid, navigation]);

 
  const deletarAvaliador = useCallback(async () => {
    Alert.alert('Confirmação', isProfessor ? 'Deseja remover o status de avaliador deste professor?' : 'Deseja deletar este avaliador e suas avaliações associadas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            const avaliadorRef = doc(db, 'usuarios', uid);

            
            const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('avaliadorId', '==', avaliadorRef));
            const avaliacoesSnap = await getDocs(avaliacoesQuery);
            const projetosAtualizados = new Set();
            for (const docAval of avaliacoesSnap.docs) {
              const projetoId = docAval.data().projetoId.id;
              projetosAtualizados.add(projetoId);
              await deleteDoc(doc(db, 'avaliacoes', docAval.id));
            }

           
            for (const projetoId of projetosAtualizados) {
              const projetoAvaliacoesQuery = query(collection(db, 'avaliacoes'), where('projetoId', '==', doc(db, 'projetos', projetoId)));
              const projetoAvaliacoesSnap = await getDocs(projetoAvaliacoesQuery);
              let soma = 0;
              let count = 0;
              projetoAvaliacoesSnap.forEach((docAval) => {
                const data = docAval.data();
                const e = Number(data.execucao || 0);
                const c = Number(data.criatividade || 0);
                const v = Number(data.vibes || 0);
                const media = (e + c + v) / 3;
                soma += media;
                count++;
              });
              const novaMedia = count > 0 ? (soma / count).toFixed(2) : '0.00';
              await updateDoc(doc(db, 'projetos', projetoId), { notaMedia: novaMedia });
            }

            if (isProfessor) {
              await updateDoc(avaliadorRef, {
                avaliador: false,
                temas: [],
              });
              Alert.alert('Sucesso', 'Status de avaliador removido com sucesso!');
            } else {
              await deleteDoc(avaliadorRef);
              Alert.alert('Sucesso', 'Avaliador e suas avaliações foram deletados com sucesso!');
            }

            navigation.goBack();
          } catch (error) {
            console.error('Erro ao deletar avaliador:', error);
            Alert.alert('Erro', 'Não foi possível deletar o avaliador.');
          }
        },
      },
    ]);
  }, [isProfessor, uid, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Avaliador {isProfessor ? '(Professor)' : ''}</Text>

      <Text style={styles.label}>Nome:</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Nome"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Usuário:</Text>
      <TextInput
        style={styles.input}
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Usuário"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Temas Associados:</Text>
      {temas.map(tema => (
        <View key={tema.id} style={styles.checkboxContainer}>
          <Checkbox
            value={temasSelecionados.includes(tema.id)}
            onValueChange={() => toggleTema(tema.id)}
          />
          <Text style={styles.checkboxText}>{tema.titulo}</Text>
        </View>
      ))}

      <Text style={styles.label}>Avaliações por Tema:</Text>
      {temas.map((tema) => (
        <Button
          key={tema.id}
          title={`${tema.titulo} (${tema.nomeCurso} ${tema.periodo}º)`}
          onPress={() => carregarProjetosDoTema(tema.id)}
          color={temaSelecionado === tema.id ? '#000' : '#444'}
        />
      ))}

      {projetos.length > 0 && (
        <>
          <Text style={styles.label}>Projetos do Tema</Text>
          <FlatList
            data={projetos}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const nota = notas[item.id] || {};
              return (
                <View style={styles.section}>
                  <Text style={styles.nome}>{item.nomeProjeto}</Text>
                  <Text style={styles.desc}>{item.descricaoProjeto}</Text>
                  <Text>Nota Média: {notasMedias[item.id] || 'N/A'}</Text>

                  {nota.execucao && nota.criatividade && nota.vibes ? (
                    <>
                      <Text>
                        Nota média do avaliador: {((Number(nota.execucao) + Number(nota.criatividade) + Number(nota.vibes)) / 3).toFixed(2)}
                      </Text>
                      <Button title="Deletar Nota" color="#ff4d4d" onPress={() => deletarNota(item.id)} />
                    </>
                  ) : (
                    <Text>Este avaliador ainda não avaliou este projeto.</Text>
                  )}

                  <Text>Execução:</Text>
                  <Picker
                    selectedValue={nota.execucao || ''}
                    onValueChange={val => handleNotaChange(item.id, 'execucao', val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione" value="" />
                    {[1, 2, 3, 4, 5].map(v => <Picker.Item key={v} label={String(v)} value={v} />)}
                  </Picker>

                  <Text>Criatividade:</Text>
                  <Picker
                    selectedValue={nota.criatividade || ''}
                    onValueChange={val => handleNotaChange(item.id, 'criatividade', val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione" value="" />
                    {[1, 2, 3, 4, 5].map(v => <Picker.Item key={v} label={String(v)} value={v} />)}
                  </Picker>

                  <Text>Vibes:</Text>
                  <Picker
                    selectedValue={nota.vibes || ''}
                    onValueChange={val => handleNotaChange(item.id, 'vibes', val)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione" value="" />
                    {[1, 2, 3, 4, 5].map(v => <Picker.Item key={v} label={String(v)} value={v} />)}
                  </Picker>

                  <Button title="Salvar Nota" onPress={() => salvarNota(item.id)} color="#007bff" />
                </View>
              );
            }}
          />
        </>
      )}

      <View style={styles.saveButton}>
        <Button title="Salvar Alterações" color="#007bff" onPress={handleSalvar} />
      </View>
      <View style={styles.deleteButton}>
        <Button
          title={isProfessor ? 'Deletar status de Avaliador' : 'Deletar Avaliador'}
          onPress={deletarAvaliador}
          color="#ff4d4d"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  card: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  picker: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});