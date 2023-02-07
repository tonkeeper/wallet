import fs from 'fs';
import path from 'path';

const src = './src/';
const dist = './dist';

const wallet = '../mobile/src/translation/locales/';

const extension = 'extension';
const i18n = 'i18n';
const locales = 'locales';

const defaultLocales = ['en'];

interface Message {
  message: string;
  description?: string;
}

const toDict = (
  parentKey: string | undefined,
  value: object
): Record<string, Message> => {
  return Object.entries(value).reduce((acc, [key, message]) => {
    const item_key = parentKey ? `${parentKey}_${key}` : key;
    if (typeof message === 'string') {
      acc[item_key] = { message };
      return acc;
    } else {
      const dict = toDict(item_key, message);
      return { ...acc, ...dict };
    }
  }, {} as Record<string, Message>);
};

const main = async () => {
  console.log('----------Build Locales----------');

  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
  }
  if (!fs.existsSync(path.join(dist, extension))) {
    fs.mkdirSync(path.join(dist, extension));
  }
  if (!fs.existsSync(path.join(dist, i18n))) {
    fs.mkdirSync(path.join(dist, i18n));
  }
  if (!fs.existsSync(path.join(dist, locales))) {
    fs.mkdirSync(path.join(dist, locales));
  }

  let resources: Record<string, { translation: Record<string, string> }> = {};
  let defaultResources: Record<
    string,
    { translation: Record<string, string> }
  > = {};

  fs.readdirSync(src).forEach((file) => {
    const [locale] = file.split('.');
    console.log(locale);

    const walletData = fs.readFileSync(path.join(wallet, file));
    const walletJson: Record<string, string | object> = JSON.parse(
      walletData.toString('utf8')
    );

    const walletDict = toDict(undefined, walletJson);

    let rawdata = fs.readFileSync(path.join(src, file));

    // copy to i18n
    let data: Record<string, Message> = {
      ...walletDict,
      ...JSON.parse(rawdata.toString('utf8')),
    };

    // copy to extension
    fs.mkdirSync(path.join(dist, extension, locale));
    fs.writeFileSync(
      path.join(dist, extension, locale, 'messages.json'),
      JSON.stringify(data, null, 2)
    );

    const translation = Object.entries(data).reduce(
      (acc, [key, { message }]) => {
        acc[key] = message;
        return acc;
      },
      {} as Record<string, string>
    );

    resources[locale] = {
      translation,
    };
    if (defaultLocales.includes(locale)) {
      defaultResources[locale] = {
        translation,
      };
    }

    fs.mkdirSync(path.join(dist, locales, locale));
    fs.writeFileSync(
      path.join(dist, locales, locale, 'translation.json'),
      JSON.stringify(translation, null, 2)
    );
  });

  fs.writeFileSync(
    path.join(dist, i18n, 'default.json'),
    JSON.stringify(defaultResources, null, 2)
  );

  fs.writeFileSync(
    path.join(dist, i18n, 'resources.json'),
    JSON.stringify(resources, null, 2)
  );

  console.log('----------End Build Locales----------');
};

main().catch(() => process.exit(1));
