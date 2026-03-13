import express from "express";
import {executeCode} from "../controllers/codeExecution.controllers.js";
import { verifyJWT } from "../middlewares/loggedin.middleware.js";

const executeCodeRouter = express.Router();

executeCodeRouter.post("/", verifyJWT, executeCode);

export default executeCodeRouter;