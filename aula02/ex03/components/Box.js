import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function Box(props) {
    return ( 
        <View style={styles.container}>
            <View style={styles.box}>
                <Text style={styles.text}>{props.nome}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Add container style if needed
        justifyContent: 'center',
        alignItems: 'center'
    },
    box: {
        width: 200,
        height: 200,
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        color: 'white',
        fontSize: 18
    }
});
