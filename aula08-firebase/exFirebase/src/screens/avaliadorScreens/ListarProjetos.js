import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { getDocs, collection, query, where, addDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Picker } from '@react-native-picker/picker';

export default function AvaliacaoProjetos() {
  const [temas, setTemas] = useState([]);
  const [temaSelecionado, setTemaSelecionado] = useState(null);
  const [projetos, setProjetos] = useState([]);
  const [notas, setNotas] = useState({});          // notas do avaliador logado { projetoId: nota }
  const [notasMedias, setNotasMedias] = useState({}); // média das notas de todos avaliadores { projetoId: media }

  useEffect(() => {
    const fetchTemas = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // Busca usuário para pegar temas permitidos
      const userDoc = await getDocs(query(collection(db, 'usuarios'), where('uid', '==', user.uid)));
      if (userDoc.empty) return;

      const avaliador = userDoc.docs[0].data();
      const temasIds = avaliador.temas || [];

      if (temasIds.length === 0) {
        setTemas([]);
        return;
      }

      // Buscar temas
      const temasQuery = query(collection(db, 'temas'), where('__name__', 'in', temasIds));
      const snapshot = await getDocs(temasQuery);

      // Para cada tema buscar o nome do curso referenciado
      const temasComCurso = await Promise.all(snapshot.docs.map(async doc => {
        const tema = { id: doc.id, ...doc.data() };
        if (tema.cursoId) {
          const cursoSnap = await getDocs(query(collection(db, 'cursos'), where('__name__', '==', tema.cursoId.id || tema.cursoId)));
          if (!cursoSnap.empty) {
            tema.nomeCurso = cursoSnap.docs[0].data().nome || 'Curso desconhecido';
          } else {
            tema.nomeCurso = 'Curso desconhecido';
          }
        } else {
          tema.nomeCurso = 'Curso desconhecido';
        }
        return tema;
      }));

      setTemas(temasComCurso);
    };

    fetchTemas();
  }, []);

  const carregarProjetosDoTema = async (temaId) => {
    setTemaSelecionado(temaId);
    const q = query(collection(db, 'projetos'), where('temaId', '==', temaId));
    const snapshot = await getDocs(q);
    const listaProjetos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjetos(listaProjetos);

    const user = auth.currentUser;
    if (!user) return;

    const avaliacoesQuery = query(collection(db, 'avaliacoes'), where('temaId', '==', temaId));
    const avaliacoesSnap = await getDocs(avaliacoesQuery);

    const notasDoAvaliador = {};
    const somaNotas = {};
    const contagemNotas = {};

    avaliacoesSnap.docs.forEach(docAval => {
      const data = docAval.data();
      const pId = data.projetoId;
      const nota = Number(data.nota);

      if (data.avaliadorId === user.uid) {
        notasDoAvaliador[pId] = nota;
      }

      if (!somaNotas[pId]) {
        somaNotas[pId] = 0;
        contagemNotas[pId] = 0;
      }
      somaNotas[pId] += nota;
      contagemNotas[pId]++;
    });

    const medias = {};
    for (const pId of Object.keys(somaNotas)) {
      const media = (somaNotas[pId] / contagemNotas[pId]);
      medias[pId] = media.toFixed(2);

      // Atualiza a nota média no projeto
      const projetoRef = doc(db, 'projetos', pId);
      await updateDoc(projetoRef, {
        notaMedia: media
      });
    }

    setNotas(notasDoAvaliador);
    setNotasMedias(medias);
  };


  const handleNotaChange = (projetoId, nota) => {
    setNotas(prev => ({ ...prev, [projetoId]: nota }));
  };

  const salvarNota = async (projetoId) => {
    const user = auth.currentUser;
    const nota = notas[projetoId];
    if (!nota) return;

    // Verificar se já existe avaliação para esse projeto e avaliador
    const avaliacoesRef = collection(db, 'avaliacoes');
    const q = query(avaliacoesRef,
      where('avaliadorId', '==', user.uid),
      where('projetoId', '==', projetoId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Não existe avaliação - cria nova
      await addDoc(avaliacoesRef, {
        avaliadorId: user.uid,
        projetoId,
        nota,
        temaId: temaSelecionado
      });
    } else {
      // Já existe - atualiza a avaliação (pega docId)
      const docId = snapshot.docs[0].id;
      const docRef = doc(db, 'avaliacoes', docId);
      await updateDoc(docRef, { nota });
    }

    alert('Nota salva com sucesso!');
    // Recarregar as médias para refletir a nova nota
    carregarProjetosDoTema(temaSelecionado);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione um Tema</Text>
      {temas.map(t => (
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
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.nome}>{item.nomeProjeto}</Text>
                <Text style={styles.desc}>{item.descricaoProjeto}</Text>

                <Text>Nota média: {notasMedias[item.id] || 'Sem avaliações'}</Text>

                <Picker
                  selectedValue={notas[item.id] || ''}
                  onValueChange={(valor) => handleNotaChange(item.id, valor)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione uma nota" value="" />
                  {[1, 2, 3, 4, 5].map(n => (
                    <Picker.Item key={n} label={n.toString()} value={n} />
                  ))}
                </Picker>

                <Button
                  title="Salvar Nota"
                  onPress={() => salvarNota(item.id)}
                  disabled={!notas[item.id]}
                  color="#008000"
                />
              </View>
            )}
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
    borderRadius: 8
  },
  nome: { fontSize: 16, fontWeight: 'bold' },
  desc: { fontSize: 14, marginVertical: 4 },
  picker: { backgroundColor: '#fff', marginVertical: 6 }
});
