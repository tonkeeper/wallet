import React, { useCallback, useMemo } from 'react';
import * as S from './ImageWithTitle.style';
import { ImageWithTitleProps } from '$core/NFT/ImageWithTitle/ImageWithTitle.interface';
import { Badge, Separator, ShowMore, Spacer, Text, View } from '$uikit';
import { t } from '@tonkeeper/shared/i18n';
import { isIOS, ns } from '$utils';
import Clipboard from '@react-native-community/clipboard';
import { Toast } from '$store';
import { HideableImage } from '$core/HideableAmount/HideableImage';
import { Steezy } from '$styles';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { Icon } from '@tonkeeper/uikit';

export const ImageWithTitle: React.FC<ImageWithTitleProps> = ({
  uri,
  lottieUri,
  videoUri,
  title,
  collection,
  collectionDescription,
  isVerified,
  description,
  isOnSale,
  bottom,
  copyableTitle,
}) => {
  const [mediaHeight, setMediaHeight] = React.useState(358);

  const handleMediaLayout = React.useCallback(
    (event) => {
      setMediaHeight(event.nativeEvent.layout.width);
    },
    [setMediaHeight],
  );

  const media = useMemo(() => {
    // TODO: remove that workaround then lottie on ios is fixed
    if (lottieUri && !isIOS) {
      return (
        <HideableImage
          style={styles.image.static}
          image={
            <S.Lottie
              style={styles.image.static}
              source={{ uri: lottieUri }}
              loop={true}
              autoPlay={true}
            />
          }
        />
      );
    }

    if (videoUri) {
      return (
        <HideableImage
          style={styles.image.static}
          image={
            <S.Video
              source={{ uri: videoUri }}
              poster={uri}
              muted={true}
              repeat={true}
              playWhenInactive={true}
            />
          }
        />
      );
    }

    if (uri) {
      return <HideableImage style={styles.image.static} uri={uri} />;
    }

    return null;
  }, [lottieUri, uri, videoUri]);

  const handleCopyTitle = useCallback(() => {
    Clipboard.setString(title ?? '');
    Toast.success(t('copied'));
  }, [t, title]);

  return (
    <S.Wrap>
      <S.Background />
      {media ? (
        <S.MediaContainer height={mediaHeight} onLayout={handleMediaLayout}>
          {media}
        </S.MediaContainer>
      ) : null}
      <S.TextWrap>
        {title ? (
          <S.TitleWrap disabled={!copyableTitle} onPress={handleCopyTitle}>
            <HideableAmount
              stars="* * * *"
              style={{ alignItems: 'center', marginRight: ns(8) }}
              variant="h2"
            >
              {title}
            </HideableAmount>
            {isOnSale ? <Badge>{t('nft_on_sale').toUpperCase()}</Badge> : null}
          </S.TitleWrap>
        ) : null}
        <S.Row>
          <S.CollectionWrapper>
            <HideableAmount color="foregroundSecondary" variant="body2">
              {collection == null
                ? t('nft_single_nft')
                : collection || t('nft_unnamed_collection')}
            </HideableAmount>
          </S.CollectionWrapper>
          {isVerified && <Icon name="ic-verification-16" color="accentBlue" />}
        </S.Row>
        {description ? (
          <S.DescriptionWrap>
            <ShowMore maxLines={2} text={description} />
          </S.DescriptionWrap>
        ) : null}
        {collectionDescription ? (
          <>
            <View style={styles.separatorContainer}>
              <Separator leftOffset={0} />
            </View>
            <Text variant="label1">{t('nft_about_collection')}</Text>
            <Spacer y={8} />
            <ShowMore maxLines={2} text={collectionDescription} />
          </>
        ) : null}
        {bottom}
      </S.TextWrap>
    </S.Wrap>
  );
};

const styles = Steezy.create({
  image: {
    flex: 1,
  },
  separatorContainer: {
    marginHorizontal: -16,
    marginVertical: 14,
  },
});
