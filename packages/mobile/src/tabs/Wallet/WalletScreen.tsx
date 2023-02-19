import React, { memo } from 'react';
import { t } from '$translation';
import { Icon, Screen, Text, TouchableHighlight, TouchableOpacity, View } from '$uikit';
import { List } from '$uikit/List/new';
import { Steezy } from '$styles';
import { useNavigation } from '$libs/navigation';
import { ScanQRButton } from '../../components/ScanQRButton';

const useTonkens = () => {
  return {};
}

const useNFTs = () => {
  return {};
};

const useWallet = () => {
  return { 
    address: 'EQ...',
  }
};

export const WalletScreen = memo((props) => {
  const nav = useNavigation();
  const {  } = useTonkens();
  const {  } = useNFTs();
  const wallet = useWallet();



  return (
    <Screen>
      <Screen.Header 
        backButton={false} 
        title={t('wallet.screen_title')}
        rightContent={
          <ScanQRButton onPress={() => {}} />
        }
      />
      <Screen.ScrollView>

      <View style={styles.amountContainer}>
        <Text variant="num2">
          $12.3123
        </Text>
        <TouchableOpacity onPress={() => {}}>
          <Text
            color="textSecondary"
            variant="body2"
            style={styles.addressText.static} 
          >
            {wallet.address}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttons}>
        <View style={styles.button}>
          <View style={styles.buttonIconContainer}>

          </View>
          
          <Text variant="label3" color="textSecondary">
            Buy
          </Text>
        </View>
        <View style={{ }}>
          <Text variant="label3" color="textSecondary">
            Buy
          </Text>
        </View>
      </View>

      



 
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create({
  headerContainer: {

  },
  amountContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  addressText: {
    marginTop: 7.5
  },
  buttons: {
    paddingVertical: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
  },
  button: {
    
  },
  buttonIconContainer: {
    width: 100,
  }
});