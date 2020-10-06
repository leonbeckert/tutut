// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Sets "db" as pointer to our database for clarity
const db = admin.firestore();

module.exports = { admin, db };
