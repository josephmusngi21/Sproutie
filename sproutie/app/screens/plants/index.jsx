import { usestate } from "react";
import { View } from "react-native";
import styles from "./styles";

export default function PlantsScreen() {
  const [loading, setLoading] = usestate(false);
  const [menuOption, setMenuOption] = usestate(0); //0 = my plants, 1 = all, keep an eye on plants

  const Menu = () => {
    //This will be a horizontal menu with 3 options: My Plants, All Plants, Keep an Eye On
    return <View style={styles.menuContainer}></View>;
  };

  const AllPlants = () => {
    //This will fetch all plants from the API and display them in a scrollable list
    return <View style={styles.allPlantsContainer}></View>;
  };
  
  const header = () => {
    //This will be a header with the title "Sproutie", with small menu icon on the left
    return <View style={styles.headerContainer}></View>;
  };

  const footer = () => {
    //This will be a footer with navigation icons: Home, Plants, Profile
    return <View style={styles.footerContainer}></View>;
  }

  return <View style={styles.container}></View>;
}
