// src/screens/UserListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import useFirebase from '../hooks/useFirebase';
import globalStyles from '../styles/globalStyles';

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const { fetchUsers, deleteUser } = useFirebase();

  useEffect(() => {
    (async () => {
      const data = await fetchUsers();
      setUsers(data);
    })();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      Alert.alert('Sucesso', 'Usuário excluído');
    } catch {
      Alert.alert('Erro', 'Não foi possível excluir');
    }
  };

  const renderItem = ({ item }) => (
    <View style={globalStyles.listItem}>
      <Text>{item.nome}</Text>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('UserDetails', { id: item.id })
        }
      >
        <Text style={globalStyles.link}>Ver</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={globalStyles.link}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Lista de Usuários</Text>
      <FlatList
        data={users}
        keyExtractor={(x) => x.id}
        renderItem={renderItem}
      />
    </View>
  );
}
