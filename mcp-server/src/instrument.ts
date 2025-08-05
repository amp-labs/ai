import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production' && process.env.AMPERSAND_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.AMPERSAND_SENTRY_DSN,

    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  });
}
