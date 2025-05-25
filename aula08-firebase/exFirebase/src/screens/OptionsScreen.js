import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.button}>
                <Button
                    title="Cadastrar Professor"
                    onPress={() => navigation.navigate('Register')}
                    color="#55CDFC" 
                />
            </View>

            <View style={styles.button}>
                <Button
                    title="Cadastrar Aluno"
                    onPress={() => navigation.navigate('RegisterAlunos')}
                    color="#F7A8B8" 
                />
            </View>

            <View style={styles.button}>
                <Button
                    title="Cadastrar Avaliador"
                    onPress={() => navigation.navigate('Register')}
                    color="#000000" 
                />
            </View>

            <View style={styles.button}>
                <Button
                    title="Cadastrar Administrador"
                    onPress={() => navigation.navigate('Register')}
                    color="#FFD800" 
                />
            </View>

            <View style={styles.button}>
                <Button
                    title="Cadastrar Curso"
                    onPress={() => navigation.navigate('RegisterCursos')}
                    color="#9B59B6" 
                />
            </View>

            <View style={[styles.button, { marginTop: 5 }]}>
                <Button
                    title="Visualizar Usuários"
                    onPress={() => navigation.navigate('UsersList')}
                    color="#1ABC9C" 
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
