const BluebirdPromise = require('bluebird');
const loraLib = require('../lib/lora-lib');
const { consts, utils } = loraLib;

function aggregation(src, redisConn, protoBufUnit, AppEUI, log) {

  if (utils.isEmptyObject(src)) {
    return BluebirdPromise.reject(new Error('aggregation: should pass non empty object'));
  }

  if (!src.hasOwnProperty('did') || !src.hasOwnProperty('payload')) {
    return BluebirdPromise.reject(new Error('aggregation: param should have did and payload'));
  }

  let listName = consts.DOWNLINK_MQ_PREFIX + src.DevAddr.toString('hex');

  log.debug({
    label: 'aggregation',
    message: `Key: ${listName}, Value: ${JSON.stringify(src.payload)}`,
  });

  return redisConn.produce(listName, src.payload, protoBufUnit, AppEUI, utils.mergeObjDeeply);
}

module.exports = aggregation;
