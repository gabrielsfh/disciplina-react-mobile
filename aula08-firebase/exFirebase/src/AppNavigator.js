import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

import UsersListScreen from './screens/UsersListScreen';

import OptionsScreen from './screens/OptionsScreen'

// Adm
import RegisterAlunos from './screens/admScreens/RegisterAlunos';
import RegisterCursos from './screens/admScreens/RegisterCursos';
import RegisterAdmin from './screens/admScreens/RegisterAdmin';
import RegisterProfessor from './screens/admScreens/RegisterProfessor';

// Avaliador
import ListarProjetos from './screens/avaliadorScreens/ListarProjetos';
import RegisterNotas from './screens/avaliadorScreens/RegisterNotas';

// Professor
import RegisterTema from './screens/professorScreens/RegisterTema';

// Aluno
import RegisterProjeto from './screens/alunoScreens/RegisterProjeto';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Menu" }} />
                <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: "Usuários Cadastrados" }} />

                <Stack.Screen name="OptionsScreen" component={OptionsScreen} options={{ title: "Opções" }} />

                <Stack.Screen name="RegisterAdmin" component={RegisterAdmin} options={{ title: "Registrar Administradores" }} />
                <Stack.Screen name="RegisterCursos" component={RegisterCursos} options={{ title: "Registrar Cursos" }} />
                <Stack.Screen name="RegisterAlunos" component={RegisterAlunos} options={{ title: "Registrar Alunos" }} />
                <Stack.Screen name="RegisterProfessor" component={RegisterProfessor} options={{ title: "Registrar Professor" }} />
                
                <Stack.Screen name="RegisterTema" component={RegisterTema} options={{ title: "Gerenciar Temas" }} />
                

                <Stack.Screen name="RegisterProjeto" component={RegisterProjeto} options={{ title: "Registrar Projeto" }} />
            {/* 
                ADM
                
                
                AVALIADOR
                <Stack.Screen name="RegisterNotas" component={RegisterNotas} options={{ title: "Registrar Notas" }} />
                <Stack.Screen name="ListarProjetos" component={ListarProjetos} options={{ title: "Projetos Submetidos" }} />
                PROFESSOR
                
                 */}
                
            </Stack.Navigator>
        </NavigationContainer>
    );
}
