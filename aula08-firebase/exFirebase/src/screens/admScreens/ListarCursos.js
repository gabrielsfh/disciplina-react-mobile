import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Alert, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ListarCursos({ navigation }) {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchCursos = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, 'cursos'));
      const listaCursos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCursos(listaCursos);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os cursos.');
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchCursos();


    const unsubscribe = navigation.addListener('focus', () => {
      fetchCursos();
    });


    return unsubscribe;
  }, [fetchCursos, navigation]);


  const deletarCurso = useCallback(async (cursoId) => {
    Alert.alert('Confirmação', 'Deseja realmente deletar este curso, seus temas, projetos e associações?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            const cursoRef = doc(db, 'cursos', cursoId);


            const temasQuery = query(collection(db, 'temas'), where('cursoId', '==', cursoRef));
            const temasSnap = await getDocs(temasQuery);
            for (const temaDoc of temasSnap.docs) {
              const temaId = temaDoc.id;

              const projetosQuery = query(collection(db, 'projetos'), where('temaId', '==', doc(db, 'temas', temaId)));
              const projetosSnap = await getDocs(projetosQuery);
              for (const projetoDoc of projetosSnap.docs) {
                const projetoId = projetoDoc.id;


                const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('projetoId', '==', doc(db, 'projetos', projetoId)));
                const avaliacoesSnap = await getDocs(avaliacoesQuery);
                const batchDeletes = avaliacoesSnap.docs.map(av => deleteDoc(av.ref));
                await Promise.all(batchDeletes);


                await deleteDoc(doc(db, 'projetos', projetoId));
              }


              await deleteDoc(doc(db, 'temas', temaId));
            }


            const usuariosQuery = query(collection(db, 'usuarios'), where('cursos', 'array-contains', cursoId));
            const usuariosSnap = await getDocs(usuariosQuery);
            for (const usuarioDoc of usuariosSnap.docs) {
              const usuarioData = usuarioDoc.data();
              const updatedCursos = usuarioData.cursos.filter(id => id !== cursoId);
              const updatedPeriodos = { ...usuarioData.periodos };
              delete updatedPeriodos[cursoId];

              await updateDoc(doc(db, 'usuarios', usuarioDoc.id), {
                cursos: updatedCursos,
                periodos: updatedPeriodos,
              });
            }


            await deleteDoc(cursoRef);


            await fetchCursos();

            Alert.alert('Sucesso', 'Curso e suas associações foram deletados com sucesso!');
          } catch (error) {
            console.error('Erro ao deletar curso:', error);
            Alert.alert('Erro', 'Não foi possível deletar o curso.');
          }
        },
      },
    ]);
  }, [fetchCursos]);

  const renderCurso = ({ item }) => (
    <View style={styles.cursoContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate('EditarCurso', { cursoId: item.id })}
        style={styles.cursoInfo}
      >
        <Text style={styles.cursoNome}>{item.nome}</Text>
        <Text style={styles.cursoDetalhe}>Código: {item.codigo}</Text>
        <Text style={styles.cursoDetalhe}>Períodos: {item.quantidadePeriodos}</Text>
      </TouchableOpacity>
      <View style={styles.cursoActions}>
        <Button
          title="Deletar"
          color="#ff4d4d"
          onPress={() => deletarCurso(item.id)}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando cursos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Cursos</Text>
      <FlatList
        data={cursos}
        renderItem={renderCurso}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum curso cadastrado.</Text>}
      />
      <View style={styles.addButton}>
        <Button
          title="Adicionar Novo Curso"
          onPress={() => navigation.navigate('RegisterCursos')}
          color="#007bff"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cursoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cursoInfo: {
    flex: 1,
  },
  cursoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cursoDetalhe: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cursoActions: {
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    marginTop: 20,
  },
});