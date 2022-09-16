type $TSFixME = any;

declare module '*.svg' {
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.json' {
  const json: {
    [locale: string]: object;
  };
  export default json;
}

declare class TextEncoder {
  encode(input?: string): Uint8Array;
}
