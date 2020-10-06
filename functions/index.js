/*
  Original Code by Classsed on Youtube via FreeCodeCamp
  Link: https://www.youtube.com/watch?v=m_u6P5k0vP0
  Modified and commented by Leon Beckert

  refer to firebase docs for additional info:
  https://firebase.google.com/docs/functions/get-started
*/

const functions = require("firebase-functions");
const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

const {
    getAllTuts,
    postOneTut,
    getTut,
    commentOnScream,
    likeTut,
    unlikeTut,
    deleteTut,
} = require("./handlers/tuts");
const {
    signup,
    login,
    uploadImage,
    addUserDetails,
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead,
} = require("./handlers/users");

// Tutorial routes

app.get("/tuts", getAllTuts);
app.post("/tut", FBAuth, postOneTut);
app.get("/tut/:tutId", getTut);
app.delete("/tut/:tutId", FBAuth, deleteTut);
app.get("/tut/:tutId/like", FBAuth, likeTut);
app.get("/tut/:tutId/unlike", FBAuth, unlikeTut);
app.post("/tut/:tutId/comment", FBAuth, commentOnScream);

// Users routes

app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.region("europe-west3").https.onRequest(app);

exports.createNotificationOnLike = functions
    .region("europe-west3")
    .firestore.document("likes/{id}")
    .onCreate((snapshot) => {
        db.doc(`/tuts/${snapshot.data().tutId}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "like",
                        read: false,
                        tutId: doc.id,
                    });
                }
            })
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });

exports.deleteNotificationOnUnlike = functions
    .region("europe-west3")
    .firestore.document("likes/{id}")
    .onDelete((snapshot) => {
        db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
            });
    });

exports.createNotificationOnComment = functions
    .region("europe-west3")
    .firestore.document("comments/{id}")
    .onCreate((snapshot) => {
        db.doc(`/tuts/${snapshot.data().tutId}`)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: "comment",
                        read: false,
                        tutId: doc.id,
                    });
                }
            })
            .then(() => {
                return;
            })
            .catch((err) => {
                console.error(err);
                return;
            });
    });
