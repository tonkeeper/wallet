import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalHeaderProps {

}

export const ModalHeader: React.FC<ModalHeaderProps> = (props) => {
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