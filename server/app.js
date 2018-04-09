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
const app = express();

const options = {
  inflate: true,
  limit: '100mb',
  type: 'application/octet-stream'
};

app.use(bodyParser.raw(options));

app.use((req, res, next) => {
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

app.get('/download', (req, res) => {
  gfs.files.findOne({filename: req.query.filename}, (error, file) => {
    if (!file || file.length === 0) {
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
          console.log('progress ', progress.percent);
        })
        .on('end', function() {
          console.log('done processing input stream');
          resolve();
        })
        .on('error', function(err) {
          console.log('an error happened: ' + err.message);
          reject();
        })
        .saveToFile(file.filename);
    });

    promise.then(() => {
      const filename = `${__dirname} + '/../${file.filename}`;

      // This line opens the file as a readable stream
      let readStream = fs.createReadStream(filename);

      // This will wait until we know the readable stream is actually valid before piping
      readStream.on('open', function () {
        // This just pipes the read stream to the response object (which goes to the client)
        readStream.pipe(res);
      })
        .on('end', () => {
          fs.unlink(filename, (err) => {
            if (err) throw err;
          });
        });
    })
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({file: req.file});
});

app.listen(config.dev.port, () => {
  console.log(`Running on ${config.dev.port}`);
});
