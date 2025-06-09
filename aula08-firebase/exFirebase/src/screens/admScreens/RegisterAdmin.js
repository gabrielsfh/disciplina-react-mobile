import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';

export default function RegisterAdmin({ navigation }) {
    const [nome, setNome] = useState('');
    const [usuario, setUsuario] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const handleSubmit = async () => {
        if (!nome || !usuario || !email || !senha) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        try {
           
            const q = query(collection(db, 'usuarios'), where('usuario', '==', usuario));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                Alert.alert("Erro", "Este nome de usuário já está em uso.");
                return;
            }

           
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const uid = userCredential.user.uid;

           
            await setDoc(doc(db, 'usuarios', uid), {
                uid,
                nome,
                usuario,
                email,
                tipoUsuario: 'administrador'
            });

            Alert.alert("Sucesso", "Administrador cadastrado!");
            setNome('');
            setUsuario('');
            setEmail('');
            setSenha('');
            navigation.navigate('UsersList');

        } catch (error) {
            console.error("Erro no cadastro: ", error);
            Alert.alert("Erro", "Não foi possível cadastrar o usuário.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nome:</Text>
            <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Digite o nome"
            />

            <Text style={styles.label}>Nome de usuário:</Text>
            <TextInput
                style={styles.input}
                value={usuario}
                onChangeText={setUsuario}
                placeholder="Digite o nome de usuário"
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite o email"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Senha:</Text>
            <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite a senha"
                secureTextEntry
            />

            <Button title="Cadastrar" onPress={handleSubmit} />
            <Button
                title="Visualizar Cadastros"
                onPress={() => navigation.navigate('UsersList')}
                color="#841584"
            />
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
