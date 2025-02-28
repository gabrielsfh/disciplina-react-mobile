import { Text, View, StyleSheet } from 'react-native';

const Greeting = ( props ) => {
  return (
    <View style={styles.container}>
          <Text style={styles.text}>Hello {props.name}</Text>
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
    fontFamily: "Comic Sans MS",
    textAlign: 'center', 
    margin:10,
    color: "red",
    backgroundColor: "blue"
  }
});

export default Greeting;

