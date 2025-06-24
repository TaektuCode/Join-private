import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

/**
 * Bootstraps the Angular application by providing the root component (AppComponent)
 * and the application configuration (appConfig). Any errors during the bootstrapping
 * process are caught and logged to the console.
 */

console.log('Firebase Config being used:', environment.firebase);

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
