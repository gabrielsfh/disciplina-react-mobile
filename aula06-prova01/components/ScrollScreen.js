import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import FlatListScreen from "./scroll/FlatListScreen";
import FormScreen from "./scroll/FormScreen";
import SectionListScreen from "./scroll/SectionListScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

const ScrollScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Lista") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Seção") {
            iconName = focused ? "bookmarks-sharp" : "bookmarks-outline";
          } else if (route.name === "Formulário") {
          iconName = focused ? "albums" : "albums-outline";
        }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
      initialRouteName="Lista"
    >
      <Tab.Screen name="Lista" component={FlatListScreen} />
      <Tab.Screen name="Seção" component={SectionListScreen} />
      <Tab.Screen name="Formulário" component={FormScreen} />
    </Tab.Navigator>
  );
};

export default ScrollScreen;
