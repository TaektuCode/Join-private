import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"jointesting-1ae6c","appId":"1:457085711696:web:78e240a003d7858490e855","storageBucket":"jointesting-1ae6c.firebasestorage.app","apiKey":"AIzaSyBq3-o7-ZB5DND9lTec5pS5nbSU8WljjGw","authDomain":"jointesting-1ae6c.firebaseapp.com","messagingSenderId":"457085711696","measurementId":"G-EG4S3VYK95"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
