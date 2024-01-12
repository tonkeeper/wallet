import queryParser from 'query-string';

const prefixes = [
  'ton://',
  'https://tonhub.com/',
  'https://app.tonkeeper.com/',
  'tonkeeper://',
];

export enum TransferOperationType {
  InscriptionTransfer = 'inscription-transfer',
  Transfer = 'transfer',
}

export function isTransferOp(operation: string): operation is TransferOperationType {
  return (Object.values(TransferOperationType) as string[]).includes(operation);
}

type ParsedTonLink = {
  match: boolean;
  address: string;
  operation: string;
  query: queryParser.ParsedQuery<string>;
};

export function parseTonLink(link: string): ParsedTonLink {
  const prefix = prefixes.find((prefix) => {
    return (link || '').startsWith(prefix);
  });

  const parsed: ParsedTonLink = {
    match: !!prefix,
    address: '',
    operation: '',
    query: {},
  };

  if (!prefix) {
    return parsed;
  }

  const pathname = link.substring(prefix.length);
  const splittedQuery = pathname.split('?');
  const splittedBySlash = splittedQuery[0].split('/');

  if (splittedBySlash[0]) {
    parsed.operation = splittedBySlash[0];
  }

  if (splittedBySlash[1]) {
    parsed.address = splittedBySlash[1];
  }

  if (splittedQuery[1]) {
    parsed.query = queryParser.parse(splittedQuery[1]);
  }

  return parsed;
}
