import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SectionList, Text, View } from 'react-native';
import '@expo/metro-runtime';

const sections = [
  {title: 'Seção 1', data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']},
  {title: 'Seção 2', data: ['Item 6', 'Item 7', 'Item 8']},
  {title: 'Seção 3', data: ['Item 9', 'Item 10', 'Item 11']}
];

export default function App() {
  return (

  <SectionList style={styles.section}
  sections={sections}
  keyExtractor={(item, index) => item + index}
  renderItem={({item}) => (<View style={styles.item}><Text style={styles.title}>{item}</Text></View>)}
  renderSectionHeader={({section: {title}}) => ( <Text style={styles.header}>{title}</Text>)} />
  );
}

const styles = StyleSheet.create({
  container: {
    paddding: 20,
  },
  section: {
    backgroundColor: 'yellow'
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'ligthblue',
    padding: 10,
    borderRadius: 8
  },
  item: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 8
  },
  text: {
    fontSize: 16
  }
});
