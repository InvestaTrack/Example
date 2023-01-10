require('dotenv').config();

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (cb) => {

MongoClient.connect("mongodb+srv://coulten:" + process.env.MONGO_PASS + "@node.k7a3h.mongodb.net/investa?retryWrites=true&w=majority")
.then(result => {
  console.log('Connected');
  _db = result.db();
  cb();
})
.catch(err => {
  console.log(err);
  throw err;
});

};

const getDb = () => {
  if (_db){
    return _db
  }
  throw 'No DB found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;