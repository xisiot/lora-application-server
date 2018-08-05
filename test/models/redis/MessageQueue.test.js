'use strict';

const chai = require('chai');
chai.use(require('chai-json-schema-ajv'));
const expect = chai.expect;
const assert = chai.assert;
const mocha = require('mocha');
const config = require('../../../config');
const PB = require('../../../lib/protoBufferUnit');
const mochaConfig = config.mocha;

const loraLib = require('../../../lib/lora-lib');
const DbModels = require('../../../models');
const { Log, dbClient } = loraLib;
const dbModels = new DbModels(dbClient);

describe('Test MessageQueue Model', function () {

  let messageQueue;
  before('Get connection with Redis', function () {

    messageQueue = dbModels.redisConn.MessageQueue;

  });

  let mq = 'testmq';
  let src = { data: { lock: true } };
  this.timeout(mochaConfig.timeout);

  it('Test produce function', function (done) {
    let pb = new PB();
    let appEUI = '9bc5b28d2430fc28';

    messageQueue.produce(mq, src, pb, appEUI)
      .then(function (res) {

        // console.log('res',res);
        done();
      }).catch(function (err) {
        console.log(err.message);
        done();
      });
  });

  it('Test consume function', function (done) {
    messageQueue.consume(mq).then(function (res) {
      if (res) {
        expect(res).to.be.an('object');
        expect(res.data).to.be.deep.equal(src.data);
        expect(res.aggregation).to.be.equal(0);
      }

      done();
    }).catch(function (err) {
      console.log(err.message);
      done(err);
    });
  });

  after('Close connection after 200ms', function (done) {
    setTimeout(function () {
      dbModels.close().then(function () {
        done();
      });
    }, 200);
  });
});
