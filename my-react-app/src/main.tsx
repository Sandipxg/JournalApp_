import * as Sentry from "@sentry/react";
import { createRoot } from 'react-dom/client'
import App from './App'

Sentry.init({
    dsn: "https://ef2f32baac84bacf12b3ce45bb22e284@o4510964654211072.ingest.us.sentry.io/4510964657487872",
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

// avoids crashes if root is absent 
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}