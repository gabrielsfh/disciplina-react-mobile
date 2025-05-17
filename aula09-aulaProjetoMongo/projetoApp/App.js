import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ListaProdutos from "./src/ListaProdutos";
import FormProduto from "./src/FormProduto";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import '@expo/metro-runtime';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Lista">
        <Stack.Screen
          name="Lista"
          component={ListaProdutos}
          options={{ title: 'Produtos' }}
        />
        <Stack.Screen
          name="Form"
          component={FormProduto}
          options={{ title: 'Novo / Editar Produto' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
