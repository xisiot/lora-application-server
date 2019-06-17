// import the necessary modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define schema
const UplinkMsg = new Schema({
  DevAddr: String,
  operation: String,
  payload: Object,
  timestamp: Number,
});

module.exports = UplinkMsg;
