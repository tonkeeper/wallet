import { useTheme } from '$hooks';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalContainerProps {

}

export const ModalContainer: React.FC<ModalContainerProps> = (props) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});