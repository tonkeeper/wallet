import axios from 'axios';
import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import { SvgFromXml } from 'react-native-svg';

let cache: Record<string, string> = {};

interface Props {
  uri: string;
  size: number;
}

const IconFromUriComponent: FC<Props> = (props) => {
  const { uri, size } = props;

  const [data, setData] = useState<string>(cache[uri] || '');

  const download = useCallback(async (contentUri: string) => {
    const cachedData = cache[contentUri];

    if (cachedData) {
      setData(cachedData);
      return;
    }

    try {
      const response = await axios.get<string>(contentUri);

      let i = 0;
      const fixedData = response.data
        .replace(/style="[^\"]*"/g, '')
        .replace(/fill="#[^\"]*"/g, (match) => (++i === 2 ? 'fill="#FFF"' : match));

      cache[contentUri] = fixedData;

      setData(fixedData);
    } catch (err) {}
  }, []);

  useEffect(() => {
    download(uri);
  }, [download, uri]);

  if (!data) {
    return null;
  }

  return <SvgFromXml width={size} height={size} xml={data} />;
};

export const IconFromUri = memo(IconFromUriComponent);
