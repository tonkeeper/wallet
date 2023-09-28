export interface IMethod {
  id: string;
  title: string;
  disabled?: boolean;
  badge?: string;
  subtitle: string;
  description: string;
  icon_url: string;
  action_button: {
    title: string;
    url: string;
  };
  successUrlPattern?: {
    pattern?: string;
    purchaseIdIndex?: number;
  };
  info_buttons?: {
    title: string;
    url: string;
  }[];
}

export interface ILayout {
  countryCode: string;
  currency: string;
  methods: string[];
}

export interface IDefaultLayout {
  methods: string[];
}

export enum CategoryType {
  BUY = 'buy',
  SELL = 'sell',
}

export interface IMethodsToBuyStore {
  selectedCountry: string;
  categories: {
    type: CategoryType;
    items: IMethod[];
  }[];
  layoutByCountry: ILayout[];
  defaultLayout: IDefaultLayout;
  actions: {
    setSelectedCountry: (selectedCountry: string) => void;
    fetchMethodsToBuy: () => void;
  };
}
