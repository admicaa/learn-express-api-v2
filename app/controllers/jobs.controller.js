import { checkSchema, validationResult } from "express-validator";
import jobsModel from "../models/jobs.model.js";
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../../errors/bad-request.js";
import mongoose from "mongoose";
import moment from "moment";

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
    const query = { createdBy: req.user._id };
    const page = req.query.page || 1;
    const itemsPerPage = 10;
    const { search, status, jobType, sort } = req.query;
    if (search) {
      query.position = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (jobType && jobType !== "all") {
      query.jobType = jobType;
    }
    var sortkey = "";
    if (sort === "latest") {
      sortkey = "-createdAt";
    }
    if (sort === "oldest") {
      sortkey = "createdAt";
    }
    if (sort === "a-z") {
      sortkey = "position";
    }
    if (sort === "z-a") {
      sortkey = "-position";
    }

    const jobs = await jobsModel
      .find(query)
      .sort(sortkey)
      .limit(itemsPerPage)
      .skip((page - 1) * itemsPerPage);
    const totalJobs = await jobsModel.find(query).count();
    const numOfPages = parseInt(totalJobs / itemsPerPage);
    return res.json({
      jobs,
      totalJobs,
      numOfPages,
    });
  }

  async create(req, res) {
    return res.json();
  }
  async stats(req, res) {
    var stats = await jobsModel.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    stats = stats.reduce((acc, curr) => {
      const { _id: title, count } = curr;
      acc[title] = count;
      return acc;
    }, {});
    console.log(stats);
    var defaultStats = {
      pending: stats.pending,
      interview: stats.interview,
      declined: stats.declined,
    };
    var monthlyApplications = await jobsModel.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(req.user._id) } },

      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);
    monthlyApplications = monthlyApplications
      .map((item) => {
        const {
          _id: { year, month },
          count,
        } = item;
        const date = moment()
          .month(month - 1)
          .year(year)
          .format("MMM Y");
        return { date, count };
      })
      .reverse();
    return res.send({
      defaultStats,
      monthlyApplications,
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
        jobType: req.body.jobType,
        jobLocation: req.body.jobLocation,
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
