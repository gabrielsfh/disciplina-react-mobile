import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');

    const handleLogin = async () => {
        if (!usuario || !senha) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        try {
            const q = query(
                collection(db, 'usuarios'),
                where('usuario', '==', usuario),
                where('senha', '==', senha)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                const userId = userDoc.id;

                Alert.alert("Sucesso", "Login realizado com sucesso!");

                // Redireciona para OptionsScreen, passando o ID e tipoUsuario
                navigation.replace('OptionsScreen', {
                    userId,
                    tipoUsuario: userData.tipoUsuario
                });
            } else {
                Alert.alert("Erro", "Usuário ou senha incorretos.");
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível realizar o login.");
            console.error("Erro ao fazer login: ", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Usuário:</Text>
            <TextInput
                style={styles.input}
                value={usuario}
                onChangeText={setUsuario}
                placeholder="Digite o usuário"
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite a senha"
                secureTextEntry
            />

            <Button title="Entrar" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 16,
        marginTop: 12
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginTop: 4
    }
});
