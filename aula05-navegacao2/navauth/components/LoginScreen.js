import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
const LoginScreen = ({ setIsAuthenticated }) => {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');
const handleLogin = () => {
if (username === 'user' && password === 'pass') {
setIsAuthenticated(true);
} else {
alert('Credenciais inválidas!');
}
};
return (
<View style={styles.container}>
<Text style={styles.title}>Login</Text>
<TextInput
style={styles.input}
placeholder="Usuário"
value={username}
onChangeText={setUsername}
/>
<TextInput
style={styles.input}
placeholder="Senha"
value={password}
secureTextEntry
onChangeText={setPassword}
/>
<Button title="Entrar" onPress={handleLogin} />
</View>
);
};
const styles = StyleSheet.create({
container: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
title: {
fontSize: 24,
marginBottom: 20,
},
input: {
height: 40,
borderColor: 'gray',
borderWidth: 1,
marginBottom: 20,
width: '80%',
paddingHorizontal: 10,
},
});
export default LoginScreen;