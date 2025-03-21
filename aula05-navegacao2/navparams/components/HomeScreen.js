import React, { useState } from 'react';
import { View, Button, TextInput, StyleSheet } from 'react-native';
const HomeScreen = ({ navigation }) => {
    const [input, setInput] = useState('');
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Digite algo"
                value={input}
                onChangeText={setInput}
            />
            <Button title="Enviar" onPress={() => navigation.navigate('Details', { input })} />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
export default HomeScreen;