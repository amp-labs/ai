/**
 * Logger utility for SDK.
 * Uses stderr (console.error) to avoid interfering with stdio transport JSON-RPC protocol.
 * All logs are captured by Claude Desktop and written to logs.
 */

type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

function formatLog(level: LogLevel, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const baseMessage = `[${level}] ${timestamp} ${message}`;

  if (data !== undefined) {
    if (typeof data === 'object') {
      return `${baseMessage} ${JSON.stringify(data)}`;
    }
    return `${baseMessage} ${data}`;
  }

  return baseMessage;
}

export const logger = {
  info: (message: string, data?: any) => {
    console.error(formatLog('INFO', message, data));
  },

  error: (message: string, error?: any) => {
    console.error(formatLog('ERROR', message, error));
  },

  warn: (message: string, data?: any) => {
    console.error(formatLog('WARN', message, data));
  },

  debug: (message: string, data?: any) => {
    console.error(formatLog('DEBUG', message, data));
  },
};
