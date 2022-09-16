import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useExitAppBackHandler = () => {
  const onBack = () => {
    BackHandler.exitApp();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  }, []);
};
