import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { getDocs, collection, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const colors = ['#e0f7fa', '#e8f5e9', '#fff8e1', '#fce4ec', '#ede7f6'];

export default function ListaProjetos() {
  const [temas, setTemas] = useState([]);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [projetos, setProjetos] = useState([]);

  useEffect(() => {
    const fetchTemas = async () => {
      const snapshot = await getDocs(collection(db, 'temas'));
      const temasComCurso = await Promise.all(
        snapshot.docs.map(async (docTema) => {
          const tema = { id: docTema.id, ...docTema.data() };

          if (tema.cursoId) {
            const cursoRef = typeof tema.cursoId === 'object' ? tema.cursoId : doc(db, 'cursos', tema.cursoId);
            const cursoSnap = await getDoc(cursoRef);
            tema.nomeCurso = cursoSnap.exists() ? cursoSnap.data().nome : 'Curso desconhecido';
          } else {
            tema.nomeCurso = 'Curso desconhecido';
          }

          return tema;
        })
      );

      setTemas(temasComCurso);
    };

    fetchTemas();
  }, []);

  const carregarProjetosDoTema = async (temaId) => {
    setTemaSelecionado(temaId);
    const temaRef = doc(db, 'temas', temaId);
    const q = query(collection(db, 'projetos'), where('temaId', '==', temaRef));
    const snapshot = await getDocs(q);
    const listaProjetos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordenar pela notaMedia (maior primeiro)
    listaProjetos.sort((a, b) => {
      const notaA = a.notaMedia ?? -1;
      const notaB = b.notaMedia ?? -1;
      return notaB - notaA;
    });

    setProjetos(listaProjetos);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione um Tema</Text>
      {temas.map(t => (
        <Button
          key={t.id}
          title={`${t.titulo} (${t.nomeCurso} ${t.periodo}º)`}
          onPress={() => carregarProjetosDoTema(t.id)}
          color={temaSelecionado === t.id ? '#1565c0' : '#78909c'}
        />
      ))}

      {temaSelecionado && projetos.length === 0 && (
        <Text style={styles.semProjetos}>
          Projetos ainda não foram cadastrados para esse tema.
        </Text>
      )}

      {projetos.length > 0 && (
        <>
          <Text style={styles.title}>Projetos do Tema</Text>
          <FlatList
            data={projetos}
            keyExtractor={item => item.id}
            renderItem={({ item, index }) => (
              <View style={[styles.card, { backgroundColor: colors[index % colors.length] }]}>
                <Text style={styles.nome}>{`${index + 1}. ${item.nomeProjeto}`}</Text>
                <Text style={styles.desc}>{item.descricaoProjeto}</Text>
                <Text style={styles.nota}>
                  Nota total do projeto:{' '}
                  {item.notaMedia !== undefined ? Number(item.notaMedia).toFixed(2) : 'Sem avaliações'}
                </Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fafafa', flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#333' },
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  nome: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  desc: { fontSize: 14, marginBottom: 6 },
  nota: { fontSize: 14, fontWeight: 'bold', color: '#1b5e20' },
  semProjetos: { marginTop: 20, fontSize: 16, color: '#888', textAlign: 'center' },
});
