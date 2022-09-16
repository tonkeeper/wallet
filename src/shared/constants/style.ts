import {Dimensions} from "react-native";

export enum Opacity {
  ForSmall = 0.24,
  ForLarge = 0.72,
}

const { width } = Dimensions.get('window');

export const LargeNavBarHeight = 88;
export const NavBarHeight = 64;
export const TabletMaxWidth = 706;
export const TabletModalsWidth = 556;
export const IsTablet = width > TabletMaxWidth;