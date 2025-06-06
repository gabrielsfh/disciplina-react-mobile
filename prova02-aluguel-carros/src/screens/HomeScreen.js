import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../styles/globalStyles';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome to the App</Text>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={globalStyles.buttonText}>Registrar novo usuario</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('ListScreen')}
      >
        <Text style={globalStyles.buttonText}>Lista de Alugueis</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('FormsScreen')}
      >
        <Text style={globalStyles.buttonText}>Registrar Alugueis</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
