export interface MarketplaceItemProps {
  topRadius: boolean;
  bottomRadius: boolean;
  marketplaceUrl: string;
  iconUrl: string;
  description: string;
  title: string;
  onPress?: () => void;
  internalId: string;
}
