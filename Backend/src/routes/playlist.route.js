import express from "express";
import {
  createPlaylist,
  getAllPlayListDetails,
  getPlayListDetails,
  updatePlaylist,
  deletePlayList,
  addProblemToPlaylist,
  removeProblemFromPlaylist
} from "../controllers/playlist.controllers.js";
import{verifyJWT} from "../middlewares/loggedin.middleware.js";

const playListRouter = express.Router();
playListRouter.get("/" , verifyJWT , getAllPlayListDetails)

playListRouter.get("/:playlistId" , verifyJWT , getPlayListDetails)

playListRouter.post("/create-playlist" ,verifyJWT ,  createPlaylist)


playListRouter.post('/:playlistId/add-problem' , verifyJWT , addProblemToPlaylist)

playListRouter.delete("/:playlistId" , verifyJWT , deletePlayList)

playListRouter.delete("/:playlistId/remove-problem" , verifyJWT , removeProblemFromPlaylist)

playListRouter.put("/:playlistId" , verifyJWT , updatePlaylist)

export default playListRouter;