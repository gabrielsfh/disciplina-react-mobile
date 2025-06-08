import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { getDocs, collection, query, where, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Picker } from '@react-native-picker/picker';

export default function AvaliacaoProjetos() {
  const [temas, setTemas] = useState([]);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [notas, setNotas] = useState({}); // { projetoId: { execucao, criatividade, vibes } }
  const [notasMedias, setNotasMedias] = useState({}); // { projetoId: media }

  useEffect(() => {
    const fetchTemas = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'usuarios', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const avaliador = userSnap.data();
      const temasRefs = avaliador.temas || []; // Assume que temas é um array de referências

      if (temasRefs.length === 0) {
        setTemas([]);
        return;
      }

      const temasQuery = query(collection(db, 'temas'), where('__name__', 'in', temasRefs));
      const snapshot = await getDocs(temasQuery);

      const temasComCurso = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const tema = { id: docSnap.id, ...docSnap.data() };
          if (tema.cursoId) {
            const cursoRef = tema.cursoId; // cursoId é uma Reference
            const cursoSnap = await getDoc(cursoRef);
            tema.nomeCurso = cursoSnap.exists() ? cursoSnap.data().nome || 'Curso desconhecido' : 'Curso desconhecido';
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
    const listaProjetos = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        return { id: docSnap.id, ...data };
      })
    );
    setProjetos(listaProjetos);

    const user = auth.currentUser;
    if (!user) return;

    const avaliadorRef = doc(db, 'usuarios', user.uid);
    const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('temaId', '==', temaRef));
    const avaliacoesSnap = await getDocs(avaliacoesQuery);

    const notasDoAvaliador = {};
    const somaNotas = {};
    const contagemNotas = {};

    avaliacoesSnap.docs.forEach((docAval) => {
      const data = docAval.data();
      const pId = data.projetoId.id; // Extrai o ID da referência do projeto

      const e = Number(data.execucao || 0);
      const c = Number(data.criatividade || 0);
      const v = Number(data.vibes || 0);
      const media = (e + c + v) / 3;

      if (data.avaliadorId.id === user.uid) {
        notasDoAvaliador[pId] = {
          execucao: e,
          criatividade: c,
          vibes: v,
        };
      }

      if (!somaNotas[pId]) {
        somaNotas[pId] = 0;
        contagemNotas[pId] = 0;
      }

      somaNotas[pId] += media;
      contagemNotas[pId]++;
    });

    const medias = {};
    for (const pId of Object.keys(somaNotas)) {
      const media = somaNotas[pId] / contagemNotas[pId];
      medias[pId] = media.toFixed(2);

      const projetoRef = doc(db, 'projetos', pId);
      await updateDoc(projetoRef, {
        notaMedia: media,
      });
    }

    setNotas(notasDoAvaliador);
    setNotasMedias(medias);
  };

  const handleNotaChange = (projetoId, tipo, valor) => {
    setNotas((prev) => ({
      ...prev,
      [projetoId]: {
        ...prev[projetoId],
        [tipo]: valor,
      },
    }));
  };

  const salvarNota = async (projetoId) => {
    const user = auth.currentUser;
    const nota = notas[projetoId];
    if (!nota || !nota.execucao || !nota.criatividade || !nota.vibes) {
      alert('Preencha todas as notas antes de salvar.');
      return;
    }

    const avaliadorRef = doc(db, 'usuarios', user.uid);
    const projetoRef = doc(db, 'projetos', projetoId);
    const temaRef = doc(db, 'temas', temaSelecionado);

    const avaliacoesRef = collection(db, 'avaliacoes');
    const q = query(
      avaliacoesRef,
      where('avaliadorId', '==', avaliadorRef),
      where('projetoId', '==', projetoRef)
    );
    const snapshot = await getDocs(q);

    const dataToSave = {
      avaliadorId: avaliadorRef,
      projetoId: projetoRef,
      temaId: temaRef,
      execucao: Number(nota.execucao),
      criatividade: Number(nota.criatividade),
      vibes: Number(nota.vibes),
    };

    if (snapshot.empty) {
      await addDoc(avaliacoesRef, dataToSave);
    } else {
      const docId = snapshot.docs[0].id;
      const docRef = doc(db, 'avaliacoes', docId);
      await updateDoc(docRef, dataToSave);
    }

    alert('Nota salva com sucesso!');
    carregarProjetosDoTema(temaSelecionado);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione um Tema</Text>
      {temas.map((t) => (
        <Button
          key={t.id}
          title={`${t.titulo} (${t.nomeCurso} ${t.periodo}º)`}
          onPress={() => carregarProjetosDoTema(t.id)}
          color={temaSelecionado === t.id ? '#000' : '#444'}
        />
      ))}

      {projetos.length > 0 && (
        <>
          <Text style={styles.title}>Projetos do Tema</Text>
          <FlatList
            data={projetos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const nota = notas[item.id] || {};
              return (
                <View style={styles.card}>
                  <Text style={styles.nome}>{item.nomeProjeto}</Text>
                  <Text style={styles.desc}>{item.descricaoProjeto}</Text>

                  {nota.execucao && nota.criatividade && nota.vibes ? (
                    <Text>
                      Média de sua nota:{' '}
                      {((Number(nota.execucao) + Number(nota.criatividade) + Number(nota.vibes)) / 3).toFixed(2)}
                    </Text>
                  ) : (
                    <Text>Você ainda não avaliou este projeto.</Text>
                  )}

                  <Text style={{ fontWeight: 'bold' }}>
                    Nota total do projeto: {notasMedias[item.id] || 'Sem avaliações'}
                  </Text>

                  {['execucao', 'criatividade', 'vibes'].map((tipo) => (
                    <View key={tipo}>
                      <Text>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</Text>
                      <Picker
                        selectedValue={nota[tipo] || ''}
                        onValueChange={(valor) => handleNotaChange(item.id, tipo, valor)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Selecione" value="" />
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Picker.Item key={n} label={n.toString()} value={n} />
                        ))}
                      </Picker>
                    </View>
                  ))}

                  <Button
                    title="Salvar Nota"
                    onPress={() => salvarNota(item.id)}
                    disabled={!nota.execucao || !nota.criatividade || !nota.vibes}
                    color="#008000"
                  />
                </View>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  card: {
    backgroundColor: '#f1f1f1',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  nome: { fontSize: 16, fontWeight: 'bold' },
  desc: { fontSize: 14, marginVertical: 4 },
  picker: { backgroundColor: '#fff', marginVertical: 6 },
});