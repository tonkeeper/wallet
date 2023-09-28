import { SharedValue } from 'react-native-reanimated';
import { createContext, useContext } from 'react';

export const ListItemPressedContext = createContext<SharedValue<number> | null>(null);

export const usePressedItem = () => {
  const Highlight = useContext(ListItemPressedContext);

  if (Highlight === null) {
    throw new Error(`You can't use highlighting outside of list item content`);
  }

  return Highlight;
};
