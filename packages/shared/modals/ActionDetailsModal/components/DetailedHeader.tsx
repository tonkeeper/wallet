import { Steezy, Text, View } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface DetailedHeaderProps {
  children: React.ReactNode;
  indentButtom?: boolean;
  isScam?: boolean;
  isHide?: boolean;
}

export const DetailedHeader = memo<DetailedHeaderProps>((props) => {
  const { isScam, children, indentButtom = true, isHide } = props;

  if (isScam) {
    return (
      <View style={styles.scam}>
        <Text type="label2" color="constantWhite">
          {t('transactionDetails.spam')}
        </Text>
      </View>
    );
  }

  if (!isHide) {
    return <View style={indentButtom && styles.indentButtom}>{children}</View>;
  }

  return null;
});

const styles = Steezy.create(({ colors, corners }) => ({
  indentButtom: {
    marginBottom: 20,
  },
  scam: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: colors.accentOrange,
    borderRadius: corners.extraSmall,
  },
}));
