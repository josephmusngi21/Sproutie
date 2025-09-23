import { View } from "react-native";
import { useState } from "react";
import Login from './login/index';
import Register from './register/index';

export default function Index() {
  const [showLogin, setShowLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  
  return (
    <View style={{ flex: 1 }}>
      {showLogin ? <Login /> : <Register />}
    </View>
  );
}
