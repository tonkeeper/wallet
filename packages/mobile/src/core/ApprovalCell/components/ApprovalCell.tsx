import React, { useCallback } from 'react';
import { Steezy } from '$styles';
import { Icon, Spacer, SText, View } from '$uikit';
import { List } from '$uikit/List/new';
import { openManageTokens } from '$navigation';

const ApprovalCellComponent: React.FC = () => {
  const handleApproveTokens = useCallback(() => {
    openManageTokens();
  }, []);

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
              Approve incoming token "Helium"
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
