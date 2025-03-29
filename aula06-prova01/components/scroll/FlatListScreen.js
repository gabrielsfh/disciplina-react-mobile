import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";

const FlatListScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Array.from({ length: 80 }).map((_, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.text}>Item {index + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
  },
  item: {
    marginBottom: 10,
    padding: 20,
    backgroundColor: "#e0d4d3",
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default FlatListScreen;
