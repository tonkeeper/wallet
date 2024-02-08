import { ExtraListItem } from '../components/ExtraListItem';
import { ActionModalContent } from '../ActionModalContent';
import {
  ActionItem,
  ActionType,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { FastImage, List, Steezy } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface JettonBurnActionContentProps {
  action: ActionItem<ActionType.JettonBurn>;
}

export const JettonBurnActionContent = memo<JettonBurnActionContentProps>((props) => {
  const { action } = props;

  const source = { uri: action.payload.jetton?.image };

  return (
    <ActionModalContent
      header={<FastImage style={styles.jettonImage} resizeMode="cover" source={source} />}
      label={t('activityActionModal.burned')}
      action={action}
    >
      <List>
        <ExtraListItem extra={action.event.extra} />
      </List>
    </ActionModalContent>
  );
});

const styles = Steezy.create(({ colors }) => ({
  jettonImage: {
    width: 96,
    height: 96,
    borderRadius: 96 / 2,
    backgroundColor: colors.backgroundContent,
  },
}));
