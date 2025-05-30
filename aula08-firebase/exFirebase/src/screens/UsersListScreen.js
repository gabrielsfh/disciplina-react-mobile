// src/screens/UsersListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function UsersListScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsuarios(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.nome && <Text style={styles.itemText}>Nome: {item.nome}</Text>}
            {item.usuario && <Text style={styles.itemText}>Usuário: {item.usuario}</Text>}
            {item.email && <Text style={styles.itemText}>Email: {item.email}</Text>}
            {item.nmatricula && <Text style={styles.itemText}>Matrícula: {item.nmatricula}</Text>}
            {item.tipoUsuario && <Text style={styles.itemText}>Tipo: {item.tipoUsuario}</Text>}
            {item.curso && <Text style={styles.itemText}>Curso ID: {item.curso}</Text>}
            {item.periodo && <Text style={styles.itemText}>Período: {item.periodo}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum usuário cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  loader: {
    flex: 1,
    justifyContent: 'center'
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  itemText: {
    fontSize: 16
  }
});
