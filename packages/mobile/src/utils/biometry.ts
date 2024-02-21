import { BiometryType } from '$wallet/Biometry';
import * as LocalAuthentication from 'expo-local-authentication';
import { t } from '@tonkeeper/shared/i18n';
import { platform } from './device';
import { capitalizeFirstLetter } from './string';

export function detectBiometryType(types: LocalAuthentication.AuthenticationType[]) {
  let found = false;
  for (let type of types) {
    if (
      [
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ].indexOf(type) > -1
    ) {
      found = true;
      break;
    }
  }

  if (found) {
    return types.indexOf(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) > -1
      ? LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      : LocalAuthentication.AuthenticationType.FINGERPRINT;
  } else {
    return null;
  }
}

export const getBiometryName = (
  type: BiometryType,
  params?: {
    capitalized?: boolean;
    genitive?: boolean;
    accusative?: boolean;
    instrumental?: boolean;
  },
) => {
  if (type === BiometryType.Fingerprint) {
    let text = t(`biometry.${platform}.fingerprint`);
    if (params?.genitive) {
      text = t(`biometry.${platform}.fingerprint_genitive`);
    }
    if (params?.instrumental) {
      text = t(`biometry.${platform}.fingerprint_instrumental`);
    }
    return params?.capitalized ? capitalizeFirstLetter(text) : text;
  }
  if (type === BiometryType.FaceRecognition) {
    let text = t(`biometry.${platform}.face_recognition`);
    if (params?.genitive) {
      text = t(`biometry.${platform}.face_recognition_genitive`);
    }
    if (params?.instrumental) {
      text = t(`biometry.${platform}.face_recognition_instrumental`);
    }
    return params?.capitalized ? capitalizeFirstLetter(text) : text;
  }

  let text = t('biometry.default');
  if (params?.genitive) {
    text = t('biometry.default_genitive');
  }
  if (params?.accusative) {
    text = t('biometry.default_accusative');
  }
  if (params?.instrumental) {
    text = t('biometry.default_instrumental');
  }
  return params?.capitalized ? capitalizeFirstLetter(text) : text;
};
