import AWS from "aws-sdk";
import crypto from "crypto";
import { getConfig } from "../config.js";
import {
  PinpointClient,
  VerifyOTPMessageCommand,
} from "@aws-sdk/client-pinpoint";
const config = getConfig();

// export const verifyOtp = (mobileNumber, otp) => {
//   // Set your AWS credentials and region
//   AWS.config.update({
//     accessKeyId: config.ACCESSKEY_ID,
//     secretAccessKey: config.SECRETACCESSKEY,
//     region: "us-east-1",
//   });

//   function generateRefId(mobileNumber) {
//     const refId = "ZipCart" + mobileNumber;
//     const md5Hash = crypto.createHash("md5");
//     md5Hash.update(refId);
//     return md5Hash.digest("hex");
//   }

//   // Initialize AWS Pinpoint
//   const pinpoint = new AWS.Pinpoint();

//   var params = {
//     ApplicationId: config.APPLICATION_ID,
//     VerifyOTPMessageRequestParameters: {
//       DestinationIdentity: mobileNumber.toString(),
//       Otp: otp.toString(),
//       ReferenceId: generateRefId(mobileNumber),
//     },
//   };
//   pinpoint.verifyOTPMessage(params, function (err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else {
//       console.log(data);
//       return data;
//     }
//   });
// };

export const verifyOtpv2 = async (mobileNumber, otp) => {
  let reference = "zipcart" + "CreateAccount" + mobileNumber;
  const client = new PinpointClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: config.ACCESSKEY_ID,
      secretAccessKey: config.SECRETACCESSKEY,
    },
  });
  const input = {
    // VerifyOTPMessageRequest
    ApplicationId: config.APPLICATION_ID, // required
    VerifyOTPMessageRequestParameters: {
      // VerifyOTPMessageRequestParameters
      DestinationIdentity: mobileNumber, // required
      Otp: otp, // required
      ReferenceId: crypto.createHash("md5").update(reference).digest("hex"), // required
    },
  };
  const command = new VerifyOTPMessageCommand(input);
  const response = await client.send(command);
  console.log(response);
  return response;
};
