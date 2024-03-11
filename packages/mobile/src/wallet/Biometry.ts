import * as LocalAuthentication from 'expo-local-authentication';

export enum BiometryType {
  FaceRecognition = 'face_recognition',
  Fingerprint = 'fingerprint',
  BothTypes = 'both',
  None = 'none',
}

export class Biometry {
  public type = BiometryType.None;
  public isAvailable = false;

  public async detectTypes() {
    try {
      const [authTypes, enrolledLevel] = await Promise.all([
        LocalAuthentication.supportedAuthenticationTypesAsync(),
        LocalAuthentication.getEnrolledLevelAsync(),
      ]);

      this.isAvailable =
        enrolledLevel === LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG;

      const hasFingerprint = authTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      );

      const hasFaceRecognition = authTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      );

      if (hasFingerprint && hasFaceRecognition) {
        this.type = BiometryType.BothTypes;
      } else if (hasFingerprint) {
        this.type = BiometryType.Fingerprint;
      } else if (hasFaceRecognition) {
        this.type = BiometryType.FaceRecognition;
      } else {
        this.type = BiometryType.None;
      }
    } catch {}

    return this;
  }
}
