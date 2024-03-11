import * as RNLogs from 'react-native-logs';

export type NamespacedLogger = ReturnType<typeof logger.extend>;

export const logger = RNLogs.logger.createLogger<'debug' | 'info' | 'warn' | 'error'>({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: 'debug',
  transport: RNLogs.consoleTransport,
  transportOptions: {
    colors: {
      debug: 'grey',
      info: 'greenBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: false,
  printDate: true,
  fixedExtLvlLength: true,
  enabled: true,
});
