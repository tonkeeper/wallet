import { Icon } from '$uikit';
import React, { FC, memo } from 'react';
import * as S from './SearchButton.style';
import { t } from '@tonkeeper/shared/i18n';
import { Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface Props {
  onPress?: () => void;
}

const SearchButtonComponent: FC<Props> = (props) => {
  const { onPress } = props;

  const containerStyle = Steezy.useStyle(styles.container);

  return (
    <TouchableWithoutFeedback style={containerStyle} onPress={onPress}>
      <View style={styles.wrap}>
        <Icon name="ic-magnifying-glass-16" />
        <Spacer x={12} />
        <Text color="textSecondary">{t('browser.search_label')}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export const SearchButton = memo(SearchButtonComponent);

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    backgroundColor: colors.backgroundContentAlternate,
    borderRadius: corners.medium,
  },
  wrap: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
}));
