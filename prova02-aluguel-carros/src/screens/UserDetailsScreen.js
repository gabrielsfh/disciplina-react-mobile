// src/screens/UserDetailsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator
} from 'react-native';
import useFirebase from '../hooks/useFirebase';
import globalStyles from '../styles/globalStyles';

export default function UserDetailsScreen({ route }) {
  const { id } = route.params;
  const [user, setUser] = useState(null);
  const { getUserById } = useFirebase();

  useEffect(() => {
    (async () => {
      const data = await getUserById(id);
      setUser(data);
    })();
  }, [id]);

  if (!user) {
    return (
      <View style={globalStyles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Detalhes</Text>
      <Text>Nome: {user.nome}</Text>
      <Text>Período: {user.periodo}</Text>
      <Text>Email: {user.email}</Text>
      {/* Não exiba senha em produção! */}
    </View>
  );
}
