import React, { memo } from 'react';
import { Steezy } from '$styles';
import { Icon, List } from '$uikit';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '$hooks';
import { IconNames } from '$uikit/Icon/generated.types';

interface TransactionItemProps {
  event: any;
  onPress?: () => void;
}

export const HistoryItem = memo<TransactionItemProps>((props) => {
  const { event, onPress } = props;
  if (typeof event === 'string') {
    return <List.Header title={event} />;
  }

  return (
    <List style={styles.list}>
      {event.actions.map(({ item }, key) => (
        <List.Item
          key={key}
          onPress={onPress}
          title={item.title}
          subtitle={item.subtitle}
          value={item.value}
          valueStyle={item.isReceive && styles.receiveValue}
          subvalue={item.subvalue}
          leftContent={(isPressed) => (
            <LeftIcon iconName={item.iconName} isPressed={isPressed} />
          )}
        />
      ))}
    </List>
  );
});

const LeftIcon = (props: {
  isPressed: Animated.SharedValue<boolean>;
  iconName: IconNames;
}) => {
  const theme = useTheme();

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: props.isPressed.value
      ? theme.colors.backgroundQuaternary
      : theme.colors.backgroundTertiary,
  }));

  return (
    <Animated.View style={[styles.icon.static, backgroundStyle]}>
      {props.iconName && <Icon name={props.iconName} color="foregroundSecondary" />}
    </Animated.View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  list: {
    marginBottom: 8,
  },
  list2: {
    marginBottom: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContentTint,
  },
  receiveValue: {
    color: colors.accentGreen,
  },
}));
