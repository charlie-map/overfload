require('dotenv').config({
  path: __dirname + '/.env'
});
const AWS = require('aws-sdk');
const express = require('express');
const app = express();
// configure sdk for use with DO Spaces
const endpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const space = new AWS.S3({
  endpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
});

app.get('/gimme-link', (req, res) => {
  async (file, key) => {
    return space
      .putObject({
        Body: file.data,
        Bucket: process.env.SPACES_BUCKET,
        Key: key,
        ACL: 'public-read',
        ContentType: file.mimetype,
      })
      .promise();
  };
});