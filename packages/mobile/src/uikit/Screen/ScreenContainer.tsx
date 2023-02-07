import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ScreenContainerProps {

}

export const ScreenContainer: React.FC<ScreenContainerProps> = (props) => {
  return (
    <View style={styles.container}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
