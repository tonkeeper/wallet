import { useInstance } from '$hooks/useInstance';
import { useCopyText } from '$hooks/useCopyText';
import { t } from '@tonkeeper/shared/i18n';
import { Highlight, Separator, Skeleton, Text } from '$uikit';
import { Base64, truncateDecimal } from '$utils';
import { debugLog } from '$utils/debugLog';
import React, { useEffect } from 'react';
import { ActionFooter, useActionFooter } from './NFTOperations/NFTOperationFooter';
import * as S from './NFTOperations/NFTOperations.styles';
import BigNumber from 'bignumber.js';
import { Ton } from '$libs/Ton';
import { TouchableOpacity } from 'react-native';

import { store, Toast } from '$store';
import { Wallet } from 'blockchain';
import { Modal } from '@tonkeeper/uikit';
import { push } from '$navigation/imperative';
import { SheetActions } from '@tonkeeper/router';
import { openReplaceDomainAddress } from './NFTOperations/ReplaceDomainAddressModal';
import { Address, TransactionService } from '@tonkeeper/core';
import { tk } from '$wallet';
import { getWalletSeqno } from '@tonkeeper/shared/utils/wallet';

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
      const boc = await this.createBoc(true);
      const feeInfo = await tk.wallet.tonapi.wallet.emulateMessageToWallet({ boc });
      const feeNano = new BigNumber(feeInfo.event.extra).multipliedBy(-1);

      return truncateDecimal(Ton.fromNano(feeNano.toString()), 1);
    } catch (err) {
      debugLog(err);
      return '0';
    }
  }

  public updateWalletAddress(address: string | undefined) {
    this.walletAddress = address;
  }

  /**
   * Creates boc with DNS-record
   */
  public async createBoc(isEstimate?: boolean) {
    const address = this.walletAddress && new TonWeb.Address(this.walletAddress);

    const payload = await TonWeb.dns.DnsItem.createChangeContentEntryBody({
      category: TonWeb.dns.DNS_CATEGORY_WALLET,
      value: address ? TonWeb.dns.createSmartContractAddressRecord(address) : null,
    });

    const payloadBoc = Base64.encodeBytes(await payload.toBoc(false));

    const signer = await tk.wallet.signer.getSigner(isEstimate);

    const boc = await TransactionService.createTransfer(tk.wallet.contract, signer, {
      messages: TransactionService.parseSignRawMessages([
        {
          address: this.domainAddress,
          amount: this.transferAmount,
          payload: payloadBoc,
        },
      ]),
      sendMode: 3,
      seqno: await getWalletSeqno(tk.wallet),
    });

    return boc;
  }
}

export const LinkingDomainModal: React.FC<LinkingDomainModalProps> = ({
  walletAddress: defaultWalletAddress,
  domainAddress,
  domain,
  fee: initialFee,
  onDone,
}) => {
  const [walletAddress, setWalletAddress] = React.useState(defaultWalletAddress);
  const [fee] = React.useState(initialFee);
  const copyText = useCopyText();
  const [isDisabled, setIsDisabled] = React.useState(false);

  const { footerRef, onConfirm } = useActionFooter();

  const linkingActions = useInstance(() => {
    return new LinkingDomainActions(domainAddress, walletAddress);
  });

  useEffect(() => {
    linkingActions.updateWalletAddress(walletAddress);
  }, [walletAddress]);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    startLoading();
    setIsDisabled(true);

    const boc = await linkingActions.createBoc();
    await tk.wallet.tonapi.blockchain.sendBlockchainMessage({ boc }, { format: 'text' });
  });

  const handleReplace = React.useCallback(() => {
    openReplaceDomainAddress({
      domain,
      onReplace: (address) => {
        setWalletAddress(address);
      },
    });
  }, []);

  return (
    <Modal>
      <Modal.Header title={walletAddress ? t('dns_link_title') : t('dns_unlink_title')} />
      <Modal.Content safeArea>
        <S.Container>
          <S.Info>
            {!!walletAddress && (
              <>
                <S.InfoItem>
                  <S.InfoItemLabel>
                    {walletAddress === defaultWalletAddress
                      ? t('dns_current_address')
                      : t('dns_wallet_address')}
                  </S.InfoItemLabel>
                  <S.InfoItemValue>
                    <TouchableOpacity
                      disabled={isDisabled}
                      style={{ alignItems: 'flex-end' }}
                      onPress={handleReplace}
                      activeOpacity={0.6}
                    >
                      <Text variant="body1">{Address.toShort(walletAddress)}</Text>
                      <Text
                        variant="body2"
                        color={isDisabled ? 'foregroundTertiary' : 'accentPrimary'}
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
                  {fee ? (
                    <Text variant="body1">≈ {fee} TON</Text>
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
          responseOptions={
            {
              onDone: () => {
                if (onDone) {
                  onDone({ walletAddress: walletAddress });
                }

                const toastText = walletAddress
                  ? t('dns_address_linked')
                  : t('dns_address_unlinked');
                Toast.success(toastText);
              },
            } as any
          }
        />
      </Modal.Content>
    </Modal>
  );
};

export function openLinkingDomain(params: {
  walletAddress?: string;
  domainAddress: string;
  domain: string;
  fee?: string;
  onDone?: (options: { walletAddress?: string }) => void;
}) {
  push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: LinkingDomainModal,
    params,
    path: 'LINKING_DOMAIN',
  });
}
