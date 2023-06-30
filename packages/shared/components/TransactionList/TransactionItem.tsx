import React, { memo } from 'react';
import { Icon, IconNames, List, Steezy, View, useTheme } from '@tonkeeper/uikit';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ListSeparator } from '@tonkeeper/uikit/src/components/List/ListSeparator';

interface TransactionItemProps {
  item: any;
}

export const TransactionItem = memo<TransactionItemProps>((props) => {
  const { item } = props;

  const containerStyle = [
    item.bottomCorner && styles.bottomCorner,
    item.topCorner && styles.topCorner,
    styles.containerListItem,
  ];

  return (
    <View style={containerStyle}>
      <List.Item
        onPress={() => {}}
        title={item.title}
        subtitle={item.subtitle}
        value={item.value}
        valueStyle={item.isReceive && styles.receiveValue}
        subvalue={item.subvalue}
        leftContent={(isPressed) => (
          <LeftIcon iconName={item.iconName} isPressed={isPressed} />
        )}
      />
      {!item.bottomCorner && <ListSeparator />}
    </View>
  );
});


const LeftIcon = (props: {
  isPressed: Animated.SharedValue<boolean>;
  iconName: IconNames;
}) => {
  const theme = useTheme();

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: props.isPressed.value
      ? theme.backgroundHighlighted
      : theme.backgroundContentTint,
  }));

  return (
    <Animated.View style={[styles.icon.static, backgroundStyle]}>
      {props.iconName && <Icon name={props.iconName} color="iconSecondary" />}
    </Animated.View>
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
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
  topCorner: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  bottomCorner: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
    marginBottom: 8,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },
}));
