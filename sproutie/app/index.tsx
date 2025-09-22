import { Text, View } from "react-native";
import Login from './login/index';
import Register from './register/index';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Login />
      {/* 
        To switch between Login and Register, you can use state.
        Example:
        const [showLogin, setShowLogin] = React.useState(true);
        {showLogin ? <Login /> : <Register />}
        <Button title={showLogin ? "Go to Register" : "Go to Login"} onPress={() => setShowLogin(!showLogin)} />
      */}
    </View>
  );
}
