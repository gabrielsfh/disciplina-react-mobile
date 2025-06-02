import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, doc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import Checkbox from 'expo-checkbox';

export default function RegisterAvaliador({ navigation }) {
  const [modo, setModo] = useState('novo'); // 'novo' ou 'professor'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [temas, setTemas] = useState([]);
  const [temasSelecionados, setTemasSelecionados] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);

  useEffect(() => {
    const fetchTemas = async () => {
      const snapshot = await getDocs(collection(db, 'temas'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemas(lista);
    };

    const fetchProfessores = async () => {
      const q = query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'professor'));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfessores(lista);
    };

    fetchTemas();
    fetchProfessores();
  }, []);

  const toggleTema = (id) => {
    setTemasSelecionados((prev) =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleCriarAvaliadorNovo = async () => {
    if (!email || !senha || temasSelecionados.length === 0) {
      Alert.alert('Erro', 'Preencha o email, senha e selecione ao menos um tema.');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const { uid } = cred.user;

      await setDoc(doc(db, 'usuarios', uid), {
        uid,
        email,
        tipoUsuario: 'avaliador',
        temas: temasSelecionados,
      });

      Alert.alert('Sucesso', 'Avaliador cadastrado com sucesso!');
      setEmail('');
      setSenha('');
      setTemasSelecionados([]);
      navigation.navigate('UsersList');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível cadastrar o avaliador.');
    }
  };

  const handleDesignarProfessorComoAvaliador = async () => {
    if (!professorSelecionado || temasSelecionados.length === 0) {
      Alert.alert('Erro', 'Selecione um professor e ao menos um tema.');
      return;
    }

    try {
      const profRef = doc(db, 'usuarios', professorSelecionado);
      await updateDoc(profRef, {
        avaliador: true,
        temas: temasSelecionados,
      });

      Alert.alert('Sucesso', 'Professor agora é também avaliador!');
      setProfessorSelecionado(null);
      setTemasSelecionados([]);
      navigation.navigate('UsersList');
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível atualizar o professor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Modo de Cadastro</Text>
      <Picker
        selectedValue={modo}
        onValueChange={(value) => {
          setModo(value);
          setTemasSelecionados([]);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Cadastrar Avaliador Novo" value="novo" />
        <Picker.Item label="Designar Professor como Avaliador" value="professor" />
      </Picker>

      {modo === 'novo' && (
        <>
          <Text style={styles.title}>Cadastrar Avaliador com Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </>
      )}

      {modo === 'professor' && (
        <>
          <Text style={styles.title}>Designar Professor como Avaliador</Text>
          <Text style={styles.label}>Selecione um Professor:</Text>
          {professores.map(p => (
            <View key={p.id} style={styles.checkboxContainer}>
              <Checkbox
                value={professorSelecionado === p.id}
                onValueChange={() => setProfessorSelecionado(p.id)}
              />
              <Text style={styles.checkboxLabel}>{p.nome} ({p.usuario})</Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.label}>Temas:</Text>
      {temas.map(t => (
        <View key={t.id} style={styles.checkboxContainer}>
          <Checkbox
            value={temasSelecionados.includes(t.id)}
            onValueChange={() => toggleTema(t.id)}
          />
          <Text style={styles.checkboxLabel}>{t.titulo}</Text>
        </View>
      ))}

      {modo === 'novo' ? (
        <Button title="Cadastrar Avaliador Novo" onPress={handleCriarAvaliadorNovo} color="#000000" />
      ) : (
        <Button title="Tornar Professor um Avaliador" onPress={handleDesignarProfessorComoAvaliador} color="#3333aa" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 4
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15
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
