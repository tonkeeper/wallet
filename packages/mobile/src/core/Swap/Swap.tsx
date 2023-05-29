import React, { FC, useCallback, useMemo, useState } from 'react';
import { StonfiInjectedObject } from './types';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';
import { useSelector } from 'react-redux';
import { walletAddressSelector } from '$store/wallet';
import { useNavigation, useWebViewBridge } from '$hooks';
import * as S from './Swap.style';
import { Icon } from '$uikit';
import { getServerConfig } from '$shared/constants';
import { getDomainFromURL } from '$utils';

interface Props {
  jettonAddress?: string;
}

export const Swap: FC<Props> = (props) => {
  const { jettonAddress } = props;

  const baseUrl = getServerConfig('stonfiUrl');

  const url = useMemo(() => {
    const ft = jettonAddress ?? 'TON';
    const tt = jettonAddress ? 'TON' : null;

    let path = `${baseUrl}?ft=${ft}`;

    if (tt) {
      path += `&tt=${tt}`;
    }

    return path;
  }, [baseUrl, jettonAddress]);

  const address = useSelector(walletAddressSelector);

  const nav = useNavigation();

  const bridgeObject = useMemo(
    (): StonfiInjectedObject => ({
      address: address.ton,
      close: () => nav.goBack(),
      sendTransaction: (request) =>
        new Promise((resolve, reject) => {
          const { valid_until } = request;

          if (valid_until < getTimeSec()) {
            reject();
          }

          openSignRawModal(
            request,
            {
              expires_sec: valid_until,
              response_options: {
                broadcast: false,
              },
            },
            resolve,
            reject,
          );
        }),
    }),
    [address.ton, nav],
  );

  const [ref, injectedJavaScriptBeforeContentLoaded, onMessage] =
    useWebViewBridge<StonfiInjectedObject>(bridgeObject, 'tonkeeperStonfi');

  const [overlayVisible, setOverlayVisible] = useState(true);

  const handleLoadEnd = useCallback(() => {
    setTimeout(() => setOverlayVisible(false), 300);
  }, []);

  return (
    <S.Container>
      <S.Browser
        ref={ref}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        source={{
          uri: url,
        }}
        onLoadEnd={handleLoadEnd}
        startInLoadingState={true}
        originWhitelist={[`https://${getDomainFromURL(baseUrl)}`]}
        decelerationRate="normal"
        javaScriptCanOpenWindowsAutomatically
        mixedContentMode="always"
        hideKeyboardAccessoryView
        thirdPartyCookiesEnabled={true}
        keyboardDisplayRequiresUserAction={false}
        mediaPlaybackRequiresUserAction={false}
      />
      {overlayVisible ? (
        <S.Overlay>
          <S.BackButtonContainer onPress={nav.goBack}>
            <S.BackButton>
              <Icon name="ic-close-16" color="foregroundPrimary" />
            </S.BackButton>
          </S.BackButtonContainer>
        </S.Overlay>
      ) : null}
    </S.Container>
  );
};
