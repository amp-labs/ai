import * as Sentry from "@sentry/node";

try {
  // NOTE:REPLACE WITH AMPERSAND SENTRY DSN before publishing
  Sentry.init({
    dsn: process.env.AMPERSAND_SENTRY_DSN,
  });
} catch (error) {
  // ignore sentry not being initialised if it's not set
}
