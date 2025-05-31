import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import globalStyles from '../styles/globalStyles';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome to the App</Text>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={globalStyles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={globalStyles.button}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={globalStyles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
