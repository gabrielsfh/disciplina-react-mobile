import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./components/AppNavigator";
import LoginScreen from "./components/LoginScreen";
import '@expo/metro-runtime'
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <LoginScreen setIsAuthenticated={setIsAuthenticated} />
      )}
    </NavigationContainer>
  );
}
