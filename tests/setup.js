/* eslint-disable no-var */

var path = require('path');
var chai = require('chai');
var sinon = require('sinon');

var assert = chai.assert;

sinon.assert.expose(assert, { prefix: '' });

global.chai = chai;
global.sinon = sinon;
global.assert = assert;
