import { Linking } from 'react-native';
import { useCallback, useEffect } from 'react';
import { useDeeplinking } from '../hooks/useDeeplinking';

const useIsReadyToListenDefault = () => true;
const useResolversDefault = () => {};

let IsInitialURLProcessed = false;

export function useDeeplinkingListener({
  useIsReadyToListen = useIsReadyToListenDefault,
  useResolvers = useResolversDefault
}) {
  useResolvers();

  const isReadyToListen = useIsReadyToListen();
  const deeplinking = useDeeplinking();

  const handleUrl = useCallback(({ url }) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        deeplinking.resolve(url);
      }
    });
  }, []);

  useEffect(() => {
    if (!isReadyToListen) {
      return;
    }
    
    const linkingListener = Linking.addEventListener('url', handleUrl);
    if (!IsInitialURLProcessed) {
      IsInitialURLProcessed = true;
      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            deeplinking.resolve(url);
          }
        })
        .catch((err) => console.error('An error occurred', err));
    } 
    
    return () => {
      linkingListener.remove();
    };
  }, [isReadyToListen]);
}
