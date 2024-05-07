import  express  from "express";
import { appVersion } from "../config.js"

const router =  express.Router();

router.route("/").get(async (req,res)=>{
  try {
    res.send(`Hello World ${appVersion}`);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
