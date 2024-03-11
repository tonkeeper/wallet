import { useTonInscription } from '@tonkeeper/shared/query/hooks/useTonInscription';
import { useParams } from '@tonkeeper/router/src/imperative';
import {
  DEFAULT_TOKEN_LOGO,
  IconButton,
  IconButtonList,
  Picture,
  Screen,
  Steezy,
  Text,
  View,
} from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { formatter } from '@tonkeeper/shared/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { openSend } from '$navigation';
import { TokenType } from '$core/Send/Send.interface';
import { openReceiveInscriptionModal } from '@tonkeeper/shared/modals/ReceiveInscriptionModal';
import { useWallet } from '@tonkeeper/shared/hooks';

export const InscriptionScreen = memo(() => {
  const params = useParams<{ ticker: string; type: string }>();

  if (!params.ticker || !params.type) {
    throw Error('Wrong parameters');
  }

  const wallet = useWallet();

  const inscription = useTonInscription({ ticker: params.ticker, type: params.type });

  const handleSend = useCallback(() => {
    openSend({
      currency: params.ticker,
      tokenType: TokenType.Inscription,
      currencyAdditionalParams: { type: params.type },
    });
  }, [params.ticker, params.type]);

  const handleReceive = useCallback(() => {
    openReceiveInscriptionModal({ ticker: params.ticker!, type: params.type! });
  }, [params.ticker, params.type]);

  return (
    <Screen>
      <Screen.Header
        subtitle={inscription.type.toUpperCase()}
        title={inscription.ticker}
      />
      <Screen.ScrollView>
        <View style={styles.tokenContainer}>
          <View>
            <Text type="h2">
              {formatter.formatNano(inscription.balance, {
                decimals: inscription.decimals,
                postfix: inscription.ticker,
              })}
            </Text>
            <Text style={styles.tokenText.static} type="body2" color="textSecondary">
              Token
            </Text>
          </View>
          <Picture uri={DEFAULT_TOKEN_LOGO} style={styles.tokenPicture} />
        </View>
        <View style={styles.buttons}>
          <IconButtonList>
            {!wallet.isWatchOnly ? (
              <IconButton
                onPress={handleSend}
                iconName="ic-arrow-up-28"
                title={t('wallet.send_btn')}
              />
            ) : null}
            <IconButton
              onPress={handleReceive}
              iconName="ic-arrow-down-28"
              title={t('wallet.receive_btn')}
            />
          </IconButtonList>
        </View>
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create(({ colors }) => ({
  tokenContainer: {
    paddingTop: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 28,
  },
  tokenPicture: {
    width: 64,
    height: 64,
    borderRadius: 64 / 2,
  },
  buttons: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.backgroundContent,
    borderBottomColor: colors.backgroundContent,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tokenText: {
    paddingTop: 2,
  },
}));
