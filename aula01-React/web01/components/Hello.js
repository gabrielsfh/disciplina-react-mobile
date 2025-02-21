import { Text, View, StyleSheet } from 'react-native';

export default function Hello() {
  return (
    <View style={styles.container}>
          <Text style={styles.text}>Hello, World!!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
      padding: 8,
    },
    text:{
      fontSize: 100,
      textAlign: 'center', 
      margin:10,
    }
  });
  