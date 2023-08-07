import { useNavigation } from '@tonkeeper/router';
import { Icon, List, Modal, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { memo } from 'react';

interface AddWalletModalProps {}

export const AddWalletModal = memo<AddWalletModalProps>((props) => {
  const nav = useNavigation();

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.caption}>
          <Text type="h2" textAlign="center">
            Add another wallet
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            Create a new wallet or add an existing one
          </Text>
        </View>
        <View style={styles.listContainer}>
          <List>
            <List.Item
              navigate="/create"
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-globe-28" color="accentBlue" />}
              title="Create new wallet"
              subtitle="By using your recovery phrase"
              subtitleNumberOfLines={2}
              chevron
            />
          </List>
          <List>
            <List.Item
              // navigate="/import"
              onPress={() => {
                nav.goBack();
                setTimeout(() => {
                  nav.navigate('/import');
                }, 600);
              }}
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-key-28" color="accentBlue" />}
              title="With recovery phrase"
              subtitle="Import wallet with a 24 secret recovery words"
              subtitleNumberOfLines={2}
              chevron
            />
          </List>
          <List>
            <List.Item
              navigate="/create-watch"
              leftContentStyle={styles.iconContainer}
              leftContent={<Icon name="ic-globe-28" color="accentBlue" />}
              title="Add watch address"
              subtitle="For monitor wallet activity without recovery phrase"
              subtitleNumberOfLines={2}
              chevron
            />
          </List>
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create({
  iconContainer: {
    alignSelf: 'center',
  },
  caption: {
    paddingTop: 48,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  listContainer: {
    marginHorizontal: 16,
    paddingBottom: 16,
  },
});
