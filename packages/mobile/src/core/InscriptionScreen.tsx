import { useTonInscription } from '@tonkeeper/shared/query/hooks/useTonInscription';
import { useParams } from '@tonkeeper/router/src/imperative';
import {
  Picture,
  Screen,
  Steezy,
  View,
  Text,
  IconButton,
  IconButtonList,
} from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { formatter } from '@tonkeeper/shared/formatter';
import { t } from '@tonkeeper/shared/i18n';

export const InscriptionScreen = memo(() => {
  const params = useParams<{ ticker: string }>();
  const inscription = useTonInscription(params.ticker!);

  const handleSend = useCallback(() => {}, []);
  const handleReceive = useCallback(() => {}, []);

  return (
    <Screen>
      <Screen.Header
        title={
          <View>
            <Text type="h3" textAlign="center" numberOfLines={1}>
              {inscription.ticker}
            </Text>
            <Text type="body2" color="textSecondary" textAlign="center" numberOfLines={1}>
              {inscription.type.toUpperCase()}
            </Text>
          </View>
        }
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
          <Picture
            uri="https://cache.tonapi.io/imgproxy/VHZ7p-sK4L15POAZZtddlRMlfzi08EWMvBibzHWsufM/rs:fill:512:512:1/g:no/aHR0cHM6Ly9jYWNoZS50b25hcGkuaW8vaW1ncHJveHkva21aMl9qV29tamRtcDRJeTdUSzE5QW5FWUVxQVc3WGZ2RFpxOFFDcVV4VS9yczpmaWxsOjIwMDoyMDA6MS9nOm5vL2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDNSdmJtdGxaWEJsY2k5dmNHVnVkRzl1WVhCcEwyMWhjM1JsY2k5d2EyY3ZjbVZtWlhKbGJtTmxjeTl0WldScFlTOTBiMnRsYmw5d2JHRmpaV2h2YkdSbGNpNXdibWMud2VicA.png"
            style={styles.tokenPicture}
          />
        </View>
        <View style={styles.buttons}>
          <IconButtonList>
            <IconButton
              onPress={handleSend}
              iconName="ic-arrow-up-28"
              title={t('wallet.send_btn')}
            />
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
