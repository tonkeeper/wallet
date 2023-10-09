export interface IAddressUpdateStore {
  dismissed: boolean;
  actions: {
    dismiss: () => void;
  };
}
