import { JettonBalanceModel, JettonMetadata } from '$store/models';
import { useEffect, useState } from 'react';
import TonWeb from 'tonweb';
import { useDispatch, useSelector } from 'react-redux';
import { jettonsActions, jettonsSelector } from '$store/jettons';
import { walletSelector } from '$store/wallet';

export function useJettonByWalletAddress(
  walletAddress?: JettonBalanceModel['walletAddress'],
) {
  const { jettons } = useSelector(jettonsSelector);
  const [data, setData] = useState<{
    isLoading: boolean;
    isFetching: boolean;
    jetton?: JettonMetadata;
    jettonAddress?: string;
  }>({
    isLoading: !!walletAddress,
    isFetching: false,
  });
  const { wallet } = useSelector(walletSelector);
  const { jettonBalances } = useSelector(jettonsSelector);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchJettonData() {
      if (!wallet) return;
      const jetton = jettonBalances.find(
        (balance) => balance.walletAddress === walletAddress,
      );

      if (jetton) {
        setData({
          ...data,
          isLoading: false,
          isFetching: false,
          jettonAddress: jetton.jettonAddress,
          jetton: jetton.metadata,
        });
        return;
      }
      const jettonWallet = new TonWeb.token.ft.JettonWallet(
        wallet.vault.tonWallet.provider,
        {
          address: walletAddress,
        },
      );
      const loadedData = await jettonWallet.getData();
      const jettonAddress = loadedData.jettonMinterAddress.toString(true, true, true);
      setData({ ...data, jettonAddress });
    }
    if (walletAddress && wallet) {
      fetchJettonData();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (data.jettonAddress && !data.jetton && jettons[data.jettonAddress]) {
      setData({
        ...data,
        isLoading: false,
        isFetching: false,
        jetton: jettons[data.jettonAddress],
      });
    } else if (!data.isFetching && data.jettonAddress && data.isLoading && !data.jetton) {
      setData({ ...data, isFetching: true });
      dispatch(jettonsActions.loadJettonMeta(data.jettonAddress));
    }
  }, [dispatch, data, jettons]);

  return data;
}
