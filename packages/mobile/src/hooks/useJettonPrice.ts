import { Ton } from '$libs/Ton';
import { fiatCurrencySelector } from '$store/main';
import { JettonBalanceModel } from '$store/models';
import { ratesRatesSelector } from '$store/rates';
import { formatFiatCurrencyAmount } from '$utils/currency';
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getRate } from './useFiatRate';

export function useJettonPrice(address: JettonBalanceModel['jettonAddress'], balance: string) {
    const rates = useSelector(ratesRatesSelector);
    const fiatCurrency = useSelector(fiatCurrencySelector);

    return useMemo(() => {
        const rate = getRate(rates, Ton.formatAddress(address, { bounce: true, cut: false }), fiatCurrency, false);
        if (!rate) {
            return { price: null, total: null };
        }
        console.log(balance);
        const balanceInFiat = new BigNumber(balance).multipliedBy(rate).toFixed(2).toString();
        // TODO: return from backend raw jetton addresses
        return { 
            price: formatFiatCurrencyAmount(rate.toFixed(2), fiatCurrency), 
            total: formatFiatCurrencyAmount(balanceInFiat, fiatCurrency),
        };
    }, [rates, fiatCurrency, balance]);
}
