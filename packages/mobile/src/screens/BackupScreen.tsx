import { Button, Screen, Spacer, Steezy, Text } from '@tonkeeper/uikit';
import { useNavigation } from '@tonkeeper/router';
import { memo } from 'react';

export const BackupScreen = memo(() => {
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header title="Backup" />

      <Screen.ScrollView contentContainerStyle={styles.scrollViewContent.static}>
        <Text type="h3">Manual</Text>
        <Spacer y={4} />
        <Text type="body2" color="textSecondary">
          Back up your wallet manually by writing down the recovery phrase.
        </Text>
        <Button
          style={styles.button.static}
          title="Back Up Manually"
          color="secondary"
          onPress={() => nav.navigate('/backup-warning')}
        />
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create({
  scrollViewContent: {
    marginHorizontal: 16,
  },
  button: {
    marginTop: 14,
  },
});
