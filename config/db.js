const mongoose = require("mongoose");

require("dotenv").config();

const connect = mongoose.connect(process.env.db);

module.exports={connect};