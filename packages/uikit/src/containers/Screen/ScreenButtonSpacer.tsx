import { ViewStyle } from 'react-native';
import { FC, memo } from 'react';
import { WithStyleProp } from '@bogoslavskiy/react-native-steezy';
import { Steezy } from '../../styles';
import { View } from '../../components/View';

interface Props extends WithStyleProp<ViewStyle> {}

export const ScreenButtonSpacer: FC<Props> = memo(({ style, ...props }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.buttonContainer, style]} {...props}>
        <View style={styles.buttonSpacer} />
      </View>
    </View>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    marginBottom: safeArea.bottom,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
  },
  buttonSpacer: {
    height: 56,
  },
}));
