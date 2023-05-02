import { checkSchema, validationResult } from "express-validator";
import jobsModel from "../models/jobs.model.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../../errors/bad-request.js";

class JobsController {
  async store(req, res) {
    await checkSchema({
      company: {
        notEmpty: true,
      },
      position: {
        notEmpty: true,
      },
    }).run(req);

    const results = validationResult(req);
    if (!results.isEmpty()) {
      throw new CustomAPIError(
        "Non-valid inputs",
        StatusCodes.UNPROCESSABLE_ENTITY,
        {
          errors: results.errors,
        }
      );
    }
    var job = await jobsModel.create({
      company: req.body.company,
      position: req.body.position,
      createdBy: req.user._id,
    });

    return res.status(StatusCodes.CREATED).json({
      job,
    });
  }

  async index(req, res) {
    var jobs = await jobsModel
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({
      jobs,
    });
  }

  async create(req, res) {
    return res.json();
  }
  async stats(req, res) {
    var defaultStats = await jobsModel.aggregate([
      { $match: { user_id: req.user.id } },
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    return res.send({
      defaultStats,
    });
  }
  async show(req, res) {
    const job = await jobsModel.findOne({
      createdBy: req.user._id,
      _id: req.params.id,
    });
    if (!job) {
      throw new BadRequestError("You Are Not Allowed to view this job");
    }
    return res.json({ job });
  }

  async update(req, res) {
    /*=============================================
    =            validation            =
    =============================================*/
    await checkSchema({
      company: {
        notEmpty: true,
      },
      position: {
        notEmpty: true,
      },
      status: {
        in: {
          options: ["interview", "declined", "pending"],
        },
      },
    }).run(req);
    const results = validationResult(req);
    if (!results.isEmpty()) {
      throw new CustomAPIError(
        "Non-valid inputs",
        StatusCodes.UNPROCESSABLE_ENTITY,
        {
          errors: results.errors,
        }
      );
    }

    /*=====  End of validation  ======*/

    var job = await jobsModel.findOneAndUpdate(
      {
        createdBy: req.user._id,
        _id: req.params.id,
      },
      {
        position: req.body.position,
        company: req.body.company,
        status: req.body.status,
      },
      { new: true }
    );
    return res.json({ job });
  }

  async destroy(req, res) {
    var job = await jobsModel.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!job) {
      throw new BadRequestError("You Are Not Allowed to delete this job");
    }
    await jobsModel.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    return res.json({ job });
  }
}

export default new JobsController();
