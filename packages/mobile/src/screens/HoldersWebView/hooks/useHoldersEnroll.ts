import { tk } from '$wallet';
import { config } from '$config';
import { ConnectReplyBuilder, DAppManifest } from '$tonconnect';
import { beginCell } from '@ton/core';
import { storeStateInit } from '@ton/ton';
import { ConnectItemReply, TonProofItemReplySuccess } from '@tonconnect/protocol';
import { saveAppConnection, TonConnectBridgeType } from '$store';
import axios from 'axios';
import { Address, ContractService, contractVersionsMap } from '@tonkeeper/core';
import { UnlockedVault } from '$blockchain';

export enum HoldersEnrollErrorType {
  ManifestFailed = 'ManifestFailed',
  SignFailed = 'SignFailed',
  ReplyItemsFailed = 'ReplyItemsFailed',
  NoProof = 'NoProof',
  AfterEnrollFailed = 'AfterEnrollFailed',
}

export function useHoldersEnroll(unlockVault: () => Promise<UnlockedVault>) {
  return async (callback: () => void) => {
    let res = await (async () => {
      try {
        //
        // Check holders token value
        //

        let existingToken = tk.wallet.cards.state.data.token;

        if (existingToken && existingToken.toString().length > 0) {
          return { type: 'success' };
        } else {
          //
          // Create signature and fetch token
          //

          const manifestUrl = `${config.get(
            'holdersTonconnect',
            false,
          )}/jsons/tonconnect-manifest.json`;

          let manifest: DAppManifest | null;
          try {
            const { data } = await axios.get<DAppManifest>(manifestUrl);
            manifest = data;
          } catch (error) {
            return { type: 'error', error: HoldersEnrollErrorType.ManifestFailed };
          }

          if (!manifest) {
            return { type: 'error', error: HoldersEnrollErrorType.ManifestFailed };
          }

          const contract = ContractService.getWalletContract(
            contractVersionsMap[tk.wallet.config.version],
            Buffer.from(tk.wallet.config.pubkey, 'hex'),
            0,
          );

          //
          // Sign
          //

          const unlockedVault = await unlockVault();
          const keyPair = await unlockedVault.getKeyPair();

          const initialCode = contract.init.code;
          const initialData = contract.init.data;
          const stateInitCell = beginCell()
            .store(storeStateInit({ code: initialCode, data: initialData }))
            .endCell();
          const stateInitStr = stateInitCell.toBoc({ idx: false }).toString('base64');

          const replyBuilder = new ConnectReplyBuilder(
            {
              items: [
                { name: 'ton_addr' },
                { name: 'ton_proof', payload: 'ton-proof-any' },
              ],
              manifestUrl,
            },
            manifest,
          );

          let replyItems: ConnectItemReply[];
          try {
            replyItems = replyBuilder.createReplyItems(
              Address.parse(tk.wallet.address.ton.raw).toString({
                testOnly: tk.wallet.isTestnet,
                urlSafe: true,
                bounceable: true,
              }),
              Uint8Array.from(keyPair.secretKey),
              Uint8Array.from(keyPair.publicKey),
              stateInitStr,
              tk.wallet.isTestnet,
            );
          } catch (e) {
            return { type: 'error', error: HoldersEnrollErrorType.ReplyItemsFailed };
          }

          await saveAppConnection(
            tk.wallet.isTestnet,
            tk.wallet.address.ton.raw,
            {
              name: manifest.name,
              url: manifest.url,
              icon: manifest.iconUrl,
              notificationsEnabled: false,
            },
            { type: TonConnectBridgeType.Injected, replyItems },
          );

          try {
            const proof = replyItems.find((item) => item.name === 'ton_proof') as
              | TonProofItemReplySuccess
              | undefined;

            if (!proof) {
              return { type: 'error', error: HoldersEnrollErrorType.NoProof };
            }

            await tk.wallet.cards.fetchToken({
              kind: 'tonconnect-v2',
              wallet: 'tonkeeper',
              config: {
                address: tk.wallet.address.ton.raw,
                proof: {
                  timestamp: proof.proof.timestamp,
                  domain: proof.proof.domain,
                  signature: proof.proof.signature,
                  payload: proof.proof.payload,
                  publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
                  walletStateInit: stateInitStr,
                },
              },
            });
          } catch (e) {
            console.warn(e);
          }
        }

        return { type: 'success' };
      } catch (e) {
        console.log(e);
        return { type: 'error', error: HoldersEnrollErrorType.AfterEnrollFailed };
      }
    })();
    if (res.type === 'success') {
      callback();
    }
  };
}
