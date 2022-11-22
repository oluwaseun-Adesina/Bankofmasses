const mongoose = require("mongoose");
require("dotenv").config();

const { MONGO_URI } = process.env.dbURI;

//console.log(MONGO_URI);

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(process.env.dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false,
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};