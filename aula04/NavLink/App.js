import '@expo/metro-runtime'; 
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Evento1 from './components/Evento1';
import Evento2 from './components/Evento2';
import Evento3 from './components/Evento3';

// React Navigation imports
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// TelaInicial componente
function TelaInicial({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title="Evento1"
        onPress={() => navigation.navigate('Evento1')}
      />
      <Button
        title="Evento2"
        onPress={() => navigation.navigate('Evento2')}
      />
      <Button
        title="Evento3"
        onPress={() => navigation.navigate('Evento3')}
      />
    </View>
  );
}

// Stack Navigator setup
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial">
        <Stack.Screen name="Home" component={TelaInicial} />
        <Stack.Screen name="Evento1" component={Evento1} />
        <Stack.Screen name="Evento2" component={Evento2} />
        <Stack.Screen name="Evento3" component={Evento3} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
