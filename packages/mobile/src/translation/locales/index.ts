import en from './en.json';
import ru from './ru.json';
import it from './it.json';

export const tags = [
  {
    tag: 'en',
    strings: en,
    enabledForProduction: true
  },
  {
    tag: 'ru',
    strings: ru,
    enabledForProduction: true,
  },
  {
    tag: 'it',
    strings: it,
    enabledForProduction: false,
  },
]

export const locales = tags.reduce((acc, { tag, strings }) => {
  // @ts-ignore
  acc[tag] = strings;
  return acc;
}, {} as Record<string, Record<string, string>>);
