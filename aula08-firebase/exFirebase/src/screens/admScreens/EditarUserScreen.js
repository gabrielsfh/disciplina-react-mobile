import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { collection, doc, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';

export default function EditarAlunoScreen({ navigation, route }) {
  // Espera que o uid do aluno seja passado pela rota
  const { uid } = route.params;

  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [nmatricula, setNmatricula] = useState('');
  const [cursosDisponiveis, setCursosDisponiveis] = useState([]);
  const [cursosSelecionados, setCursosSelecionados] = useState([]);
  const [periodosPorCurso, setPeriodosPorCurso] = useState({});
  const [loading, setLoading] = useState(true);

  // Carregar cursos disponíveis do Firestore
  useEffect(() => {
    const fetchCursos = async () => {
      const snapshot = await getDocs(collection(db, 'cursos'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCursosDisponiveis(lista);
    };
    fetchCursos();
  }, []);

  // Carregar dados do aluno para edição
  useEffect(() => {
    const fetchAluno = async () => {
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
        setEmail(data.email || '');
        setNmatricula(data.nmatricula || '');
        setCursosSelecionados(data.cursos || []);
        setPeriodosPorCurso(data.periodos || {});
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar aluno:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do aluno.');
        navigation.goBack();
      }
    };

    fetchAluno();
  }, [uid, navigation]);

  // Alterar seleção de cursos
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
        [cursoId]: null,
      });
    }
  };

  // Alterar período para curso específico
  const handlePeriodoChange = (cursoId, periodo) => {
    const numeroPeriodo = parseInt(periodo, 10);
    setPeriodosPorCurso({
      ...periodosPorCurso,
      [cursoId]: isNaN(numeroPeriodo) ? null : numeroPeriodo,
    });
  };

  // Validar e salvar alterações no Firestore
  const handleSalvar = async () => {
    if (!nome || !usuario || !email || !nmatricula || cursosSelecionados.length === 0) {
      Alert.alert('Erro', 'Preencha todos os campos e selecione ao menos um curso.');
      return;
    }

    const periodosPreenchidos = cursosSelecionados.every(cursoId =>
      periodosPorCurso[cursoId] !== null && periodosPorCurso[cursoId] !== undefined
    );

    if (!periodosPreenchidos) {
      Alert.alert('Erro', 'Selecione um período para cada curso.');
      return;
    }

    try {
      // Validar usuário, matrícula e email únicos (excluindo o próprio uid)
      const usuarioSnap = await getDocs(query(
        collection(db, 'usuarios'),
        where('usuario', '==', usuario),
        where('tipoUsuario', '==', 'aluno')
      ));
      if (!usuarioSnap.empty) {
        const temOutro = usuarioSnap.docs.some(docSnap => docSnap.id !== uid);
        if (temOutro) {
          Alert.alert('Erro', 'Já existe outro aluno com esse nome de usuário.');
          return;
        }
      }

      const matriculaSnap = await getDocs(query(
        collection(db, 'usuarios'),
        where('nmatricula', '==', nmatricula),
        where('tipoUsuario', '==', 'aluno')
      ));
      if (!matriculaSnap.empty) {
        const temOutro = matriculaSnap.docs.some(docSnap => docSnap.id !== uid);
        if (temOutro) {
          Alert.alert('Erro', 'Já existe outro aluno com essa matrícula.');
          return;
        }
      }

      const emailSnap = await getDocs(query(
        collection(db, 'usuarios'),
        where('email', '==', email),
        where('tipoUsuario', '==', 'aluno')
      ));
      if (!emailSnap.empty) {
        const temOutro = emailSnap.docs.some(docSnap => docSnap.id !== uid);
        if (temOutro) {
          Alert.alert('Erro', 'Já existe outro aluno com esse email.');
          return;
        }
      }

      // Atualizar dados no Firestore
      const alunoRef = doc(db, 'usuarios', uid);
      await updateDoc(alunoRef, {
        nome,
        usuario,
        email,
        nmatricula,
        cursos: cursosSelecionados,
        periodos: periodosPorCurso
      });

      Alert.alert('Sucesso', 'Aluno atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados do aluno.');
    }
  };

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
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

      <Text style={styles.label}>Nome de usuário:</Text>
      <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} placeholder="Nome de usuário" />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Número de Matrícula:</Text>
      <TextInput
        style={styles.input}
        value={nmatricula}
        onChangeText={setNmatricula}
        placeholder="Ex: 2023012345"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Cursos:</Text>
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
        const curso = cursosDisponiveis.find(c => c.id === cursoId);
        const total = parseInt(curso?.quantidadePeriodos || '0', 10);
        const periodos = Array.from({ length: total }, (_, i) => (i + 1).toString());

        return (
          <View key={cursoId}>
            <Text style={styles.label}>Período do aluno no curso {curso.nome}:</Text>
            <Picker
              selectedValue={periodosPorCurso[cursoId]?.toString() || ''}
              onValueChange={(value) => handlePeriodoChange(cursoId, value)}
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

      <Button title="Salvar Alterações" onPress={handleSalvar} color="#007bff" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 15,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginTop: 5,
    borderRadius: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  picker: {
    marginTop: 5,
  },
});
