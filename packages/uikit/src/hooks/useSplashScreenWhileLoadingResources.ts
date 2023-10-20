import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

export function useSplashScreenWhileLoadingResources(loadResources: () => Promise<void>) {
  const [isSplashScreenShown, setSplashScreenShown] = useState(true);

  useEffect(() => {
    (async () => {
      // await SplashScreen.preventAutoHideAsync(); // this is called in App (main component of the application)
      await loadResources();
      setSplashScreenShown(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!isSplashScreenShown) {
        await SplashScreen.hideAsync();
      }
    })();
  }, [isSplashScreenShown]);

  return isSplashScreenShown;
}
