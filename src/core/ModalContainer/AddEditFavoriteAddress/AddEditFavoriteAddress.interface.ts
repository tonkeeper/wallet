export interface AddEditFavoriteAddressProps {
  isEdit: boolean;
  address: string;
  name?: string;
  domain?: string;
  onSave?: () => void;
}
