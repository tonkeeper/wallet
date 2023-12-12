import * as LocalAuthentication from 'expo-local-authentication';

export enum BiometryTypes {
  FaceRecognition = 'FaceRecognition',
  Fingerprint = 'Fingerprint',
  BothTypes = 'BothTypes',
  None = 'None',
}

export class BiometryModule {
  public type = BiometryTypes.None;
  public isEnrolled = false;

  public async init() {
    return await this.detectTypes();
  }

  public async detectTypes() {
    const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    this.isEnrolled = await LocalAuthentication.isEnrolledAsync();

    const hasFingerprint = authTypes.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    );

    const hasFaceRecognition = authTypes.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    );

    if (hasFingerprint && hasFaceRecognition) {
      this.type = BiometryTypes.BothTypes;
    } else if (hasFingerprint) {
      this.type = BiometryTypes.Fingerprint;
    } else if (hasFaceRecognition) {
      this.type = BiometryTypes.FaceRecognition;
    } else {
      this.type = BiometryTypes.None;
    }
  }
}
