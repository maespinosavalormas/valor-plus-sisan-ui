if (typeof globalThis.window === 'undefined') {
  const noop = () => {};
  const windowMock = {
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    location: { href: '', origin: '', pathname: '' },
    history: { pushState: noop, replaceState: noop },
    navigator: { userAgent: 'node', platform: 'node' },
    screen: { width: 0, height: 0 },
    innerWidth: 0,
    innerHeight: 0,
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    requestAnimationFrame: noop,
    cancelAnimationFrame: noop,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  };

  Object.defineProperty(globalThis, 'window', {
    value: windowMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'node', platform: 'node' },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: () => ({ style: {}, setAttribute: noop, classList: { add: noop, remove: noop, contains: () => false } }),
      createElementNS: () => ({ setAttribute: noop, style: {} }),
      addEventListener: noop,
      removeEventListener: noop,
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementsByTagName: () => [],
      documentElement: { style: {}, setAttribute: noop },
      body: { appendChild: noop, style: {} },
    },
    writable: true,
    configurable: true,
  });

  (globalThis as any).HTMLElement = class {};
  (globalThis as any).SVGElement = class {};
  (globalThis as any).XMLHttpRequest = class {};
}

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
