import multer from "multer";
import multerS3 from "multer-s3";
import { getConfig } from "../config.js";
import AWS from "aws-sdk";
import { User } from "../models/users.js";

const config = getConfig();
const myBucket = "elasticbeanstalk-us-east-1-860030919883";

AWS.config.update({
  credentials: {
    accessKeyId: config.ACCESSKEY_ID,
    secretAccessKey: config.SECRETACCESSKEY,
  },
  region: "us-east-1",
});

let s3 = new AWS.S3();
const s3Storage = multerS3({
  s3: s3,
  bucket: myBucket,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const userId = req.user._id;
    const imageName = file.originalname;
    var fileName = "";
    let regex = new RegExp(/\.[^/.]+$/);
    let UpdatedfileName = imageName.replace(regex, "");

    switch (UpdatedfileName) {
      case "vehicle":
        fileName = `${userId}` + "." + `vehicleImage`;

        break;
      case "numberPlate":
        fileName = `${userId}` + "." + ` vehicleNumberPlate`;

        break;
      case "driver":
        fileName = `${userId} ` + "." + `driverImage`;

        break;
      case "drivingLicense":
        fileName = `${userId}` + "." + `licenseImage`;

        break;
    }

    cb(null, `${fileName}`);
  },
});

function sanitizeFile(file, cb) {
  const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

  const isAllowedMimeType = file.mimetype.startsWith("image/");

  if (isAllowedMimeType) {
    return cb(null, true);
  } else {
    cb("Error: File type not allowed!");
  }
}

export const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    sanitizeFile(file, callback);
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});
