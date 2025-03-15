import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Evento1 from './components/Evento1';
import Evento2 from './components/Evento2';
import Evento3 from './components/Evento3';
import '@expo/metro-runtime';

// Criando o Drawer Navigator
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator(); 

function Nav() {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Evento 1">
        <Drawer.Screen 
          name="Evento 1" 
          component={Evento1} 
          initialParams={{ evento: 'Evento 1' }} // Passa o parâmetro evento
        />
        <Drawer.Screen 
          name="Evento 2" 
          component={Evento2} 
          initialParams={{ evento: 'Evento 2' }} // Passa o parâmetro evento
        />
        <Drawer.Screen 
          name="Evento 3" 
          component={Evento3} 
          initialParams={{ evento: 'Evento 3' }} // Passa o parâmetro evento
        />
      </Drawer.Navigator>
      
    </NavigationContainer>
  );
}

function App() {
  return (
    <>
    <Nav/>
    <NavigationContainer>
    <Tab.Navigator>
        <Tab.Screen name="Evento1" component={Evento1} />
        <Tab.Screen name="Evento2" component={Evento2} />
        <Tab.Screen name="Evento3" component={Evento3} />
    </Tab.Navigator>

    </NavigationContainer>
    
    </>
  );
}

export default App;
