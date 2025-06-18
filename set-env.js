// set-env.js
const { writeFileSync } = require("fs");
const { join } = require("path");

const envConfig = {
  apiKey: process.env["NG_PUBLIC_FIREBASE_API_KEY"],
  authDomain: process.env["NG_PUBLIC_FIREBASE_AUTH_DOMAIN"],
  projectId: process.env["NG_PUBLIC_FIREBASE_PROJECT_ID"],
  storageBucket: process.env["NG_PUBLIC_FIREBASE_STORAGE_BUCKET"],
  messagingSenderId: process.env["NG_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"],
  appId: process.env["NG_PUBLIC_FIREBASE_APP_ID"],
};

const envConfigFileContent = `
export const environment = {
  production: true,
  firebase: ${JSON.stringify(envConfig)}
};
`;

const envConfigFile = join(__dirname, "src/environments/environment.prod.ts");

writeFileSync(envConfigFile, envConfigFileContent);
console.log("Successfully generated environment.prod.ts");
