import { Text, View, StyleSheet } from 'react-native';

const Greeting = ( props ) => {
  return (
    <View>
          <Text>Hello {props.name}</Text>
    </View>
  );
}

export default Greeting;

