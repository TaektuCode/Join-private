export const environment = {
  production: true,
  firebase: {
    apiKey: process.env['NG_PUBLIC_FIREBASE_API_KEY'],
    authDomain: process.env['NG_PUBLIC_FIREBASE_AUTH_DOMAIN'],
    projectId: process.env['NG_PUBLIC_FIREBASE_PROJECT_ID'],
    storageBucket: process.env['NG_PUBLIC_FIREBASE_STORAGE_BUCKET'],
    messagingSenderId: process.env['NG_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'],
    appId: process.env['NG_PUBLIC_FIREBASE_APP_ID'],
  },
};
