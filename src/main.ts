import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Bootstraps the Angular application by providing the root component (AppComponent)
 * and the application configuration (appConfig). Any errors during the bootstrapping
 * process are caught and logged to the console.
 */

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
