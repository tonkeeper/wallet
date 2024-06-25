import { DevFeature, useDevFeaturesToggle } from '$store';
import { useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { StoriesView } from '@tonkeeper/uikit';
import { memo } from 'react';

interface Props {
  onPressButton?: () => void;
}

export const W5StoriesScreen = memo((props: Props) => {
  const { onPressButton } = props;

  const nav = useNavigation();

  const {
    devFeatures,
    actions: { toggleFeature },
  } = useDevFeaturesToggle();

  return (
    <StoriesView
      items={[
        {
          title: t('w5_stories.2.title'),
          description: t('w5_stories.2.description'),
          image: require('./images/usdt.png'),
        },
        {
          title: t('w5_stories.0.title'),
          description: t('w5_stories.0.description'),
          image: require('./images/fees.png'),
        },
        {
          title: t('w5_stories.1.title'),
          description: t('w5_stories.1.description'),
          image: require('./images/messages.png'),
        },
        {
          title: t('w5_stories.3.title'),
          description: t('w5_stories.3.description'),
          image: require('./images/phrase.png'),
        },
        {
          title: t('w5_stories.4.title'),
          description: t('w5_stories.4.description'),
          image: require('./images/beta.png'),
          buttonTitle: onPressButton ? t('w5_stories.4.button') : undefined,
          onPressButton: onPressButton,
        },
      ]}
      onClose={() => {
        if (!devFeatures[DevFeature.W5StoriesShown]) {
          toggleFeature(DevFeature.W5StoriesShown);
        }

        console.log('on close');
      }}
      onEnd={!onPressButton ? nav.goBack : undefined}
    />
  );
});
