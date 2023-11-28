import * as LocalAuthentication from 'expo-local-authentication';

export enum BiometryTypes {
  Fingerprint = 'Fingerprint',
  FaceRecognition = 'FaceRecognition',
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

    if (authTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      this.type = BiometryTypes.FaceRecognition;
    } else if (authTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      this.type = BiometryTypes.Fingerprint;
    } else {
      this.type = BiometryTypes.None;
    }
  }
}
