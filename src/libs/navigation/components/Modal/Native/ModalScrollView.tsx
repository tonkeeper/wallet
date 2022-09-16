import * as React from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalScrollViewProps {

}

export const ModalScrollView: React.FC<ModalScrollViewProps> = (props) => {
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