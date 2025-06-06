// src/screens/UserListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import useFirebase from '../hooks/useFirebaseForm';
import globalStyles from '../styles/globalStyles';

export default function UserListScreen({ navigation }) {
  const [alugueis, setAlugueis] = useState([]); 
  const { fetchUsers, deleteUser } = useFirebase(); 

  useEffect(() => {
    const loadAlugueis = async () => {
      const data = await fetchUsers(); 
      setAlugueis(data);
    };

    loadAlugueis();
  }, []);



  const renderItem = ({ item }) => (
    <View style={globalStyles.listItem}>
      <Text>-----------------</Text>
      <Text style={globalStyles.text}>Nome do carro: {item.nomeCarro}</Text>
      <Text style={globalStyles.text}>Data: {item.DataAluguel}</Text>
      <Text style={globalStyles.text}>Nome do cliente: {item.nomeCliente}</Text>
      <Text style={globalStyles.text}>Valor do aluguel: R$ {item.valorAluguel}</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Lista de Aluguéis</Text>
      <FlatList
        data={alugueis}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={globalStyles.text}>Nenhum aluguel encontrado.</Text>}
      />
    </View>
  );
}