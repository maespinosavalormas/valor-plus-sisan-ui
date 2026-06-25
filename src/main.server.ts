import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: object) =>
  bootstrapApplication(App, config, context as any);

export default bootstrap;
