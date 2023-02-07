import { useCopyText, useInstance, useWallet } from '$hooks';
import { getServerConfig } from '$shared/constants';
import { t } from '$translation';
import { BottomSheet, Highlight, Separator, Skeleton, Text } from '$uikit';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import { Base64, debugLog, maskifyAddress, truncateDecimal } from '$utils';
import React from 'react';
import { Configuration, SendApi } from 'tonapi-sdk-js';
import { ActionFooter, useActionFooter } from './NFTOperations/NFTOperationFooter';
import { useUnlockVault } from './NFTOperations/useUnlockVault';
import * as S from './NFTOperations/NFTOperations.styles';
import BigNumber from 'bignumber.js';
import { Ton } from '$libs/Ton';
import { TouchableOpacity } from 'react-native';
import { openReplaceDomainAddress } from '$navigation';
import { Toast } from '$store';

const TonWeb = require('tonweb');

interface LinkingDomainModalProps {
  onDone?: (options: { walletAddress?: string }) => void;
  domainAddress: string;
  walletAddress?: string;
  domain: string;
}

// TODO: need move all logic to Actions class
export const LinkingDomainModal: React.FC<LinkingDomainModalProps> = ({ 
  walletAddress: defaultWalletAddress,
  domainAddress, 
  domain,
  onDone 
}) => {
  const [walletAddress, setWalletAddress] = React.useState(defaultWalletAddress);
  const bottomSheetRef = React.useRef<BottomSheetRef>(null);
  const [fee, setFee] = React.useState('');
  const [isDisabled, setIsDisabled] = React.useState(false);
  const wallet = useWallet();
  const copyText = useCopyText();  

  const { footerRef, onConfirm } = useActionFooter();

  const sendApi = useInstance(() => {
    const tonApiConfiguration = new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    });
    
    return new SendApi(tonApiConfiguration);
  });

  React.useEffect(() => {
    (async () => {
      try {
        const boc = await createBoc();
        const estimatedFee = await sendApi.estimateTx({ sendBocRequest: { boc } });
        const feeNano = new BigNumber(estimatedFee.fee.total.toString());
  
        setFee(truncateDecimal(Ton.fromNano(feeNano.toString()), 1));
      } catch (err) {
        debugLog(err);
        setFee('0.04');
      }
    })();
  }, []);

  const createBoc = async (secretKey?: Uint8Array) => {
    const curWallet = wallet.vault.tonWallet;
    const seqno = await wallet.ton.getSeqno(await wallet.ton.getAddress());

    const address = walletAddress && new TonWeb.Address(walletAddress);

    const payload = await TonWeb.dns.DnsItem.createChangeContentEntryBody({
      category: TonWeb.dns.DNS_CATEGORY_WALLET, 
      value: address ? TonWeb.dns.createSmartContractAddressRecord(address) : null
    });

    const tx = curWallet.methods.transfer({
      toAddress: domainAddress,
      amount: Ton.toNano('0.05').toString(),
      seqno: seqno,
      payload, 
      sendMode: 3,
      secretKey
    });

    const queryMsg = await tx.getQuery();
    const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

    return boc;
  }

  const unlockVault = useUnlockVault();
  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();
    
    startLoading();
    setIsDisabled(true);
    
    const boc = await createBoc(privateKey);
    await sendApi.sendBoc({ sendBocRequest: { boc } });
  });

  const handleReplace = React.useCallback(() => {
    openReplaceDomainAddress({ 
      domain,
      onReplace: (address) => {
        setWalletAddress(address);
      }
    });
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      indentBottom={false}
      title={walletAddress ? t('dns_link_title') : t('dns_unlink_title')}
    > 
      <S.Container>
        <S.Info>
          {!!walletAddress && (
            <>
              <S.InfoItem>
                <S.InfoItemLabel>
                  {
                    walletAddress === defaultWalletAddress
                      ? t('dns_current_address') 
                      : t('dns_wallet_address')
                  }
                </S.InfoItemLabel>
                <S.InfoItemValue>
                  <TouchableOpacity 
                    disabled={isDisabled}
                    style={{ alignItems: 'flex-end' }}
                    onPress={handleReplace}
                    activeOpacity={0.6}
                  >
                    <Text variant="body1">              
                      {maskifyAddress(walletAddress)}
                    </Text>
                    <Text 
                      variant="body2"
                      color={isDisabled ? "foregroundTertiary" : "accentPrimary"}
                    >
                      {t('dns_replace_button')}
                    </Text>
                  </TouchableOpacity>
                </S.InfoItemValue>
              </S.InfoItem>
              <Separator />
            </>
          )}
          <Highlight onPress={() => copyText(fee)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
              <S.InfoItemValue>                 
                {!!fee ? (
                  <Text variant="body1">
                    ≈ {fee} TON
                  </Text>
                ) : (
                  <Skeleton.Line width={80} />
                )}
              </S.InfoItemValue>
            </S.InfoItem>
          </Highlight>
        </S.Info>
      </S.Container>
      <ActionFooter 
        ref={footerRef} 
        onPressConfirm={handleConfirm}
        responseOptions={{
          onDone: () => {
            if (onDone) {
              onDone({ walletAddress: walletAddress });
            }

            const toastText = walletAddress ? t('dns_address_linked') : t('dns_address_unlinked');
            Toast.success(toastText);
          }
        } as any}
        onCloseModal={() => {
          bottomSheetRef.current?.close();
        }}
      />
    </BottomSheet>
  );
};
