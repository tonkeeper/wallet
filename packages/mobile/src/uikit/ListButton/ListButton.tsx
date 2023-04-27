import React from 'react';
import { View } from '$uikit';
import { Steezy } from '$styles';
import Svg, { Path, Rect } from 'react-native-svg';
import { TouchableOpacity } from 'react-native-gesture-handler';

export interface ListButtonProps {
  type: 'add' | 'remove';
  onPress: () => void;
}

const PlusIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <Path
      fillRule="evenodd"
      clip-rule="evenodd"
      d="M6 0C5.44772 0 5 0.447715 5 1V5H1C0.447715 5 0 5.44772 0 6C0 6.55228 0.447715 7 1 7H5V11C5 11.5523 5.44772 12 6 12C6.55228 12 7 11.5523 7 11V7H11C11.5523 7 12 6.55228 12 6C12 5.44772 11.5523 5 11 5H7V1C7 0.447715 6.55228 0 6 0Z"
      fill="white"
    />
  </Svg>
);

const MinusIcon = () => (
  <Svg width="12" height="2" viewBox="0 0 12 2" fill="none">
    <Rect width="12" height="2" rx="1" fill="white" />
  </Svg>
);
export const ListButton: React.FC<ListButtonProps> = (props) => {
  return (
    <TouchableOpacity
      hitSlop={{ top: 4, bottom: 4, right: 4, left: 4 }}
      activeOpacity={0.6}
      style={styles.container.static}
      onPress={props.onPress}
    >
      <View style={styles.icon}>
        {props.type === 'add' ? <PlusIcon /> : <MinusIcon />}
      </View>
    </TouchableOpacity>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    backgroundColor: colors.backgroundContentTint,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
