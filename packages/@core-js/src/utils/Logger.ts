export class Logger {
  static getErrorMessage(error?: Error) {
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    } else if (error) {
      try {
        return JSON.stringify(error);
      } catch {
        return 'Unknown';
      }
    }

    return null;
  }
}
