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
    commentOnTut,
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
app.post("/tut/:tutId/comment", FBAuth, commentOnTut);

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
        return db
            .doc(`/tuts/${snapshot.data().tutId}`)
            .get()
            .then((doc) => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
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
            .catch((err) => console.error(err));
    });

exports.deleteNotificationOnUnlike = functions
    .region("europe-west3")
    .firestore.document("likes/{id}")
    .onDelete((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch((err) => console.error(err));
    });

exports.createNotificationOnComment = functions
    .region("europe-west3")
    .firestore.document("comments/{id}")
    .onCreate((snapshot) => {
        return db
            .doc(`/tuts/${snapshot.data().tutId}`)
            .get()
            .then((doc) => {
                if (
                    doc.exists &&
                    doc.data().userHandle !== snapshot.data().userHandle
                ) {
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
            .catch((err) => console.error(err));
    });

exports.onUserImageChange = functions
    .region("europe-west3")
    .firestore.document("/users/{userId}")
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        if (change.before.data().imageUrl !== change.after.data().imageUrl) {
            console.log("Image has changed");
            const batch = db.batch();
            return db
                .collection("tuts")
                .where("userHandle", "==", change.before.data().handle)
                .get()
                .then((data) => {
                    data.forEach((doc) => {
                        const tut = db.doc(`/tuts/${doc.id}`);
                        batch.update(tut, {
                            userImage: change.after.data().imageUrl,
                        });
                    });
                    return batch.commit();
                });
        } else return true;
    });

exports.onTutDelete = functions
    .region("europe-west3")
    .firestore.document("/tuts/{tutId}")
    .onDelete((snapshot, context) => {
        const tutId = context.params.tutId;
        const batch = db.batch();
        return db
            .collection("comments")
            .where("tutId", "==", tutId)
            .get()
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db.collection("likes").where("tutId", "==", tutId).get();
            })
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return db
                    .collection("notifications")
                    .where("tutId", "==", tutId)
                    .get();
            })
            .then((data) => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                });
                return batch.commit();
            })
            .catch((err) => console.error(err));
    });
