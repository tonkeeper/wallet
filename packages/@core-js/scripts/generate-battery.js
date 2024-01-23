const { generateApi } = require('swagger-typescript-api');
const path = require('path');

generateApi({
  url: 'https://raw.githubusercontent.com/tonkeeper/custodial-battery/master/api/battery-api.yml',
  output: path.resolve(__dirname, '../src/BatteryAPI'),
  name: 'BatteryGenerated',
  extractRequestParams: true,
  apiClassName: 'BatteryGenerated',
  moduleNameIndex: 1,
  extractEnums: true,
  singleHttpClient: true,
  unwrapResponseData: true,
});
