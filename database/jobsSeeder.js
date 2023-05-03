import jobsModel from "../app/models/jobs.model.js";
import connector from "./connector.js";
import data from "./mock-data.json" assert { type: "json" };
connector.mongo().then(async (connected) => {
  await jobsModel.deleteMany({});
  await jobsModel.create(data);
  console.log(data);
});
