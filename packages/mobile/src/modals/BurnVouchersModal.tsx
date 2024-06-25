import {
  Button,
  Icon,
  List,
  Modal,
  Spacer,
  Steezy,
  Text,
  Toast,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';
import { memo, useCallback, useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { HideableImage } from '$core/HideableAmount/HideableImage';
import { formatter } from '@tonkeeper/shared/formatter';
import { useNftsState } from '@tonkeeper/shared/hooks';
import { ContractService, OpCodes } from '@tonkeeper/core';
import { config } from '$config';
import { Linking } from 'react-native';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';
import { tk } from '$wallet';
import { Ton } from '$libs/Ton';
import { BatterySupportedTransaction } from '$wallet/managers/BatteryManager';
import { Address, beginCell, toNano } from '@ton/core';
import { checkBurnDate, getNotcoinBurnAddress } from '$utils/notcoin';

interface BurnVouchersModalProps {
  max?: boolean;
}

export const BurnVouchersModal = memo<BurnVouchersModalProps>((props) => {
  const { max = false } = props;

  const nfts = useNftsState((s) =>
    Object.values(s.accountNfts).filter(
      (nft) =>
        !nft.sale &&
        nft.collection &&
        Address.parse(nft.collection.address).equals(
          Address.parse(config.get('notcoin_nft_collection')),
        ),
    ),
  );

  const maxCount = nfts.length > 4 ? 4 : nfts.length;

  const [count, setCount] = useState(max ? maxCount : 1);

  const selectedNfts = useMemo(() => nfts.slice(0, count), [count, nfts]);

  const totalValue = selectedNfts
    .reduce(
      (acc, nft) =>
        acc + parseInt(nft.metadata?.attributes?.[0]?.value?.replace(',', '') ?? '0', 10),
      0,
    )
    .toString();

  const handleContinue = useCallback(async () => {
    try {
      const valid_until = getTimeSec() + 10 * 60;

      const isAvailable = await checkBurnDate();

      if (!isAvailable) {
        return;
      }

      openSignRawModal(
        {
          source: tk.wallet.address.ton.raw,
          valid_until,
          messages: selectedNfts.map((nft) => ({
            address: nft.address,
            amount: Ton.toNano('0.1'),
            payload: beginCell()
              .storeUint(OpCodes.NFT_TRANSFER, 32)
              .storeUint(ContractService.getWalletQueryId(), 64)
              .storeAddress(getNotcoinBurnAddress(nft.address))
              .storeAddress(Address.parse(tk.wallet.address.ton.raw))
              .storeBit(false)
              .storeCoins(toNano('0.05'))
              .storeBit(false)
              .storeUint(0x5fec6642, 32)
              .storeUint(nft.index, 64)
              .endCell()
              .toBoc()
              .toString('base64'),
          })),
        },
        {
          experimentalWithBattery:
            tk.wallet.battery.state.data.supportedTransactions[
              BatterySupportedTransaction.NFT
            ],
          expires_sec: valid_until,
          response_options: {
            broadcast: false,
          },
        },
      );
    } catch (e) {
      if (e.message) {
        Toast.fail(e.message);
      }
    }
  }, [selectedNfts]);

  const openTonkeeperPro = useCallback(() => {
    Linking.openURL(config.get('tonkeeper_pro_url')).catch(null);
  }, []);

  const imageUrl = (nfts[0].previews &&
    nfts[0].previews.find((preview) => preview.resolution === '500x500')!.url)!;

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <HideableImage uri={imageUrl} style={styles.image.static} />
          </View>
          <Spacer y={20} />
          <Text type="h2" textAlign="center">
            {t('notcoin.exchange_title')}
          </Text>
          <Spacer y={4} />
          <Text
            style={styles.desk.static}
            type="body1"
            color="textSecondary"
            textAlign="center"
          >
            {t('notcoin.exchange_subtitle')}
          </Text>
          <Spacer y={32} />
          <List indent={false}>
            <List.Item
              titleType="secondary"
              title={t('notcoin.count')}
              subtitle={t('notcoin.count_max')}
              rightContent={
                <View style={styles.counterContainer}>
                  <TouchableOpacity
                    disabled={count === 1}
                    style={[
                      styles.counterButton,
                      count === 1 && styles.counterButtonDisabled,
                    ]}
                    onPress={() => setCount((s) => (s > 1 ? s - 1 : s))}
                  >
                    <Icon name="ic-minus-16" color="buttonSecondaryForeground" />
                  </TouchableOpacity>
                  <View style={styles.counterText}>
                    <Text type="label1">{count}</Text>
                  </View>
                  <TouchableOpacity
                    disabled={count === maxCount}
                    style={[
                      styles.counterButton,
                      count === maxCount && styles.counterButtonDisabled,
                    ]}
                    onPress={() => setCount((s) => (s < 4 ? s + 1 : s))}
                  >
                    <Icon name="ic-plus-16" color="buttonSecondaryForeground" />
                  </TouchableOpacity>
                </View>
              }
            />
            <List.Item
              titleType="secondary"
              title={t('notcoin.total_amount')}
              value={formatter.format(totalValue, {
                withoutTruncate: true,
                currency: 'NOT',
              })}
            />
          </List>
          <Spacer y={16} />
          <Button title={t('continue')} onPress={handleContinue} />
          <Spacer y={16} />
          <Button title={t('notcoin.all')} color="secondary" onPress={openTonkeeperPro} />
          <Spacer y={16} />
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ corners, colors }) => ({
  container: {
    marginHorizontal: 16,
    marginTop: 48,
  },
  desk: {
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: 96,
    height: 96,
    borderRadius: corners.large,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    flex: 1,
  },
  counterContainer: {
    width: 112,
    height: 36,
    backgroundColor: colors.backgroundContentTint,
    borderRadius: corners.extraSmall,
    flexDirection: 'row',
  },
  counterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    opacity: 0.4,
  },
  counterText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
