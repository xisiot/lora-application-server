'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-json-schema-ajv'));
const ProtoBufferUnit = require('../../../lib/protoBufferUnit');
const Log = require('../../../lib/lora-lib/log');

const testPMJson = {
  pm25: 10,
  pm10: 23,
};
const testPMAppEUI = '260febaf6c60807b';
const expectBufStr = '080a1017';

describe('Test ProtoBufferUnit', function () {

  let protoBufferUnit;
  let log;
  before('create a new ProtoBufferUnit', function () {
    this.timeout(20000);
    log = new Log();
    protoBufferUnit = new ProtoBufferUnit(log);
  });

  describe('#Test ProtoBufferUnit function', function () {

    it('#JSONToPBUnit', function (done) {
      protoBufferUnit.JSONToPBUnit(testPMJson, testPMAppEUI)
        .then(res => {
          expect(res.toString('hex')).to.deep.equal(expectBufStr);
          done();
        })
        .catch(err => {
          console.log(err.message);
          done(err);
        });
    });

    it('#PBToJSONUnit', function (done) {
      protoBufferUnit.PBToJSONUnit(Buffer.from(expectBufStr, 'hex'), testPMAppEUI)
        .then(res => {
          expect(res).to.deep.equal(testPMJson);
          done();
        })
        .catch(err => {
          console.log(err.message);
          done(err);
        });
    });
  });

});
