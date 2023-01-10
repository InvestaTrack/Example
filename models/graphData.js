const getDb = require('./util/database').getDb;
const mongoConnect = require('./util/database').mongoConnect;

const save = () => {
    const db = getDb();
    const coll = db.collection('graphData');
    const test = {
        email: 'coulten.davis23@gmail.com',
        history: []
    }
    return coll.insertOne(test)
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
}

const findUserByEmail = (userEmail) => {
    const db = getDb();
    const coll = db.collection('users');
    return coll.find({ email: userEmail })
        .next()
        .then(user => {
            return user;
        })
        .catch(err => {
            console.log(err);
        });
}

const pushGraph = (data) => {
    const db = getDb();
    const coll = db.collection('graphData');
    return coll.updateOne(
        { email: 'coulten.davis23@gmail.com' },
        {
            $set: {
                history: data
            }
        }
    )
    .then(result => {
        console.log (result);
    })
    .catch(err => {
        console.log(err);
    })
}

const findGraphEmail = (userEmail) => {
    const db = getDb();
    const coll = db.collection('graphData');
    return coll.find({ email: userEmail })
        .next()
        .then(graph => {
            return graph;
        })
        .catch(err => {
            console.log(err);
        });
}

const getUserValue = (cb) => {
    findUserByEmail('coulten.davis23@gmail.com')
        .then(user => {
            let value = user.cMoney + user.currentTotal;
            cb(value);
        })
        .catch(err => {
            console.log(err);
        })
}
const update = () => {
    mongoConnect(connected => {
        setTimeout(() => {
        findGraphEmail('coulten.davis23@gmail.com')
            .then(graph => {
                getUserValue(data => {
                    let temp = graph.history;
                    let currentdate = new Date();
                    let datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " @ "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    let full = datetime + ', ' + data;
                    temp.push(full);
                    pushGraph(temp)
                    .then(() => {
                        update();
                    })
                    .catch(err => {
                        console.log(err);
                    })
                })

            })
            .catch(err => {
                console.log(err);
            })
        }, 10000);
    })
};

update();