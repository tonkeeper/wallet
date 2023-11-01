import en from './locales/tonkeeper/en.json';
import ru from './locales/tonkeeper/ru-RU.json';
import tr from './locales/tonkeeper/tr-TR.json';
import zhHans from './locales/tonkeeper/zh-Hans-CN.json';

export const translations = { ru, en, tr, 'zh-Hans': zhHans };

export const SupportedLocales = Object.keys(translations);
