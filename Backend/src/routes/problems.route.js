import express from "express";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  getAllProblemsSolvedByUser
} from "../controllers/probelms.controllers.js";
import { checkAdmin, verifyJWT } from "../middlewares/loggedin.middleware.js";


const problemRouter = express.Router();

problemRouter.post("/create-problem", verifyJWT, checkAdmin, createProblem);
problemRouter.get("/all-problems", verifyJWT, getAllProblems);
problemRouter.get("/getproblembyid/:problemid",verifyJWT, getProblemById);
problemRouter.put("/updateproblem/:problemid", verifyJWT, checkAdmin, updateProblem);
problemRouter.delete("/deleteproblem/:problemid", verifyJWT, checkAdmin, deleteProblem);
problemRouter.get("/problems-solved-by-user", verifyJWT, getAllProblemsSolvedByUser);



export default problemRouter;