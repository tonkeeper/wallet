import BigNumber from 'bignumber.js';
import { ethers } from 'ethers';
import { WalletContext } from './Wallet';
import { AmountFormatter } from './utils/AmountFormatter';
import { hashRequest, tonPKToTronPK } from './utils/tronUtils';
import { EstimatePayload, RequestData } from './TronAPI/TronAPIGenerated';

export class TronService {
  constructor(private ctx: WalletContext) {}

  public async estimate(params: {
    to: string;
    amount: string;
    tokenAddress: string;
  }): Promise<EstimatePayload> {
    return await this.estimatePayload(params);
  }

  private async estimatePayload({
    to,
    amount,
    tokenAddress,
  }: {
    to: string;
    amount: string;
    tokenAddress: string;
  }) {
    const response = await fetch(
      `https://tron.tonkeeper.com/api/v2/wallet/${this.ctx.address.tron
        ?.owner!}/estimate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lifeTime: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              to: to,
              value: AmountFormatter.toNano(amount, 6),
              assetAddress: tokenAddress,
            },
          ],
        }),
      },
    );
    const result = await response.json();

    // const data = await this.ctx.tronapi.wallet.getEstimation(
    //   this.ctx.address.tron?.owner!,
    //   {
    //     lifeTime: Math.floor(Date.now() / 1000) + 600,
    //     messages: [
    //       {
    //         to: to,
    //         value: amount,
    //         assetAddress: tokenAddress,
    //       },
    //     ],
    //   },
    // );
    return result;
  }

  public async send(privateKey: Uint8Array, request: RequestData) {
    const settings = await this.ctx.tronapi.settings.getSettings();
    const hash = hashRequest(request, settings.walletImplementation, settings.chainId);

    const signingKey = new ethers.SigningKey('0x' + (await tonPKToTronPK(privateKey)));
    const signature = signingKey.sign(hash).serialized;

    const ownerAddress = this.ctx.address.tron?.owner!;

    const response = await fetch(
      `https://tron.tonkeeper.com/api/v2/wallet/${ownerAddress}/publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request,
          hash,
          signature,
        }),
      },
    );

    return response;
  }
}
