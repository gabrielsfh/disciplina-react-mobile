import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export default function EditarAdminScreen({ navigation, route }) {
  const { uid } = route.params;

 
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(true);


  const fetchData = useCallback(async () => {
    try {
      const adminRef = doc(db, 'usuarios', uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        Alert.alert('Erro', 'Administrador não encontrado.');
        navigation.goBack();
        return;
      }

      const data = adminSnap.data();
      if (data.tipoUsuario !== 'administrador') {
        Alert.alert('Erro', 'Usuário não é um administrador.');
        navigation.goBack();
        return;
      }

      setNome(data.nome || '');
      setUsuario(data.usuario || '');
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do administrador.');
      navigation.goBack();
    }
  }, [uid, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const handleSalvar = useCallback(async () => {
    if (!nome || !usuario) {
      Alert.alert('Erro', 'Preencha o nome e o usuário.');
      return;
    }

    try {
      
      const q = query(collection(db, 'usuarios'), where('usuario', '==', usuario));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].id !== uid) {
        Alert.alert('Erro', 'Este nome de usuário já está em uso.');
        return;
      }

      const adminRef = doc(db, 'usuarios', uid);
      await updateDoc(adminRef, {
        nome,
        usuario,
      });

      Alert.alert('Sucesso', 'Dados do administrador atualizados com sucesso!');
      navigation.navigate('UsersList');
    } catch (error) {
      console.error('Erro ao atualizar administrador:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
    }
  }, [nome, usuario, uid, navigation]);


  const deletarAdmin = useCallback(async () => {
    if (uid === auth.currentUser.uid) {
      Alert.alert('Erro', 'Você não pode deletar sua própria conta de administrador.');
      return;
    }

    Alert.alert('Confirmação', 'Deseja deletar este administrador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            const adminRef = doc(db, 'usuarios', uid);
            await deleteDoc(adminRef);

            Alert.alert('Sucesso', 'Administrador deletado com sucesso!');
            navigation.navigate('UsersList');
          } catch (error) {
            console.error('Erro ao deletar administrador:', error);
            Alert.alert('Erro', 'Não foi possível deletar o administrador.');
          }
        },
      },
    ]);
  }, [uid, navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Administrador</Text>

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

      <View style={styles.saveButton}>
        <Button title="Salvar Alterações" onPress={handleSalvar} color="#007bff" />
      </View>

      <View style={styles.deleteButton}>
        <Button title="Deletar Administrador" onPress={deletarAdmin} color="#ff4d4d" />
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
    marginBottom: 20,
  },
});