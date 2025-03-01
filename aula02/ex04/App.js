import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import '@expo/metro-runtime';

function CustomButton({title, onPress}){
  return(
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text} >{title}</Text>
    </TouchableOpacity>
  )
}

export default function App() {
  return (
    <View styles={styles.container}>
    <CustomButton
    title="Clique aqui" 
    onPress={() => alert('Botão pressionado!')}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center'
  },
});