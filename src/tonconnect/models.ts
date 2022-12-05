export interface IConnectQrQuery {
  v: string;
  r: string;
  id: string;
}

export interface DAppManifest {
  url: string;
  name: string;
  iconUrl: string;
  termsOfUseUrl?: string;
  privacyPolicyUrl?: string;
}
