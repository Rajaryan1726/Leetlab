import express from "express";
import{getAllSubmission, getSubmissionsForProblem, getAllSubmissionsForProblem} from "../controllers/submission.controllers.js";
import { verifyJWT } from "../middlewares/loggedin.middleware.js";
const submissionsRouter = express.Router();

submissionsRouter.get("/get-all-submissions" , verifyJWT   , getAllSubmission);
submissionsRouter.get("/get-submission/:problemId" , verifyJWT  , getSubmissionsForProblem)
submissionsRouter.get("/get-submissions-count/:problemId" , verifyJWT  , getAllSubmissionsForProblem)



export default submissionsRouter;
