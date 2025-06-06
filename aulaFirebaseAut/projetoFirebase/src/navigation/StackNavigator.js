import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserListScreen from '../screens/ListScreen';
import UserDetailsScreen from '../screens/UserDetailsScreen';
import FormsScreen from '../screens/FormsScreen';
import ListScreen from '../screens/ListScreen';

const Stack = createStackNavigator();

const StackNavigator = () => (
  <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="UserListScreen" component={UserListScreen} />
    <Stack.Screen name="FormsScreen" component={FormsScreen} />
    <Stack.Screen name="ListScreen" component={ListScreen} />
  </Stack.Navigator>
);

export default StackNavigator;
