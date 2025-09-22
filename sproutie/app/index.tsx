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
      <Register />
      
    </View>
  );
}
