import React, { useCallback, useState } from 'react';
import * as S from './EditConfig.style';
import { Button, Input, NavBar, ScrollHandler } from '$uikit';
import { ns } from '$utils';
import Animated from 'react-native-reanimated';
import { updateServerConfig } from '$shared/constants';
import { MainDB } from '$database';
import { Toast } from '$store';

export const EditConfig: React.FC = () => {
  const [config, setConfig] = useState<string>('');

  const handleSave = useCallback(async () => {
    try {
      await JSON.parse(config);
      MainDB.setDevConfig(config);
      updateServerConfig(config);
    } catch (e) {
      Toast.fail(e);
    }
  }, [config]);

  const handleReset = useCallback(() => {
    setConfig('');
    MainDB.removeDevConfig();
  }, []);

  return (
    <S.Wrap>
      <NavBar>Edit config</NavBar>
      <ScrollHandler>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: ns(16),
          }}
          scrollEventThrottle={16}
        >
          <S.ContentWrap>
            <S.Margin>
              <Input
                value={config}
                onChangeText={setConfig}
                placeholder="Put config here"
              />
            </S.Margin>
            <S.Margin>
              <Button onPress={handleSave}>Save</Button>
            </S.Margin>
            <S.Margin>
              <Button onPress={handleReset} mode="secondary">
                Reset
              </Button>
            </S.Margin>
          </S.ContentWrap>
        </Animated.ScrollView>
      </ScrollHandler>
    </S.Wrap>
  );
};
