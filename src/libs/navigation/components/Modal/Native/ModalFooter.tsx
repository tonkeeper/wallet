import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalFooterProps {

}

export const ModalFooter: React.FC<ModalFooterProps> = (props) => {
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