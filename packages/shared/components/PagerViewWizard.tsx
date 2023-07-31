import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { StepIndicator } from './StepIndicator';
import { useRouter } from '@tonkeeper/router';
import {
  PagerView,
  PagerViewRef,
  PagerViewSelectedEvent,
} from '@tonkeeper/uikit';

export const usePagerViewWizard = ({ steps }: { steps: number }) => {
  const pagerViewRef = useRef<PagerViewRef>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const pageOffset = useSharedValue(0);
  const router = useRouter();

  const enableSwipe = () => setScrollEnabled(true);
  const disableSwipe = () => setScrollEnabled(false);

  const onBackPress = useCallback(() => {
    if (pageIndex === 0) {
      router.goBack();
    } else {
      pagerViewRef.current?.setPage(pageIndex - 1);
    }
  }, [pageIndex]);

  const onPageSelected = useCallback((ev: PagerViewSelectedEvent) => {
    const index = ev.nativeEvent.position;
    // console.log({pageIndex, index})
    if (pageIndex < index && scrollEnabled) {
      // disableSwipe();
    }

    // pagerViewRef.current?.setScrollEnabled(false);

    setPageIndex(index);
  }, [pageIndex, scrollEnabled]);

  const indicator = useMemo(
    () => <StepIndicator pageOffset={pageOffset} itemsLength={steps} interval={1} />,
    [steps],
  );

  return {
    onPageSelected,
    onBackPress,
    pagerViewRef,
    enableSwipe,
    disableSwipe,
    scrollEnabled,
    indicator,
    pageOffset,
  };
};

interface PagerViewWizardProps {
  children: React.ReactNode;
  wizard?: any;
}

export const PagerViewWizard = memo<PagerViewWizardProps>((props) => {
  const { children, wizard } = props;

  return (
    <PagerView
      onPageSelected={wizard.onPageSelected}
      // scrollEnabled={wizard.scrollEnabled}
      
      pageOffset={wizard.pageOffset}
      ref={wizard.pagerViewRef}
      overdrag={false}
      
    >
      {children}
    </PagerView>
  );
});
