import React, { useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function OptionsScreen({ navigation, route }) {
    const { userId, tipoUsuario, avaliador } = route.params;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigation.replace('LoginScreen');
            }
        });
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>

            {tipoUsuario === 'administrador' && (
                <>
                    <View style={styles.button}>
                        <Button
                            title="Cadastrar Professor"
                            onPress={() => navigation.navigate('RegisterProfessor')}
                            color="#3498DB" // azul
                        />
                    </View>


                    <View style={styles.button}>
                        <Button
                            title="Cadastrar Aluno"
                            onPress={() => navigation.navigate('RegisterAlunos')}
                            color="#9B59B6" // roxo
                        />
                    </View>

                    <View style={styles.button}>
                        <Button
                            title="Cadastrar Avaliador"
                            onPress={() => navigation.navigate('RegisterAvaliador')}
                            color="#E74C3C" // vermelho
                        />
                    </View>

                    <View style={styles.button}>
                        <Button
                            title="Cadastrar Administrador"
                            onPress={() => navigation.navigate('RegisterAdmin')}
                            color="#F1C40F" // amarelo
                        />
                    </View>

                    <View style={styles.button}>
                        <Button
                            title="Cadastrar Curso"
                            onPress={() => navigation.navigate('RegisterCursos')}
                            color="#1ABC9C" // verde água
                        />
                    </View>

                    <View style={[styles.button, { marginTop: 5 }]}>
                        <Button
                            title="Visualizar Usuários"
                            onPress={() => navigation.navigate('UsersList')}
                            color="#D35400" // laranja queimado
                        />
                    </View>

                    <View style={[styles.button, { marginTop: 5 }]}>
                        <Button
                            title="Listar Cursos"
                            onPress={() => navigation.navigate('CursosList')}
                            color="#D35400" // laranja queimado
                        />
                    </View>
                </>
            )}

            {tipoUsuario === 'aluno' && (
                <View style={styles.button}>
                    <Button
                        title="Gerenciar projetos"
                        onPress={() => navigation.navigate('RegisterProjeto')}
                        color="#E67E22" // laranja
                    />
                </View>
            )}

            {(tipoUsuario === 'professor' || tipoUsuario === 'administrador') && (
                <View style={[styles.button, { marginTop: 5 }]}>
                    <Button
                        title="Gerenciar temas"
                        onPress={() => navigation.navigate('RegisterTema', { professorId: userId })}
                        color="#34495E" // cinza escuro
                    />
                </View>
            )}


            {(tipoUsuario === 'avaliador' || (tipoUsuario === 'professor' && avaliador)) && (
                <View style={styles.button}>
                    <Button
                        title="Avaliar Projetos"
                        onPress={() => navigation.navigate('ListarProjetos')}
                        color="#2ECC71"
                    />
                </View>
            )}


            <View style={[styles.button, { marginTop: 5 }]}>
                <Button
                    title="Listar Nota Projetos"
                    onPress={() => navigation.navigate('ListarNotaProjetos')}
                    color="#BCDC00"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    button: {
        marginBottom: 10,
    },
});
