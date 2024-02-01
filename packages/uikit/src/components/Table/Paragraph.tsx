import React, { memo, ReactNode } from 'react';
import { Steezy } from '../../styles';
import { View } from '../View';
import { Text } from '../Text';

export interface ParagraphProps {
  /*
    Paragraph's text
   */
  children: ReactNode;
}

export const Paragraph = memo<ParagraphProps>((props) => {
  return (
    <View style={styles.paragraphContainer}>
      <View style={styles.dot} />
      {typeof props.children === 'string' ? (
        <Text style={styles.text.static} type="body2">
          {props.children}
        </Text>
      ) : (
        props.children
      )}
    </View>
  );
});

const styles = Steezy.create(({ colors }) => ({
  paragraphContainer: {
    paddingVertical: 8,
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 16,
  },
  dot: {
    backgroundColor: colors.textPrimary,
    width: 2.8,
    height: 2.8,
    borderRadius: 2.8 / 2,
    marginTop: 9.8,
    marginRight: 9.5,
    marginLeft: 9,
  },
  text: {
    flex: 1,
  },
}));
