import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TestCube {

}

export const TestCube: React.FC<TestCube> = (props) => {
  return (
    <View style={styles.container} />
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    backgroundColor: '#FFF'
  }
});