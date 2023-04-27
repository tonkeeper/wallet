import React, { useCallback, useMemo } from 'react';
import { Steezy } from '$styles';
import { Icon, Spacer, SText, View } from '$uikit';
import { List } from '$uikit/List/new';
import { openManageTokens } from '$navigation';
import { t } from '$translation';
import { useApprovedNfts, useJettonBalances } from '$hooks';

const ApprovalCellComponent: React.FC = () => {
  const handleApproveTokens = useCallback(openManageTokens, []);
  const { pending: jettonsPending } = useJettonBalances();
  const { pending: nftsPending } = useApprovedNfts();

  const pending = useMemo(() => {
    return [...jettonsPending, ...nftsPending];
  }, [jettonsPending, nftsPending]);

  const text = useMemo(() => {
    if (pending.length === 1) {
      return t('approval.approve_token', { name: pending[0].metadata?.name });
    }
    if (pending.length === 2) {
      return t('approval.approve_two_tokens', {
        name1: pending[0].metadata?.name,
        name2: pending[1].metadata?.name,
      });
    } else {
      return t('approval.approve_many', { count: pending.length });
    }
  }, [pending]);

  if (!pending.length) {
    return null;
  }

  return (
    <>
      <Spacer y={16} />
      <List indent={false} style={styles.container}>
        <List.Item
          onPress={handleApproveTokens}
          leftContent={
            <View style={styles.iconContainer}>
              <Icon color="foregroundPrimary" name="ic-bell-28" />
            </View>
          }
          title={
            <SText numberOfLines={2} style={styles.title} variant="body2">
              {text}
            </SText>
          }
          chevron
        />
      </List>
    </>
  );
};

export const ApprovalCell = React.memo(ApprovalCellComponent);

const styles = Steezy.create(({ colors }) => ({
  container: {
    backgroundColor: colors.backgroundContentAttention,
    marginBottom: 4,
  },
  title: {
    marginRight: 40,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: colors.iconTertiary,
    borderRadius: 32,
  },
}));
