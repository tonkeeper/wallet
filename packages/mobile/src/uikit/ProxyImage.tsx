import React from 'react';
import FastImage, { FastImageProps } from 'react-native-fast-image';
import { proxyMedia } from '$utils/proxyMedia';

type Resize = {
  width: number;
  height: number;
}

type ProxyImageProps = Omit<FastImageProps, 'source'> & {
  resize: Resize | number;
  uri: string;
}

export const ProxyImage = (props: ProxyImageProps) => {
  const { uri, resize, ...rest } = props;

  const size = React.useMemo(() => {
    const size = { width: 0, height: 0 };
    if (typeof resize === 'object') {
      size.width = size.width;
      size.height = size.height;
    } else {
      size.width = resize;
      size.height = resize;
    }

    return size;
  }, [resize]);
  
  const source = React.useMemo(() => {
    const source = { uri: '' };

    if (props.uri) {
      source.uri = proxyMedia(props.uri, size.width, size.height);
    }

    return source;
  }, [props.uri, size.width, size.height]);

  return (
    <FastImage 
      source={source} 
      {...rest}
    />
  );
}
