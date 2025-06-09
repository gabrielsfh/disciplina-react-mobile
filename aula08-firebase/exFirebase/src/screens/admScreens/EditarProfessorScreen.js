import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, StyleSheet, FlatList } from 'react-native';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';

export default function EditarProfessorScreen({ route, navigation }) {
    const { uid } = route.params;

    // Estados para os dados do professor
    const [professor, setProfessor] = useState(null);
    const [nome, setNome] = useState('');
    const [usuario, setUsuario] = useState('');
    const [idfuncionario, setIdFuncionario] = useState('');
    const [cursos, setCursos] = useState([]);
    const [cursosSelecionados, setCursosSelecionados] = useState([]);
    const [periodosPorCurso, setPeriodosPorCurso] = useState({});

    // Estados para temas e projetos
    const [temas, setTemas] = useState([]);
    const [temaSelecionado, setTemaSelecionado] = useState(null);
    const [projetos, setProjetos] = useState([]);
    const [notas, setNotas] = useState({});
    const [notasMedias, setNotasMedias] = useState({});

    // Carregar dados iniciais
    useEffect(() => {
        async function carregarDados() {
            try {
                const userDoc = await getDoc(doc(db, 'usuarios', uid));
                const cursosSnap = await getDocs(collection(db, 'cursos'));

                if (!userDoc.exists()) {
                    Alert.alert('Erro', 'Usuário não encontrado');
                    navigation.goBack();
                    return;
                }

                const userData = userDoc.data();
                setProfessor(userData);
                setNome(userData.nome || '');
                setUsuario(userData.usuario || '');
                setIdFuncionario(userData.idfuncionario || '');
                setCursosSelecionados(userData.cursos || []);
                setPeriodosPorCurso(userData.periodos || {});

                const cursosDisponiveis = cursosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCursos(cursosDisponiveis);

                // Carregar temas do professor
                const temasRefs = userData.temas || [];
                if (temasRefs.length > 0) {
                    const temasQuery = query(collection(db, 'temas'), where('__name__', 'in', temasRefs));
                    const snapshot = await getDocs(temasQuery);
                    const temasCarregados = await Promise.all(
                        snapshot.docs.map(async (docSnap) => {
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
                    setTemas(temasCarregados);
                } else {
                    setTemas([]);
                }
            } catch (err) {
                console.error(err);
                Alert.alert('Erro ao carregar dados');
            }
        }

        carregarDados();
    }, [uid, navigation]);

    // Funções para manipular cursos e períodos
    const toggleCurso = (cursoId) => {
        if (cursosSelecionados.includes(cursoId)) {
            setCursosSelecionados(cursosSelecionados.filter(id => id !== cursoId));
            const updated = { ...periodosPorCurso };
            delete updated[cursoId];
            setPeriodosPorCurso(updated);
        } else {
            setCursosSelecionados([...cursosSelecionados, cursoId]);
            setPeriodosPorCurso({
                ...periodosPorCurso,
                [cursoId]: [],
            });
        }
    };

    const togglePeriodo = (cursoId, periodo) => {
        const selecionados = periodosPorCurso[cursoId] || [];
        const atualizados = selecionados.includes(periodo)
            ? selecionados.filter(p => p !== periodo)
            : [...selecionados, periodo];
        setPeriodosPorCurso({
            ...periodosPorCurso,
            [cursoId]: atualizados,
        });
    };

    // Salvar alterações nos dados do professor
    const salvarAlteracoes = async () => {
        try {
            await updateDoc(doc(db, 'usuarios', uid), {
                nome,
                usuario,
                idfuncionario,
                cursos: cursosSelecionados,
                periodos: periodosPorCurso,
            });
            Alert.alert('Sucesso', 'Professor atualizado!');
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert('Erro ao salvar alterações');
        }
    };

    // Deletar professor
    const deletarProfessor = () => {
        Alert.alert('Confirmar', 'Deseja realmente deletar este professor?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Deletar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'usuarios', uid));
                        Alert.alert('Sucesso', 'Professor deletado');
                        navigation.goBack();
                    } catch (err) {
                        console.error(err);
                        Alert.alert('Erro ao deletar');
                    }
                },
            },
        ]);
    };

    // Carregar projetos de um tema selecionado
    const carregarProjetosDoTema = async (temaId) => {
        setTemaSelecionado(temaId);
        const temaRef = doc(db, 'temas', temaId);
        const q = query(collection(db, 'projetos'), where('temaId', '==', temaRef));
        const snapshot = await getDocs(q);
        const listaProjetos = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        setProjetos(listaProjetos);

        const avaliacoesRef = collection(db, 'avaliacoes');
        const avaliacoesQuery = query(avaliacoesRef, where('temaId', '==', temaRef));
        const avaliacoesSnap = await getDocs(avaliacoesQuery);

        const notasDoAvaliador = {};
        const somaNotas = {};
        const contagemNotas = {};

        avaliacoesSnap.docs.forEach((docAval) => {
            const data = docAval.data();
            const pId = data.projetoId.id;
            const e = Number(data.execucao || 0);
            const c = Number(data.criatividade || 0);
            const v = Number(data.vibes || 0);
            const media = (e + c + v) / 3;

            if (data.avaliadorId.id === uid) {
                notasDoAvaliador[pId] = { execucao: e, criatividade: c, vibes: v };
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
            medias[pId] = (somaNotas[pId] / contagemNotas[pId]).toFixed(2);
            const projetoRef = doc(db, 'projetos', pId);
            await updateDoc(projetoRef, { notaMedia: medias[pId] });
        }

        setNotas(notasDoAvaliador);
        setNotasMedias(medias);
    };

    // Manipular mudança de notas
    const handleNotaChange = (projetoId, tipo, valor) => {
        setNotas(prev => ({
            ...prev,
            [projetoId]: {
                ...prev[projetoId],
                [tipo]: valor,
            },
        }));
    };

    // Salvar notas de um projeto
    const salvarNota = async (projetoId) => {
        if (!notas[projetoId] || !notas[projetoId].execucao || !notas[projetoId].criatividade || !notas[projetoId].vibes) {
            Alert.alert('Erro', 'Preencha todas as notas antes de salvar.');
            return;
        }

        const avaliadorRef = doc(db, 'usuarios', uid);
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
            execucao: Number(notas[projetoId].execucao),
            criatividade: Number(notas[projetoId].criatividade),
            vibes: Number(notas[projetoId].vibes),
        };

        if (snapshot.empty) {
            await addDoc(avaliacoesRef, dataToSave);
        } else {
            const docId = snapshot.docs[0].id;
            const docRef = doc(db, 'avaliacoes', docId);
            await updateDoc(docRef, dataToSave);
        }

        Alert.alert('Sucesso', 'Nota salva com sucesso!');
        carregarProjetosDoTema(temaSelecionado);
    };

    if (!professor) return <Text>Carregando dados do professor...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Campos de edição do professor */}
            <Text style={styles.label}>Nome:</Text>
            <TextInput value={nome} onChangeText={setNome} style={styles.input} />

            <Text style={styles.label}>Usuário:</Text>
            <TextInput value={usuario} onChangeText={setUsuario} style={styles.input} />

            <Text style={styles.label}>ID Funcionário:</Text>
            <TextInput value={idfuncionario} onChangeText={setIdFuncionario} style={styles.input} />

            <Text style={styles.label}>Cursos e Períodos:</Text>
            {cursos.map((curso) => (
                <View key={curso.id} style={styles.cursoContainer}>
                    <View style={styles.cursoCheckbox}>
                        <Checkbox
                            value={cursosSelecionados.includes(curso.id)}
                            onValueChange={() => toggleCurso(curso.id)}
                        />
                        <Text>{curso.nome}</Text>
                    </View>
                    {cursosSelecionados.includes(curso.id) && (
                        <View style={styles.periodosContainer}>
                            {Array.from({ length: curso.quantidadePeriodos || 0 }, (_, i) => i + 1).map((p) => (
                                <View key={p} style={styles.periodoCheckbox}>
                                    <Checkbox
                                        value={periodosPorCurso[curso.id]?.includes(p)}
                                        onValueChange={() => togglePeriodo(curso.id, p)}
                                    />
                                    <Text>{p}º</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}

            {/* Seção de temas e projetos */}
            <Text style={styles.label}>Temas Associados:</Text>
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
                    <Text style={styles.label}>Projetos do Tema</Text>
                    <FlatList
                        data={projetos}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            const nota = notas[item.id] || {};
                            return (
                                <View style={styles.card}>
                                    <Text style={styles.nome}>{item.nomeProjeto}</Text>
                                    <Text style={styles.desc}>{item.descricaoProjeto}</Text>
                                    <Text>Nota Média: {notasMedias[item.id] || 'N/A'}</Text>

                                    {nota.execucao && nota.criatividade && nota.vibes ? (
                                        <Text>
                                            Sua nota média: {((Number(nota.execucao) + Number(nota.criatividade) + Number(nota.vibes)) / 3).toFixed(2)}
                                        </Text>
                                    ) : (
                                        <Text>Você ainda não avaliou este projeto.</Text>
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

                                    <Button title="Salvar Nota" onPress={() => salvarNota(item.id)} />
                                </View>
                            );
                        }}
                    />
                </>
            )}

            {/* Botões de ação */}
            <View style={{ marginVertical: 20 }}>
                <Button title="Salvar Alterações" onPress={salvarAlteracoes} />
            </View>
            <View style={{ marginBottom: 40 }}>
                <Button title="Deletar Professor" color="red" onPress={deletarProfessor} />
            </View>
        </ScrollView>
    );
}

// Estilos
const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#fff',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 4,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        padding: 8,
        borderRadius: 4,
    },
    cursoContainer: {
        marginTop: 10,
        marginBottom: 5,
    },
    cursoCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    periodosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 24,
        marginTop: 5,
        gap: 10,
    },
    periodoCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
    },
    desc: {
        fontSize: 14,
        marginBottom: 10,
    },
    picker: {
        marginBottom: 10,
    },
});