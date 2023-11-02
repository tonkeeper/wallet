import { Steezy, View, Text, Spacer, Button, Lottie } from '@tonkeeper/uikit';
import { Platform } from 'react-native';
import { memo, useMemo } from 'react';
import { t } from '../../../i18n';


import * as LocalAuthentication from 'expo-local-authentication';

interface SetupBiometryPageProps {
  onButtonPress: () => void;
}

export const SetupBiometryPage = memo<SetupBiometryPageProps>((props) => {
  const { onButtonPress } = props;

  const biometryType = LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION; //detectBiometryType(types);
  const isTouchId =
    biometryType !== LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;

  const biometryNameGenitive = useMemo(() => {
    return isTouchId
      ? t(`platform.${Platform.OS}.fingerprint_genitive`)
      : t(`platform.${Platform.OS}.face_recognition_genitive`);
  }, [t, isTouchId]);

  const biometryName = useMemo(() => {
    return isTouchId
      ? t(`platform.${Platform.OS}.fingerprint`)
      : t(`platform.${Platform.OS}.face_recognition`);
  }, [t, isTouchId]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Lottie name={isTouchId ? 'touchID' : 'faceID'} size={160} />
        </View>
        <Text type="h2" textAlign="center">
          {t('setup_biometry_title', { biometryType: biometryNameGenitive })}
        </Text>
        <Spacer y={4} />
        <Text type="body1" textAlign="center" color="textSecondary">
          {t('setup_biometry_caption', {
            biometryType: isTouchId
              ? t(`platform.${Platform.OS}.capitalized_fingerprint`)
              : t(`platform.${Platform.OS}.capitalized_face_recognition`),
          })}
        </Text>
      </View>
      <View style={styles.button}>
        <Button
          title={t('setup_biometry_enable_button', { biometryType: biometryName })}
          onPress={onButtonPress}
        />
      </View>
    </View>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    flex: 1,
    paddingTop: 8, // for lottie
    paddingBottom: safeArea.bottom,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 36,
  },
  button: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  icon: {},
}));
