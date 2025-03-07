import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import '@expo/metro-runtime';

const data = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Item ${i + 1}` }));

export default function App() {
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
         
          <View style={styles.item}>
            <Text style={styles.text}>{item.name}</Text>
          </View>
        )}
  
        contentContainerStyle={styles.listContent}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20
  },
  listContent: {
    alignItems: 'center',
  },
  item: {
    padding: 10,
    borderBottomColor: '#ccc',
    backgroundColor: 'blue'
  },
  text: {
    fontSize: 16,
    color: 'white'
  },
});