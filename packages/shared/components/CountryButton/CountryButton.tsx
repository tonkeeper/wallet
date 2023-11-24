import { Button, View, isAndroid, ns } from '@tonkeeper/uikit';
import { ButtonProps } from '@tonkeeper/uikit/src/components/Button';
import { FC, memo } from 'react';
import { Text as RNText } from 'react-native';

const getSelectedCountryStyle = (selectedCountry: string) => {
  if (selectedCountry === '*') {
    return {
      icon: (
        <View
          style={{
            marginTop: isAndroid ? ns(-1) : ns(1),
            marginLeft: isAndroid ? 0 : ns(2),
          }}
        >
          <RNText style={{ fontSize: ns(16) }}>🌍</RNText>
        </View>
      ),
      type: 'emoji',
    };
  }
  if (selectedCountry === 'NOKYC') {
    return {
      icon: (
        <View
          style={{
            marginTop: isAndroid ? ns(-1) : ns(0.5),
            marginLeft: isAndroid ? ns(-1) : ns(1),
          }}
        >
          <RNText style={{ fontSize: ns(14) }}>☠️</RNText>
        </View>
      ),
      type: 'emoji',
    };
  }

  return { title: selectedCountry, type: 'text' };
};

interface CountryButtonProps extends ButtonProps {
  selectedCountry: string;
  onPress: () => void;
}

const CountryButtonComponent: FC<CountryButtonProps> = ({
  selectedCountry,
  onPress,
  ...restProps
}) => {
  const selectedCountryStyle = getSelectedCountryStyle(selectedCountry);

  return (
    <Button
      size={selectedCountryStyle.type === 'emoji' ? 'icon' : 'header'}
      color="secondary"
      title={selectedCountryStyle.title}
      icon={selectedCountryStyle.icon}
      onPress={onPress}
      {...restProps}
    />
  );
};

export const CountryButton = memo(CountryButtonComponent);
