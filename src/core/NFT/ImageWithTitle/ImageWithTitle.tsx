import React, { useMemo } from 'react';
import * as S from './ImageWithTitle.style';
import { ImageWithTitleProps } from '$core/NFT/ImageWithTitle/ImageWithTitle.interface';
import { Badge, Icon, ShowMore, Text } from '$uikit';
import { useTheme, useTranslator } from '$hooks';
import { isIOS, ns } from '$utils';

export const ImageWithTitle: React.FC<ImageWithTitleProps> = ({
  uri,
  lottieUri,
  videoUri,
  title,
  collection,
  isVerified,
  description,
  isOnSale,
  bottom,
}) => {
  const theme = useTheme();
  const t = useTranslator();
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
        <S.Lottie
          source={{
            uri: lottieUri,
          }}
          loop={true}
          autoPlay={true}
        />
      );
    }

    if (videoUri) {
      return (
        <S.Video
          source={{ uri: videoUri }}
          poster={uri}
          muted={true}
          repeat={true}
          playWhenInactive={true}
        />
      );
    }

    if (uri) {
      return <S.Image source={{ uri }} />;
    }

    return null;
  }, [lottieUri, uri, videoUri]);

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
          <S.TitleWrap>
            <Text style={{ alignItems: 'center', marginRight: ns(8) }} variant="h2">
              {title}
            </Text>
            {isOnSale ? <Badge>{t('nft_on_sale').toUpperCase()}</Badge> : null}
          </S.TitleWrap>
        ) : null}
        <S.Row>
          <S.CollectionWrapper>
            <Text color="foregroundSecondary" variant="body2">
              {collection || t('nft_single_nft')}
            </Text>
          </S.CollectionWrapper>
          {isVerified && <Icon name="ic-verification-16" colorless />}
        </S.Row>
        {description ? (
          <S.DescriptionWrap>
            <ShowMore maxLines={2} text={description} />
          </S.DescriptionWrap>
        ) : null}
        {bottom}
      </S.TextWrap>
    </S.Wrap>
  );
};
