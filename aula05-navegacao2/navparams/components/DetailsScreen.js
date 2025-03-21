import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
const DetailsScreen = ({ route }) => {
const { input } = route.params;
return (
<View style={styles.container}>
<Text>Você digitou: {input}</Text>
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
export default DetailsScreen;