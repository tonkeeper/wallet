export interface ISelectedLanguageStore {
  selectedLanguage: string;
  actions: {
    setSelectedLanguage: (language: string) => void;
  };
}
