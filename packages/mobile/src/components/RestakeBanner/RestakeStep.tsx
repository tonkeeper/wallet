import React, { memo, ReactNode } from 'react';
import { Icon, Steezy, Text, View } from '@tonkeeper/uikit';
import { StyleProp } from '@bogoslavskiy/react-native-steezy';
import { ViewStyle } from 'react-native';

export interface RestakeStepProps {
  text: string | ReactNode;
  stepId: number;
  actions?: ReactNode[] | null | undefined | boolean;
  actionsContainerStyle?: StyleProp<ViewStyle>;
  completed?: boolean;
}

export const RestakeStep = memo<RestakeStepProps>((props) => {
  return (
    <View style={styles.container}>
      <View style={styles.digitContainer}>
        <Text color="textSecondary" type="body1">
          {props.stepId}.
        </Text>
      </View>
      <View style={styles.flex}>
        <View style={styles.textWithCheckmark}>
          <Text style={styles.flex.static} type="body1" color="textPrimary">
            {props.text}
          </Text>
          {props.completed && (
            <View style={styles.checkmarkContainer}>
              <Icon name={'ic-donemark-28'} color="accentGreen" />
            </View>
          )}
        </View>
        {props.actions && (
          <View style={[styles.actionsContainer, props.actionsContainerStyle]}>
            {props.actions}
          </View>
        )}
      </View>
    </View>
  );
});

const styles = Steezy.create({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
  },
  digitContainer: {
    width: 24,
  },
  flex: {
    flex: 1,
  },
  actionsContainer: {
    gap: 8,
    paddingTop: 12,
    paddingBottom: 8,
  },
  textWithCheckmark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkmarkContainer: {
    paddingLeft: 12,
  },
});
