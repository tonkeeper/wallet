import { FastImage, StyleProp, ViewStyle } from '@tonkeeper/uikit';
import { memo } from 'react';

const iconSource = require('./notcoin-bot.png');

interface Props {
  style: StyleProp<ViewStyle>;
}

export const NotcoinBotIcon = memo((props: Props) => {
  const { style } = props;

  return <FastImage source={iconSource} style={style} />;
});
