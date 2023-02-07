import React from 'react';
import { StyleSheet } from 'react-native';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { Screen, Text } from '$uikit';
import { textVariants, TTextVariants } from '$uikit/Text/Text.variants';

export const DevText: React.FC = () => {
  return (
    <Screen>
      <Screen.Header title="Typography" rightContent={<AttachScreenButton />} />
      {Object.keys(textVariants).map((variant) => (
        <Text variant={variant as TTextVariants} style={styles.text}>
          {variant} - {textVariants[variant].fontFamily}/{textVariants[variant].fontSize}/
          {textVariants[variant].lineHeight}
        </Text>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  text: {
    marginBottom: 16,
    marginHorizontal: 12,
  },
});
