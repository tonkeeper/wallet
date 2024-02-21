import { BiometryType } from '$wallet/Biometry';
import { t } from '@tonkeeper/shared/i18n';
import { isIOS, platform } from './device';
import { capitalizeFirstLetter } from './string';
import { IconNames } from '@tonkeeper/uikit';

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

export const getBiometryIcon = (type: BiometryType): IconNames => {
  if (type === BiometryType.Fingerprint) {
    return isIOS ? 'ic-fingerprint-28' : 'ic-fingerprint-android-28';
  }
  if (type === BiometryType.FaceRecognition) {
    return isIOS ? 'ic-faceid-28' : 'ic-faceid-android-28';
  }
  return 'ic-fingerprint-android-28';
};
