import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalContentProps {

}

export const ModalContent: React.FC<ModalContentProps> = (props) => {
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