import { useCopyText, useInstance } from '$hooks';
import { t } from '$translation';
import { BottomSheet, Highlight, Separator, Skeleton, Text } from '$uikit';
import { BottomSheetRef } from '$uikit/BottomSheet/BottomSheet.interface';
import { Base64, debugLog, maskifyAddress, truncateDecimal } from '$utils';
import React from 'react';
import { ActionFooter, useActionFooter } from './NFTOperations/NFTOperationFooter';
import { useUnlockVault } from './NFTOperations/useUnlockVault';
import * as S from './NFTOperations/NFTOperations.styles';
import BigNumber from 'bignumber.js';
import { Ton } from '$libs/Ton';
import { TouchableOpacity } from 'react-native';
import { openReplaceDomainAddress } from '$navigation';
import { store, Toast } from '$store';
import { Wallet } from 'blockchain';
import { Tonapi } from '$libs/Tonapi';

const TonWeb = require('tonweb');

interface LinkingDomainModalProps {
  onDone?: (options: { walletAddress?: string }) => void;
  domainAddress: string;
  walletAddress?: string;
  domain: string;
  fee: string;
}

export class LinkingDomainActions {
  /**
   * Wallet instance
   */
  private wallet: Wallet;
  /**
   * Transfer amount in nanocoins. Will be attached to transfer
   */
  public transferAmount: string = Ton.toNano('0.05').toString();
  /**
   * Domain address in any valid format
   */
  public domainAddress: string;
  /**
   * Wallet address to link domain. If not set - domain will be unlinked
   */
  public walletAddress: string | undefined;

  constructor(domainAddress: string, walletAddress?: string) {
    this.wallet = store.getState().wallet.wallet;
    this.domainAddress = domainAddress;
    this.walletAddress = walletAddress;
  }

  /**
   * Calculates fee. Returns human-readable string or 0 in case of error
   */
  public async calculateFee() {
    try {
      const boc = await this.createBoc();
      const estimatedFee = await Tonapi.estimateTx(boc);
      const feeNano = new BigNumber(estimatedFee.fee.total.toString());

      return truncateDecimal(Ton.fromNano(feeNano.toString()), 1);
    } catch (err) {
      debugLog(err);
      return '0';
    }
  }

  /**
   * Creates boc with DNS-record
   */
  public async createBoc(secretKey?: Uint8Array) {
    const curWallet = this.wallet.vault.tonWallet;
    const seqno = await this.wallet.ton.getSeqno(await this.wallet.ton.getAddress());

    const address = this.walletAddress && new TonWeb.Address(this.walletAddress);

    const payload = await TonWeb.dns.DnsItem.createChangeContentEntryBody({
      category: TonWeb.dns.DNS_CATEGORY_WALLET, 
      value: address ? TonWeb.dns.createSmartContractAddressRecord(address) : null
    });

    const tx = curWallet.methods.transfer({
      toAddress: this.domainAddress,
      amount: this.transferAmount,
      seqno: seqno,
      payload, 
      sendMode: 3,
      secretKey
    });

    const queryMsg = await tx.getQuery();
    const boc = Base64.encodeBytes(await queryMsg.toBoc(false));

    return boc;
  }
}

export const LinkingDomainModal: React.FC<LinkingDomainModalProps> = ({ 
  walletAddress: defaultWalletAddress,
  domainAddress, 
  domain,
  fee: initialFee,
  onDone 
}) => {
  const [walletAddress, setWalletAddress] = React.useState(defaultWalletAddress);
  const bottomSheetRef = React.useRef<BottomSheetRef>(null);
  const [fee] = React.useState(initialFee);
  const copyText = useCopyText();  

  const { footerRef, onConfirm } = useActionFooter();

  const linkingActions = useInstance(() => {
    return new LinkingDomainActions(domainAddress, walletAddress);
  });

  const unlockVault = useUnlockVault();
  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();
    
    startLoading();
    
    const boc = await linkingActions.createBoc(privateKey);
    await Tonapi.sendBoc(boc);
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
                    style={{ alignItems: 'flex-end' }}
                    onPress={handleReplace}
                    activeOpacity={0.6}
                  >
                    <Text variant="body1">              
                      {maskifyAddress(walletAddress)}
                    </Text>
                    <Text 
                      variant="body2"
                      color="accentPrimary"
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
