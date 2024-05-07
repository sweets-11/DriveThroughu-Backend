import crypto from "crypto";
import { getConfig } from "../config.js";
import {
  PinpointClient,
  SendOTPMessageCommand,
} from "@aws-sdk/client-pinpoint"; // ES Modules import

const config = getConfig();

const client = new PinpointClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: config.ACCESSKEY_ID,
    secretAccessKey: config.SECRETACCESSKEY,
  },
});

export const sendOtpv2 = async (mobileNumber) => {
  let reference = "zipcart" + "CreateAccount" + mobileNumber;
  const input = {
    // SendOTPMessageRequest
    ApplicationId: config.APPLICATION_ID, // required
    SendOTPMessageRequestParameters: {
      // SendOTPMessageRequestParameters
      AllowedAttempts: Number(3),
      BrandName: "ZipCart", // required
      Channel: "SMS", // required
      CodeLength: Number(6),
      DestinationIdentity: mobileNumber, // required
      EntityId: "zipcart",
      Language: "en-US",
      OriginationIdentity: "919111818196", // required
      ReferenceId: crypto.createHash("md5").update(reference).digest("hex"), // required
      TemplateId: "zipcart",
      ValidityPeriod: Number(15),
    },
  };
  const command = new SendOTPMessageCommand(input);
  const response = await client.send(command);
  console.log(response);
  return response;
};

// export const sendOtp = (mobileNumber) => {
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

//     console.log("At the end of ref id function");
//     return md5Hash.digest("hex");
//   }

//   // Initialize AWS Pinpoint
//   const pinpoint = new AWS.Pinpoint();

//   console.log("Initialized AWS Pinpoint");

//   var params = {
//     ApplicationId: config.APPLICATION_ID,
//     SendOTPMessageRequestParameters: {
//       BrandName: "ZipCart",
//       Channel: "SMS",
//       DestinationIdentity: mobileNumber,
//       OriginationIdentity: "919111818196",
//       ReferenceId: generateRefId(mobileNumber),
//       AllowedAttempts: 3,
//       CodeLength: 6,
//       EntityId: "zipcart",
//       Language: "en-US",
//       TemplateId: "zipcart",
//       ValidityPeriod: 15,
//     },
//   };

//   pinpoint.sendOTPMessage(params, function (err, data) {
//     console.log("inside");
//     if (err) {
//       return false; // an error occurred
//     } else return data.MessageResponse.Result; // successful response
//   });
// };
