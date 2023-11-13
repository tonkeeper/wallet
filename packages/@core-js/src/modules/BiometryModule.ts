import * as LocalAuthentication from 'expo-local-authentication';

export enum BiometryTypes {
  Fingerprint = 'Fingerprint',
  FaceRecognition = 'FaceRecognition',
  Unknown = 'Unknown',
  None = 'None',
}

export class BiometryModule {
  public type = BiometryTypes.Unknown;

  public async init() {
    this.type = await this.detectTypes();
  }

  public async detectTypes() {
    const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const isBiometryEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!isBiometryEnrolled) {
      return BiometryTypes.None;
    }

    if (authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return BiometryTypes.FaceRecognition;
    }

    if (authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return BiometryTypes.Fingerprint;
    }

    return BiometryTypes.None;
  }
}
