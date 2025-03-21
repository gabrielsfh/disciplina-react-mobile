import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
const ProfileScreen = ({ setIsAuthenticated }) => {
    return (
        <View style={styles.container}>
            <Text>Bem-vindo ao Perfil!</Text>
            <Button title="Sair" onPress={() => setIsAuthenticated(false)} />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default ProfileScreen;