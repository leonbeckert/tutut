let db = {
    users: [
        {
            userId: "fajasb21i4huvfqw981",
            email: "user@email.com",
            handle: "user",
            createdAt: "2020-09-28T12:27:34.855Z",
            imageUrl: "image/aisrgiauwgia/aifbwawe",
            bio: "Hello, my name is user, nico to meet you",
            website: "https://user.com",
            location: "London, UK",
        },
    ],
    tuts: [
        {
            userHandle: "user",
            body: "this is the tut body",
            createdAt: "2020-09-28T12:27:34.855Z",
            likeCount: 5,
            commentCount: 2,
        },
    ],
    comments: [
        {
            userHandle: "user",
            tutId: "asofbaouirfboui",
            body: "gj bro",
            createdAt: "2020-09-28T12:27:34.855Z",
        },
    ],
    notifications: [
        {
            recipient: "user",
            sender: "john",
            read: "true | false",
            tutId: "ifbaoirutbfaopiwueb",
            type: "like | comment",
            createdAt: "2020-09-28T12:27:34.855Z",
        },
    ],
};

const userDetails = {
    //Redux data
    credentials: {
        userId: "fajasb21i4huvfqw981",
        email: "user@email.com",
        handle: "user",
        createdAt: "2020-09-28T12:27:34.855Z",
        imageUrl: "image/aisrgiauwgia/aifbwawe",
        bio: "Hello, my name is user, nico to meet you",
        website: "https://user.com",
        location: "London, UK",
    },
    likes: [
        {
            userHandle: "user",
            tutId: "aifubaiweurbaijw",
        },
        {
            userHandle: "skippy",
            tutId: "ajhbaervtiuweiju",
        },
    ],
};
