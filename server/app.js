const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');
const crypto = require('crypto');

const config = require('./config/config');
const app = express();

const options = {
  inflate: true,
  limit: '100mb',
  type: 'application/octet-stream'
};

app.use(bodyParser.raw(options));

app.use((req, res, next) => { //allow cross origin requests
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

Grid.mongo = mongoose.mongo;
let gfs;

let conn = mongoose.createConnection(config.dev.db);
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

const storage = new GridFsStorage({
  url: config.dev.db,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage });
const staticRoot = path.resolve(__dirname, '../dist');

app.use(express.static(staticRoot));
app.get('/', function(req, res) {
  res.sendFile('index.html', { root: staticRoot });
});

app.listen(config.dev.port, () => {
  console.log(`Running on ${config.dev.port}`);
});
