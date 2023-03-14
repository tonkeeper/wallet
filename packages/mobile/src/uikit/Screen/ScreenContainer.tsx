import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenScrollProvider } from './context/ScreenScrollContext';

export const ScreenContainer = memo((props) => {
  return (
    <ScreenScrollProvider>
      <View style={styles.container}>
        {props.children}
      </View>
    </ScreenScrollProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
