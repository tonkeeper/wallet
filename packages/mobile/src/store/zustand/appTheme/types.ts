export enum ThemeOptions {
  Blue = 'blue',
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

export interface IAppThemeStore {
  selectedTheme: ThemeOptions;
  actions: {
    setSelectedTheme: (selectedTheme: ThemeOptions) => void;
  };
}
