const { db } = require("../util/admin");

// Get all Tutorials
exports.getAllTuts = (req, res) => {
    db.collection("tuts")
        .orderBy("createdAt", "desc")
        .get()
        .then((data) => {
            let tuts = []; // array temporarily stores the datasets received from our database
            data.forEach((doc) => {
                // each element in our database gets pushed to our temporary array
                tuts.push({
                    tutId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage,
                });
            });
            return res.json(tuts); // array is returned
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Post one Tutorial
exports.postOneTut = (req, res) => {
    if (req.body.body.trim() === "") {
        return res.status(400).json({ body: "Body must not be empty" });
    }

    const newTut = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
    };

    db.collection("tuts")
        .add(newTut)
        .then((doc) => {
            const resTut = newTut;
            resTut.tutId = doc.id;
            res.json(resTut);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

// Fetch one tut
exports.getTut = (req, res) => {
    let tutData = {};
    db.doc(`/tuts/${req.params.tutId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Tut not found" });
            }
            tutData = doc.data();
            tutData.tutId = doc.id;
            return db
                .collection("comments")
                .orderBy("createdAt", "desc")
                .where("tutId", "==", req.params.tutId)
                .get();
        })
        .then((data) => {
            tutData.comments = [];
            data.forEach((doc) => {
                tutData.comments.push(doc.data());
            });
            return res.json(tutData);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Comment on a comment
exports.commentOnScream = (req, res) => {
    if (req.body.body.trim() === "")
        res.status(400).json({ comment: "Must not be empty" });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        tutId: req.params.tutId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl,
    };

    db.doc(`/tuts/${req.params.tutId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Tut not found" });
            }
            return doc.ref.update({
                commentCount: doc.data().commentCount + 1,
            });
        })
        .then(() => {
            return db.collection("comments").add(newComment);
        })
        .then(() => {
            res.json(newComment);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

// Like a scream
exports.likeTut = (req, res) => {
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("tutId", "==", req.params.tutId)
        .limit(1);

    const tutDocument = db.doc(`/tuts/${req.params.tutId}`);

    let tutData;

    tutDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                tutData = doc.data();
                tutData.tutId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Tut not found" });
            }
        })
        .then((data) => {
            if (data.empty) {
                return db
                    .collection("likes")
                    .add({
                        tutId: req.params.tutId,
                        userHandle: req.user.handle,
                    })
                    .then(() => {
                        tutData.likeCount++;
                        return tutDocument.update({
                            likeCount: tutData.likeCount,
                        });
                    })
                    .then(() => {
                        return res.json(tutData);
                    });
            } else {
                return res.status(400).json({ error: "Tut already liked" });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

exports.unlikeTut = (req, res) => {
    const likeDocument = db
        .collection("likes")
        .where("userHandle", "==", req.user.handle)
        .where("tutId", "==", req.params.tutId)
        .limit(1);

    const tutDocument = db.doc(`/tuts/${req.params.tutId}`);

    let tutData;

    tutDocument
        .get()
        .then((doc) => {
            if (doc.exists) {
                tutData = doc.data();
                tutData.tutId = doc.id;
                return likeDocument.get();
            } else {
                return res.status(404).json({ error: "Tut not found" });
            }
        })
        .then((data) => {
            console.log(data);
            if (data.empty) {
                return res.status(400).json({ error: "Tut not liked" });
            } else {
                return db
                    .doc(`/likes/${data.docs[0].id}`)
                    .delete()
                    .then(() => {
                        tutData.likeCount--;
                        return tutDocument.update({
                            likeCount: tutData.likeCount,
                        });
                    })
                    .then(() => {
                        res.json(tutData);
                    });
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.code });
        });
};

// Delete a tut
exports.deleteTut = (req, res) => {
    const document = db.doc(`/tuts/${req.params.tutId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Tut not found" });
            }
            if (doc.data().userHandle !== req.user.handle) {
                return res.status(403).json({ error: "Unauthorized" });
            } else {
                return document.delete();
            }
        })
        .then(() => {
            res.json({ message: "Tut deleted successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
