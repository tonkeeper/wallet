interface SignRawMessage {
  address: string;
  amount: string; // (decimal string): number of nanocoins to send.
  payload?: string; // (string base64, optional): raw one-cell BoC encoded in Base64.
  stateInit?: string; // (string base64, optional): raw once-cell BoC encoded in Base64.
}

interface SignRawRequest {
  source: string;
  valid_until: number;
  messages: SignRawMessage[];
}

export interface StonfiInjectedObject {
  address: string;
  close: () => void;
  sendTransaction: (request: SignRawRequest) => Promise<string>;
}
