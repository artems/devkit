/* eslint-disable no-var */

require('babel/register');

var path = require('path');
var chai = require('chai');
var sinon = require('sinon');
var chaiAsPromised = require('chai-as-promised');

var assert = chai.assert;

chai.use(chaiAsPromised);
sinon.assert.expose(assert, { prefix: '' });

global.chai = chai;
global.sinon = sinon;
global.assert = assert;
