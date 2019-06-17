// import the necessary modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema
const DownlinkMsg = new Schema({
  DevAddr: String,
  operation: String,
  payload: Object,
  createdTime: Number,
});

module.exports = DownlinkMsg;