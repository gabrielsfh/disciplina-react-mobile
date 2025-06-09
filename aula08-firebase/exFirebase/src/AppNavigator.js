import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Adm
import RegisterAlunos from './screens/admScreens/RegisterAlunos';
import RegisterCursos from './screens/admScreens/RegisterCursos';
import RegisterAdmin from './screens/admScreens/RegisterAdmin';
import RegisterProfessor from './screens/admScreens/RegisterProfessor';
import RegisterAvaliador from './screens/admScreens/RegisterAvaliador';
import EditarProfessorScreen from './screens/admScreens/EditarProfessorScreen'
import UsersListScreen from './screens/UsersListScreen';
import EditarAlunoScreen from './screens/admScreens/EditarAlunoScreen';
import EditarAvaliadorScreen from './screens/admScreens/EditarAvaliadorScreen'
import EditarAdminScreen from './screens/admScreens/EditarAdminScreen';
import ListarCursos from './screens/admScreens/ListarCursos';
// Avaliador
import ListarProjetos from './screens/avaliadorScreens/ListarProjetos';
// Professor
import RegisterTema from './screens/professorScreens/RegisterTema';
// Aluno
import RegisterProjeto from './screens/alunoScreens/RegisterProjeto';
// Geral
import ListarNotaProjetos from './screens/ListarNotasProjetos'
import OptionsScreen from './screens/OptionsScreen'
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="CursosList" component={ListarCursos} options={{ title: "Cursos" }} />
                <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Menu" }} />
                <Stack.Screen name="UsersList" component={UsersListScreen} options={{ title: "Usuários Cadastrados" }} />
                <Stack.Screen name="EditarAlunoScreen" component={EditarAlunoScreen} options={{ title: "Editar Aluno" }} />
                <Stack.Screen name="EditarAvaliadorScreen" component={EditarAvaliadorScreen} options={{ title: "Editar Avaliador" }} />
                <Stack.Screen name="EditarProfessorScreen" component={EditarProfessorScreen} options={{ title: "Editar Aluno" }} />
                <Stack.Screen name="EditarAdminScreen" component={EditarAdminScreen} />
                <Stack.Screen name="OptionsScreen" component={OptionsScreen} options={{ title: "Opções" }} />
                <Stack.Screen name="RegisterAdmin" component={RegisterAdmin} options={{ title: "Registrar Administradores" }} />
                <Stack.Screen name="RegisterCursos" component={RegisterCursos} options={{ title: "Registrar Cursos" }} />
                <Stack.Screen name="RegisterAlunos" component={RegisterAlunos} options={{ title: "Registrar Alunos" }} />
                <Stack.Screen name="RegisterProfessor" component={RegisterProfessor} options={{ title: "Registrar Professor" }} />
                <Stack.Screen name="RegisterAvaliador" component={RegisterAvaliador} options={{ title: "Registrar Avalaidor" }} />
                <Stack.Screen name="RegisterTema" component={RegisterTema} options={{ title: "Gerenciar Temas" }} />
                <Stack.Screen name="RegisterProjeto" component={RegisterProjeto} options={{ title: "Gerenciar Projeto" }} />
                <Stack.Screen name="ListarProjetos" component={ListarProjetos} options={{ title: "Projetos Submetidos" }} />
                <Stack.Screen name="ListarNotaProjetos" component={ListarNotaProjetos} options={{ title: "Listar nota projetos" }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
