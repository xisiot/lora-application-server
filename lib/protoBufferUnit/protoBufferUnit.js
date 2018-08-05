'use strict';

const config = require('../../config/config.js');
const PBConfig = config.pb;
const protobuf = require('protobufjs');
const BluebirdPromise = require('bluebird');
const fs = require('fs');
const protoFilePath = './config/pbConfig/';
const path = require('path');
const ERROR = require('../lora-lib/ERROR');

function ProtoBufUnit(log) {

  this.log = log;

  let protoFlieList = [];
  this.readProtoFileList(protoFilePath, protoFlieList);
  this.root = protobuf.loadSync(protoFlieList);
}

/**
 * 读取指定路径下的所有.proto类型的文件，并返回文件名的数组
 * @param {string} path
 * @returns {Array} filesList
 */
ProtoBufUnit.prototype.readProtoFileList = function (pbPath, filesList) {
  let files = fs.readdirSync(pbPath);
  files.forEach(function (itm, index) {
    let stat = fs.statSync(pbPath + itm);
    if (stat.isDirectory()) {

      //递归读取文件
      this.readProtoFileList(pbPath + itm + '/', filesList);
    } else {

      // 读取.proto结尾的文件
      if (path.extname(itm) === '.proto') {
        filesList.push(pbPath + itm);
      }
    }
  });
};

/**
 * 通过输入AppEUI获取对应的数据点配置文件
 * @param {string} AppEUI
 * @returns
 */
ProtoBufUnit.prototype.readConfigFile = function (AppEUI) {

  // TODO : read from redis or mysql
  let deviceType;

  if (PBConfig.hasOwnProperty(AppEUI)) {
    deviceType = PBConfig[AppEUI];
  }

  if (!deviceType) {

    this.log.info(new ERROR.ProtoBufError({
      'message': 'Lack of correspondence between the AppEUI and pbConfig in Config,js',
      'AppEUI': AppEUI,
    }));
    return BluebirdPromise.resolve(null);

    // return BluebirdPromise.reject(new ERROR.ProtoBufError({
    //   'message': 'Lack of correspondence between the AppEUI and pbConfig in Config,js',
    //   'AppEUI': AppEUI,
    // }));
  }

  // 加载protobuf
  // let serverSchema = protobuf.loadSync('../config/PBconfig/user.proto');
  // 从protobuf 中抽取实例
  let masageType = this.root.lookupType(deviceType);
  return BluebirdPromise.resolve(masageType);
};

/**
 * 将Protocol Buffer的数据转换为JSON格式输出
 * @param {stirng} AppEUI
 * @param {object} data
 * @returns
 */
ProtoBufUnit.prototype.PBToJSONUnit = function (data, AppEUI) {

  let rawdata = data;

  return this.readConfigFile(AppEUI)
    .then(function (PBMessageType) {
      if (PBMessageType) {

        if (!Buffer.isBuffer(rawdata)) {
          return BluebirdPromise.reject(new ERROR.ProtoBufError({
            'message': 'PBToJSONUnit Input data must be BUFFER',
            'data': data,
          }));
        }

        let message = PBMessageType.decode(rawdata);
        let testJson = PBMessageType.toObject(message);
        let errMsg = PBMessageType.verify(testJson);
        if (errMsg) {
          return BluebirdPromise.reject(new ERROR.ProtoBufError(errMsg));
        }

        let outputJson = PBMessageType.toObject(message, {
          enums: String,  // enums as string names
          longs: String,  // longs as strings (requires long.js)
          bytes: String,  // bytes as base64 encoded strings
          defaults: false, // includes default values
          arrays: false,   // populates empty arrays (repeated fields) even if defaults=false
          objects: false,  // populates empty objects (map fields) even if defaults=false
          oneofs: false,    // includes virtual oneof fields set to the present field's name
        });
        return BluebirdPromise.resolve(outputJson);
      } else {
        return BluebirdPromise.resolve(rawdata);
      }
    });
};

/**
 * 将JSON的数据转换为Protocol Buffer格式输出
 * @param {stirng} AppEUI
 * @param {JSON} data
 * @returns
 */
ProtoBufUnit.prototype.JSONToPBUnit = function (data, AppEUI) {
  let rawdata = data;
  let _this = this;
  return this.readConfigFile(AppEUI)
    .then(function (PBMessageType) {
      if (PBMessageType) {
        let errMsg = PBMessageType.verify(rawdata);
        if (errMsg) {
          return BluebirdPromise.reject(new ERROR.ProtoBufError(errMsg));
        }

        // 将数据编码为二进制
        return BluebirdPromise.resolve(
          PBMessageType.encode(PBMessageType.create(rawdata)).finish());
      } else {
        return BluebirdPromise.resolve(rawdata);
      }
    });
};

module.exports = ProtoBufUnit;
