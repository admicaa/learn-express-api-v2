import router from "../../routes/api.js";

export default class RouteServiceProvider {
  constructor(app) {
    this.app = app;
    this.apiRoutes();
    return this.app;
  }
  apiRoutes() {
    if (this.app) {
      this.app.use("/api/v1/", router);
    } else {
      console.error(`Error, Cannot Find app`);
    }
  }
}
