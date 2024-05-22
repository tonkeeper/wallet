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

  return (
    <StoriesView
      items={[
        {
          title: t('w5_stories.0.title'),
          description: t('w5_stories.0.description'),
        },
        {
          title: t('w5_stories.1.title'),
          description: t('w5_stories.1.description'),
        },
        {
          title: t('w5_stories.2.title'),
          description: t('w5_stories.2.description'),
        },

        {
          title: t('w5_stories.3.title'),
          description: t('w5_stories.3.description'),
          buttonTitle: onPressButton ? t('w5_stories.3.button') : undefined,
          onPressButton: onPressButton
            ? () => {
                onPressButton();
                nav.goBack();
              }
            : undefined,
        },
      ]}
      onClose={nav.goBack}
      onEnd={!onPressButton ? nav.goBack : undefined}
    />
  );
});
