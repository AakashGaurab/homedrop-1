'use strict';

const serverLess = require("serverless-http");
const app = require("./index");
module.exports.hello = serverLess(app);
