const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');
const crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const config = require('./config/config');
const log = require('./log/logger')(module);
const app = express();

const options = {
  inflate: true,
  limit: '100mb',
  type: 'application/octet-stream'
};

app.use(bodyParser.raw(options));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
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

app.get('/download', (req, res) => {
  gfs.files.findOne({filename: req.query.filename}, (error, file) => {
    if (!file || file.length === 0) {
      log.error('Error while download: %s', res.statusCode, error.message);
      return res.status(404).json({
        error: 'No file exists'
      });
    }

    const readstream = gfs.createReadStream(file.filename);

    let promise = new Promise((resolve, reject) => {
      new ffmpeg({ source: readstream })
        .setStartTime(req.query.from)
        .setDuration(req.query.duration)
        .on('progress', function(progress) {
          let currentTimeMarkSec = progress.timemark.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
          let percent = (100 * currentTimeMarkSec)/req.query.duration;
          log.info('progress:', `${Math.round(percent)}% done`);
        })
        .on('end', function() {
          log.info('done processing input stream');
          resolve();
        })
        .on('error', function(err) {
          log.error('Error while trim video: %s' + err.message);
          reject();
        })
        .saveToFile(file.filename);
    });

    promise.then(() => {
      const filename = `${__dirname} + '/../${file.filename}`;
      let readStream = fs.createReadStream(filename);

      readStream.on('open', function () {
        readStream.pipe(res);
      })
        .on('end', () => {
          fs.unlink(filename, (err) => {
            if (err) {
              log.error('An error happened while unlink: %s' + err);
              throw err
            }
          });
        });
    });
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({file: req.file});
});

app.use(function(req, res){
  res.status(404);
  log.debug('Not found URL: %s', req.url);
  res.send({ error: 'Not found' });
});

app.use(function(err, req, res){
  res.status(err.status || 500);
  log.error('Internal error(%d): %s', res.statusCode, err.message);
  res.send({ error: err.message });
});

app.listen(config.dev.port, () => {
  log.info(`Running on ${config.dev.port}`);
});
