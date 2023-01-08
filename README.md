# Tonkeeper Wallet

Welcome to Tonkeeper repository. If you have questions or suggestions, please file an [Issue](https://github.com/tonkeeper/wallet/issues/new/choose).

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/tonkeeper/wallet)](https://github.com/tonkeeper/wallet/releases)

## Install dependencies

```bash
$ yarn install
```

##### For iOS run
```bash
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

## Android

All android specific files contains in [android folder](android).


## License

The code and data files in this distribution are licensed under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
See https://www.gnu.org/licenses/ for a copy of this license.

See [LICENSE](LICENSE) file.
