import React, { useCallback, useMemo } from 'react';
import { Steezy } from '$styles';
import { Icon, Spacer, SText, View, List } from '$uikit';
import { openManageTokens } from '$navigation';
import { t } from '$translation';
import { useApprovedNfts, useJettonBalances } from '$hooks';
import { groupByCollection } from '$core/ManageTokens/hooks/useNftData';
import { NFTModel } from '$store/models';

function getStringForTokensApproval(pending: any) {
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
}
const ApprovalCellComponent: React.FC = () => {
  const { pending: jettonsPending } = useJettonBalances();
  const { pending: nftsPending } = useApprovedNfts();
  const handleApproveTokens = useCallback(() => {
    if (!jettonsPending.length) {
      return openManageTokens('collectibles');
    }
    openManageTokens();
  }, [jettonsPending]);

  const pending = useMemo(() => {
    return [...jettonsPending, ...nftsPending];
  }, [jettonsPending, nftsPending]);

  const text = useMemo(() => {
    if (!pending.length) {
      return '';
    }
    if (jettonsPending.length) {
      return getStringForTokensApproval(pending);
    } else {
      const grouped = groupByCollection(nftsPending);
      const areAllTokensFromCollections = grouped.every((item) => item.collection);
      if (!areAllTokensFromCollections || grouped.length > 2) {
        return getStringForTokensApproval(pending);
      }

      if (grouped.length === 2) {
        return t('approval.approve_two_collections', {
          collection1: grouped[0].collection?.name,
          collection2: grouped[1].collection?.name,
        });
      }

      return t(
        grouped[0].count === 1
          ? 'approval.approve_collection_one'
          : 'approval.approve_collection_many',
        {
          collection: grouped[0].collection?.name,
        },
      );
    }
  }, [jettonsPending.length, nftsPending, pending]);

  if (!pending.length) {
    return null;
  }

  return (
    <>
      <Spacer y={16} />
      <List indent={false} style={styles.container}>
        <List.Item
          chevronColor="iconSecondary"
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
