require('dotenv').config({
  path: __dirname + '/.env'
});
const AWS = require('aws-sdk');
const express = require('express');
const Busboy = require('busboy');
const {
  v4: uuidv4
} = require('uuid');
const app = express();
// configure sdk for use with DO Spaces
const endpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const space = new AWS.S3({
  endpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
});

const maidboy = function(req, res, next) {
  let bb = new Busboy({
    headers: req.headers
  });
  let the_dump = uuidv4();
  bb.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if (mimetype.match(/image\/[A-Za-z]/g)) {
      space
        .upload({
          Body: file,
          Bucket: process.env.SPACES_BUCKET,
          Key: the_dump,
          ACL: 'public-read',
          ContentType: mimetype,
        }, (err, data) => {
          if (err) console.log("Oopsy Doopsy", err);
          console.log("woo", data);
        });
    } else {
      next("Oopsy doopsy! Kiro wanted a boy!");
    }
  });
  bb.on('finish', function() {
    req.url_cute = "https://" + process.env.SPACES_BUCKET + "." + process.env.SPACES_CDN + "/" + the_dump;
    next();
  });
  req.pipe(bb);
};

app.get("/", (req, res) => {
  res.end('<html><form method="POST" enctype="multipart/form-data" action="/gimme-link"><input type="file" name="file"><input type="submit"></form></html>');
});

app.post('/gimme-link', maidboy, (req, res) => {
  res.end(req.url_cute);
});

app.listen(process.env.PORT, () => {
  console.log("server go vroom");
});