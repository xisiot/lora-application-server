const pubToCloudKafkaTopic = require('../config').mqClient.topics.pubToCloud;
const _ = require('lodash');
const BluebirdPromise = require('bluebird');
const ERROR = require('./lora-lib/ERROR');

class NsMsgHandler {
  constructor(mqClient, mysqlModels, protoBufUnit, log) {
    this.mqClient = mqClient;
    this.DeviceInfo = mysqlModels.DeviceInfo;
    this.protoBufUnit = protoBufUnit;
    this.log = log;
  }

  handler(message) {

    //TODO:Json schema
    const appDataObject = {};
    const whereOpts = {
      DevAddr: message.DevAddr,
    };
    const appFRMPayloadBuf = Buffer.from(message.FRMPayload, 'hex');

    /*TODO
    According to the needs, customize the way of data processing.
    Such as publish the data to Cloud's topic
    */
    return BluebirdPromise.resolve();

    return this.DeviceInfo.readItem(whereOpts, ['AppEUI'])
      .then((res) => {

        //Link data to Protocol Buffer configuration file via productKey
        //This needs to be configured in the config.js file 
        return this.protoBufUnit.PBToJSONUnit(appFRMPayloadBuf, res.AppEUI)
          .then((appJsonObject) => {

            if (Buffer.isBuffer(appJsonObject)) {

              //Have Protocol Buffer configuration
              appDataObject.appData = appJsonObject.toString('hex');
            } else {

              //No Protocol Buffer configuration
              appDataObject.appData = appJsonObject;
            }

            return BluebirdPromise.resolve(appDataObject);
          });

        return BluebirdPromise.reject(
          new ERROR.DeviceNotExistError('Invalid DevAddr in DeviceInfo'));
      })
      .then((appObj) => {

        //TODO
        this.log.debug({
          label: `Uplink object to ${pubToCloudKafkaTopic}`,
          message: appObj,
        });
        return this.mqClient.publish(pubToCloudKafkaTopic, appObj);
      });
  }
}

module.exports = NsMsgHandler;
