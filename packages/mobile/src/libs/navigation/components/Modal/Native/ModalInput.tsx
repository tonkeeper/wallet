import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalInputProps {

}

export const ModalInput: React.FC<ModalInputProps> = (props) => {
  return (
    <View style={styles.container}>
      {props.children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  }
});