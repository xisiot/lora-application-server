const ERROR = require('./lora-lib/ERROR');
const BluebirdPromise = require('bluebird');
const downlinkAggregation = require('./aggregation');

class CloudMsgHandler {
  constructor(modelIns, protoBufUnit, log) {
    this.redisConn = modelIns.redisConn;
    this.DeviceInfo = modelIns.mysqlConn.DeviceInfo;
    this.protoBufUnit = protoBufUnit;
    this.log = log;
  }

  handler(message) {

    try {

      /**TODO
       * According to the needs, customize the way of data processing.
       * Such as aggregate data of one node and storage it in the Redis.
      */

      /** 
       * For example
       * downlinkMsg = {
       *  data:'123123132'
       *  DevAddr = '123456';
       * }
       * 
      */

      const whereOpts = {
        DevAddr: downlinkMsg.DevAddr,
      };

      return this.DeviceInfo.readItem(whereOpts, ['AppEUI'])
        .then((res) => {

          // Aggregation & storage
          return downlinkAggregation(downlinkMsg, this.redisConn.MessageQueue,
            this.protoBufUnit, res.AppEUI, this.log);
        });
    } catch (e) {
      return BluebirdPromise.reject(new ERROR.JSONParseError(
        'Message of invalid topic or payload from Cloud'));
    }

    //TODO other topic process
    return BluebirdPromise.resolve();
  }
}

module.exports = CloudMsgHandler;
