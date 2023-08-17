const { generateApi } = require('swagger-typescript-api');
const path = require('path');

generateApi({
  url: 'https://raw.githubusercontent.com/tonkeeper/gasless-tron-protocol/main/api/openapi.yml',
  output: path.resolve(__dirname, '../src/TronAPI'),
  name: 'TronAPIGenerated',
  extractRequestParams: true,
  apiClassName: 'TronAPIGenerated',
  moduleNameIndex: 2,
  extractEnums: true,
  singleHttpClient: true,
  unwrapResponseData: true,
});
