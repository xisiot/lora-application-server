'use strict';

const BluebirdPromise = require('bluebird');
const loraLib = require('../lib/lora-lib');
const config = require('../config');
const mongoose = require('mongoose');
const {Models} = loraLib;
const RedisModels = Models.RedisModels;
const MySQLModels = Models.MySQLModels;

function DbModels(dbClient) {

  let _this = this;

  this._ioredis = dbClient.createRedisClient(config.database.redis);
  this._sequelize = dbClient.createSequelizeClient(config.database.mysql);
  this._mongoose = dbClient.createMongoClient(config.database.mongodb);
  this.redisConn = {};
  this.mysqlConn = {};

  /* create model instance */
  for (let model in RedisModels) {
    _this.redisConn[model] = new RedisModels[model](_this._ioredis);
  }
  
  for (let model in MySQLModels) {
    _this.mysqlConn[model] = new MySQLModels[model](_this._sequelize);
  }

  /* create association between entities */
  let modelIns = this.mysqlConn;

  modelIns.GatewayStatus._model.belongsTo(
    modelIns.GatewayInfo._model, {
      foreignKey: 'gatewayId',
      onDelete: 'CASCADE',
    });

  modelIns.GatewayInfo._model.belongsTo(
    modelIns.Developers._model, {
      targetKey: 'developer_id',
      foreignKey: 'userID',
      onDelete: 'CASCADE',
    }
  );

  modelIns.AppInfo._model.belongsTo(
    modelIns.Developers._model, {
      targetKey: 'developer_id',
      foreignKey: 'userID',
      onDelete: 'CASCADE',
    }
  );

  modelIns.DeviceInfo._model.belongsTo(
    modelIns.AppInfo._model, {
      foreignKey: 'AppEUI',
      onDelete: 'CASCADE',
    }
  );

  modelIns.DeviceStatus._model.belongsTo(
    modelIns.DeviceInfo._model, {
      foreignKey: 'DevAddr',
      onDelete: 'CASCADE',
      targetKey: 'DevAddr',
    }
  );

  modelIns.DeviceRouting._model.belongsTo(
    modelIns.DeviceInfo._model, {
      foreignKey: 'DevAddr',
      onDelete: 'CASCADE',
      targetKey: 'DevAddr',
    }
  );

  modelIns.DeviceConfig._model.belongsTo(
    modelIns.DeviceInfo._model, {
      foreignKey: 'DevAddr',
      onDelete: 'CASCADE',
      targetKey: 'DevAddr',
    }
  );

  this._sequelize.sync();
}

DbModels.prototype.close = function () {
  let _this = this;
  return BluebirdPromise.all([
    _this._sequelize.close(),
    _this._ioredis.disconnect(),
    mongoose.disconnect(),
  ]);
};

module.exports = DbModels;
