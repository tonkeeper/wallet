import { AppConfigVars, config } from '$config';
import { useNavigation } from '@tonkeeper/router';
import { memo, useRef, useState } from 'react';
import RNRestart from 'react-native-restart';
import {
  Button,
  Input,
  InputRef,
  List,
  Modal,
  Screen,
  Spacer,
  Steezy,
  useTheme,
} from '@tonkeeper/uikit';
import { Switch } from 'react-native';

export const DevConfigScreen = memo(() => {
  const [_, rerender] = useState(0);
  const nav = useNavigation();
  const theme = useTheme();

  const handleSave = () => rerender((c) => c + 1);

  const handleBooleanSwitch = (key: keyof AppConfigVars) => () => {
    config.set({ [key]: !config.get(key) });
    handleSave();
  };

  return (
    <Screen>
      <Screen.Header
        title="App Config"
        rightContent={
          <Button
            onPress={() => RNRestart.restart()}
            style={{ marginHorizontal: 16 }}
            title="Restart"
            color="secondary"
            size="small"
          />
        }
      />
      <Screen.ScrollView>
        <Spacer y={8} />
        <List>
          <List.Item
            title="Tonapi host"
            value={config.get('tonapiIOEndpoint')}
            valueStyle={styles.value}
            onPress={() =>
              nav.navigate('/dev/config/edit', {
                configKey: 'tonapiIOEndpoint',
                title: 'Tonapi host',
                onSave: handleSave,
              })
            }
          />
          <List.Item
            title="Swap host"
            value={config.get('stonfiUrl')}
            valueStyle={styles.value}
            onPress={() =>
              nav.navigate('/dev/config/edit', {
                configKey: 'stonfiUrl',
                title: 'Swap host',
                onSave: handleSave,
              })
            }
          />
          <List.Item
            title="Enable battery"
            onPress={handleBooleanSwitch('disable_battery')}
            rightContent={
              <Switch
                trackColor={{ true: theme.accentBlue }}
                value={!config.get('disable_battery')}
                onChange={handleBooleanSwitch('disable_battery')}
              />
            }
          />
          <List.Item
            title="Enable send using battery"
            onPress={handleBooleanSwitch('disable_battery_send')}
            rightContent={
              <Switch
                trackColor={{ true: theme.accentBlue }}
                value={!config.get('disable_battery_send')}
                onChange={handleBooleanSwitch('disable_battery_send')}
              />
            }
          />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
});

interface EditAppConfigModal {
  configKey: any;
  title: string;
  onSave: () => {};
}

export const EditAppConfigModal = memo<EditAppConfigModal>((props) => {
  const { configKey, title, onSave } = props;
  const input = useRef<InputRef>(null);
  const nav = useNavigation();

  const handleSave = () => {
    const value = input.current?.getValue();
    config.set({ [configKey]: value === '' ? undefined : value });
    onSave();
    nav.goBack();
  };

  return (
    <Modal>
      <Modal.Header title={`Edit ${title}`} />
      <Modal.Content style={styles.content.static}>
        <Input
          defaultValue={config.get(configKey)}
          onSubmitEditing={handleSave}
          component={Modal.Input}
          returnKeyType="done"
          ref={input}
          autoFocus
          keyboardType="ascii-capable"
          textContentType="none"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
        />
        <Spacer y={32} />
        <Button onPress={handleSave} title="Save" />
        <Spacer y={24} />
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
  content: {
    paddingHorizontal: 16,
  },
  value: {
    color: colors.accentBlue,
  },
}));
