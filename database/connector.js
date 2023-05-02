import mongoose from "mongoose";

class Connector {
  constructor() {
    var database_host =
      process.env.DATABASE_HOST || "mongodb://localhost:27017/";
    var database_name = process.env.DATABASE_NAME || "jobs-api";
    var database_url = `${database_host}${database_name}`;
    this.database_url = database_url;
  }

  mongo() {
    return new Promise((resolve, reject) => {
      try {
        this.mongoConnection = mongoose.connect(this.database_url, {
          useNewUrlParser: true,
          useUnifiedTopology: true,

          useCreateIndex: true,
          useFindAndModify: false,
        });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    });
  }
}

export default new Connector();
