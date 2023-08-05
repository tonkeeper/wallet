import { TouchableOpacity, StyleSheet, Image as RNImage } from 'react-native';
import LottieView from 'lottie-react-native';
import styled from '$styled';
import { Button, Text, ProxyImage } from '$uikit';
import { ns } from '$utils';

export const Container = styled.View`
  padding-horizontal: 16px;
`;

export const Center = styled.View`
  align-items: center;
`;

export const Preview = styled.View`
  width: 96px;
  height: 96px;
  margin-top: 48px;
  margin-bottom: 20px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundSecondary};
`;

export const NFTCollectionPreview = styled(Preview)`
  border-radius: ${96 / 2}px;
`;

export const Image = styled(ProxyImage).attrs({
  resizeMode: 'cover',
})`
  z-index: 2;
  width: 100%;
  height: 100%;
`;

export const LocalImage = styled(RNImage).attrs({
  resizeMode: 'cover',
})`
  z-index: 2;
  width: 100%;
  height: 100%;
`;

export const NFTItemPreview = styled(Preview)`
  border-radius: ${({ theme }) => theme.radius.large}px;
`;

export const Caption = styled(Text).attrs({
  color: 'foregroundSecondary',
  textAlign: 'center',
  variant: 'body1',
})`
  line-height: 24px;
`;

export const Title = styled(Text).attrs({ variant: 'h3' })`
  margin-bottom: 24px;
`;

export const Info = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  overflow: hidden;
  margin-bottom: 16px;
`;

export const InfoItem = styled.View`
  padding: ${ns(16)}px;
  flex-direction: row;
  overflow: hidden;
`;

export const InfoItemLabel = styled(Text).attrs({
  variant: 'body1',
  color: 'foregroundSecondary',
})``;

export const InfoItemValueText = styled(Text).attrs({
  variant: 'body1',
  textAlign: 'right',
})`
  flex: 1;
  margin-left: ${ns(16)}px;
`;

export const InfoItemValue = styled.View`
  flex: 1;
  justify-content: center;
  align-items: flex-end;
  margin-left: ${ns(16)}px;
`;

export const Details = styled(Info)`
  padding-vertical: ${ns(8)}px;
`;

export const DetailItem = styled.View`
  padding: ${ns(8)}px ${ns(16)}px;
`;

export const DetailItemLabel = styled(Text).attrs({
  variant: 'body2',
  color: 'foregroundSecondary',
})``;

export const DetailItemValueText = styled(Text).attrs({
  variant: 'body2',
})``;

export const ToggleDetailsButton = styled(TouchableOpacity)`
  margin-top: 4px;
  margin-bottom: 16px;
`;

export const ToggleDetailsButtonTitle = styled(Text).attrs({
  variant: 'label2',
  color: 'foregroundSecondary',
})``;

export const Footer = styled.View`
  flex-direction: row;
  padding-horizontal: 16px;
  padding-top: 16px;
`;

export const ActionButton = styled(Button)`
  flex: 1;
`;

export const LottieIcon = styled(LottieView)`
  width: ${ns(43)}px;
  height: ${ns(43)}px;

  /* Fix indents check.json lottie */
  margin-top: ${ns(-2)}px;
  margin-bottom: ${ns(-4)}px;
`;

export const styles = StyleSheet.create({
  footer: {
    height: ns(88),
  },
  transitionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  footerButtons: {
    paddingTop: 16,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  center: {
    height: ns(88),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ns(16),
  },
  iconContainer: {
    marginBottom: 4,
  },
});

export const WaringContainer = styled.View`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => ns(theme.radius.normal)}px;
  margin-bottom: ${ns(16)}px;
  flex-direction: row;
`;

export const WarningInfo = styled.View`
  padding-vertical: ${ns(12)}px;
  padding-horizontal: ${ns(16)}px;
  flex: 1;
`;

export const WarningIcon = styled.View`
  padding-top: ${ns(16)}px;
  padding-right: ${ns(16)}px;
`;

export const CaptionWrap = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 6px;
`;
