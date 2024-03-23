import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    privateKey: process.env.PRIVATE_KEY,
    clientEmail: process.env.CLIENT_EMAIL,
  }),
  storageBucket: process.env.STORAGE_BUCKET,
});

export const bucket = admin.storage().bucket();
