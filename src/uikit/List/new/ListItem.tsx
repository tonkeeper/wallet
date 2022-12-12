import React, { memo } from 'react';
import { Steezy } from '$styles';
import { TouchableHighlight, View, SText } from '$uikit';
import { DarkTheme } from '$styled';

interface ListItemProps {
  title?: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  subvalue?: string | React.ReactNode;
  
  leftContent?: () => React.ReactNode;
  rightContent?: () => React.ReactNode;

  onPress?: () => void;
}

export const ListItem = memo<ListItemProps>((props) => {
  return (
    <TouchableHighlight 
      onPress={props.onPress}
      underlayColor={DarkTheme.colors.backgroundTertiary}
    >
      <View style={styles.container}>
        <View style={styles.title}>
          {typeof props.title === 'string' ? (
            <SText variant="label1">
              {props.title}
            </SText>
          ) : props.title}

          {typeof props.subtitle === 'string' ? (
            <SText variant="body2" style={styles.subtitleText}>
              {props.subtitle}
            </SText>
          ) : props.subtitle}
        </View>
        <View>
          {typeof props.value === 'string' ? (
            <SText variant="label1" style={styles.valueText}>
              {props.value}
            </SText>
          ) : props.value}

          {typeof props.subvalue === 'string' ? (
            <SText variant="body2" style={styles.subtitleText}>
              {props.subvalue}
            </SText>
          ) : props.subvalue}
        </View>
      </View>
    </TouchableHighlight>
  );
});

const styles = Steezy.create(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  title: {
    flex: 1
  },
  valueText: {
    textAlign: 'right',
  },
  subtitleText: {
    color: colors.textSecondary
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  }
}));