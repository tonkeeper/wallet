import { ExternalStateSelector, useExternalState } from './useExternalState';
import { State } from '@tonkeeper/core';
import { useRef } from 'react';
import { useWallet } from './useWallet';
import {
  TokenApprovalState,
  TokenApprovalManager,
} from '@tonkeeper/mobile/src/wallet/managers/TokenApprovalManager';

export function useTokenApproval<T = TokenApprovalState>(
  selector?: ExternalStateSelector<TokenApprovalState, T>,
): T {
  const wallet = useWallet();

  const initialState = useRef(new State(TokenApprovalManager.INITIAL_STATE)).current;

  return useExternalState(wallet?.tokenApproval.state ?? initialState, selector);
}
