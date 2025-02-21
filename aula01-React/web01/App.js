import { View, StyleSheet } from 'react-native'
import Hello from './components/Hello';

export default function App() {
  return (
    <View style={styles.container}>
      <Hello/>
      <Hello/>
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
