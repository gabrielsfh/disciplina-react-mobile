// App.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Location from 'expo-location';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import '@expo/metro-runtime';

const Tab = createBottomTabNavigator();

function GpsScreen() {
  // Estado para armazenar os dados de localização
  const [location, setLocation] = useState(null);

  // Função para solicitar permissão e obter a localização atual
  const getLocation = async () => {
    // Solicita permissão para acessar a localização em primeiro plano
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permissão de localização negada');
      return;
    }

    // Se a permissão for concedida, obtém a posição atual do dispositivo
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  // Função para atualizar a localização ao pressionar o botão
  const handleUpdateLocation = () => {
    getLocation(); // Chama a função para atualizar a localização
  };

  return (
    <View style={styles.container}>
      {location ? (
        // Caso a localização já tenha sido obtida, exibe os dados e um botão para atualizar
        <View>
          <Text style={styles.text}>Latitude: {location.coords.latitude}</Text>
          <Text style={styles.text}>Longitude: {location.coords.longitude}</Text>
          <Button title="Atualizar Localização" onPress={handleUpdateLocation} />
        </View>
      ) : (
        // Se a localização ainda não foi obtida, exibe um botão para solicitar a localização
        <Button title="Obter Localização" onPress={handleUpdateLocation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Centraliza verticalmente o conteúdo
    alignItems: 'center', // Centraliza horizontalmente o conteúdo
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

function Home() {
  return (
    <View style={styles.container}>
      <Text>Home que não tem nada</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Gps') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Gps" component={GpsScreen} />
        <Tab.Screen name="Home" component={Home} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}