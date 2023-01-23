# Tonkeeper

Welcome to Tonkeeper repository. If you have questions or suggestions, please file an [Issue](https://github.com/tonkeeper/wallet/issues/new/choose).

## Install dependencies

```bash
$ yarn install

$ yarn pods

$ yarn ios
```

## Adding icons

All icon files are named according to `ic-name-24.svg` scheme. And placed in `src/assets/icons/svg`.

After adding the icon, run the convert command

```bash
$ yarn icons
```

To convert you need `librsvg`.

If `librsvg` not already installed, run

```bash
$ brew install librsvg
```

## License

GPLv3. See [LICENSE.txt](LICENSE.txt)

this project is tested with [Browserstack](https://browserstack.com)