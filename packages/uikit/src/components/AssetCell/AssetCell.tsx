import { CellItemToRender } from '@tonkeeper/mobile/src/tabs/Wallet/content-providers/utils/types';
import { TonIcon } from '../TonIcon';
import { View } from '../View';
import { List } from '../List';
import { Text } from '../Text';
import { HideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmount';
import React from 'react';
import { Steezy } from '../../styles';
import { TextColors } from '../Text/Text';
import { Icon } from '../Icon';
import { TouchableOpacity } from '../TouchableOpacity';

interface ListItemRateProps {
  percent?: string;
  price: string;
  trend: string;
}

const trend2color: { [key: string]: TextColors } = {
  negative: 'accentRed',
  positive: 'accentGreen',
  unknown: 'textSecondary',
};

export const ListItemRate = (props: ListItemRateProps) => (
  <Text
    style={listItemRateStyles.title.static}
    numberOfLines={1}
    color="textSecondary"
    type="body2"
  >
    {props.price}
    <View style={listItemRateStyles.spacing} />
    {!!props.percent && (
      <Text
        style={listItemRateStyles.percentText.static}
        color={trend2color[props.trend]}
        type="body2"
      >
        {props.percent}
      </Text>
    )}
  </Text>
);

export enum AssetCellMode {
  EDITABLE = 'editable',
  VIEW_ONLY = 'view-only',
}

export interface AssetCellProps {
  item: CellItemToRender;
  mode: AssetCellMode;
  drag?: () => void;
}

export const AssetCell = (props: AssetCellProps) => {
  const renderLeftContent = () => {
    if (props.item.renderIcon) {
      return props.item.renderIcon();
    }
  };

  const containerStyle = [
    props.item.isFirst && styles.firstListItem,
    props.item.isLast && styles.lastListItem,
    styles.containerListItem,
  ];

  const renderSubtitle = () => {
    return (
      props.item.subtitle ||
      (props.item.fiatRate && (
        <ListItemRate
          percent={props.item.fiatRate.percent}
          price={props.item.fiatRate.price.formatted}
          trend={props.item.fiatRate.trend}
        />
      ))
    );
  };

  const renderSubvalue = () => {
    switch (props.mode) {
      case AssetCellMode.EDITABLE:
        return null;
      case AssetCellMode.VIEW_ONLY:
        return (
          props.item.fiatRate && (
            <HideableAmount
              style={styles.subvalueText.static}
              type="body2"
              color="textSecondary"
            >
              {props.item.fiatRate.total.formatted}
            </HideableAmount>
          )
        );
    }
  };

  return (
    <View style={containerStyle}>
      <List.Item
        disabled={props.mode === AssetCellMode.EDITABLE}
        leftContent={renderLeftContent()}
        onPress={props.item.onPress}
        title={
          <View style={styles.tokenTitle}>
            <Text style={styles.valueText.static} type="label1">
              {props.item.title}
            </Text>
            {!!props.item.tag && (
              <View style={styles.tag}>
                <Text type="body4" color="textSecondary">
                  {props.item.tag.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        }
        picture={props.item.picture}
        value={
          props.mode === AssetCellMode.EDITABLE ? (
            <TouchableOpacity delayLongPress={50} onLongPress={props.drag}>
              <Icon color="iconSecondary" name={'ic-reorder-28'} />
            </TouchableOpacity>
          ) : typeof props.item.value === 'string' ? (
            <HideableAmount
              style={styles.valueText.static}
              type="label1"
              stars=" * * *"
            >{` ${props.item.value}`}</HideableAmount>
          ) : (
            props.item.value
          )
        }
        subvalue={renderSubvalue()}
        subtitle={renderSubtitle()}
        bottomContent={props.item.renderBottomContent?.()}
        subtitleStyle={props.item.subtitleStyle}
      />
    </View>
  );
};

const styles = Steezy.create(({ colors, corners }) => ({
  firstListItem: {
    borderTopLeftRadius: corners.medium,
    borderTopRightRadius: corners.medium,
  },
  lastListItem: {
    borderBottomLeftRadius: corners.medium,
    borderBottomRightRadius: corners.medium,
  },
  containerListItem: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundContent,
    marginHorizontal: 16,
  },
  valueText: {
    textAlign: 'right',
    flexShrink: 1,
  },
  subvalueText: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  tokenTitle: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: colors.backgroundContentTint,
    alignSelf: 'center',
    paddingHorizontal: 5,
    paddingTop: 2.5,
    paddingBottom: 3.5,
    borderRadius: 4,
    marginLeft: 6,
  },
}));

const listItemRateStyles = Steezy.create({
  spacing: {
    width: 6,
  },
  title: {
    marginRight: 6,
  },
  percentText: {
    opacity: 0.74,
  },
});
