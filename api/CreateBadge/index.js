const { createCanvas, loadImage } = require("canvas");
const { rename } = require("fs");
const querystring = require("querystring");

const templateWH = [394, 225];
const profilePictureStart = [22, 48];
const profilePictureWH = [97, 121];
const letterStart = [250, 205];

const multipart = require("parse-multipart-data");

badgeTemplateUrl = "https://i.imgur.com/50dOBYK.png";

const OktaJwtVerifier = require("@okta/jwt-verifier");

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: "https://dev-85415482.okta.com/oauth2/default",
});

const getAuthToken = (req) => {
  const header = req.headers["okta-authorization"];
  const tokenParts = header.split(" ");
  const token = tokenParts.length > 0 ? tokenParts[1] : "";

  return token;
};

const drawImage = async (req) => {

  const bodyBuffer = Buffer.from(req.body);
  const boundary = multipart.getBoundary(req.headers["content-type"]);
  const parts = multipart.parse(bodyBuffer, boundary); 

  const canvas = createCanvas(templateWH[0], templateWH[1]);
  const ctx = canvas.getContext("2d");

  // Ideally this Azure Function should call the `/userprofile` endpoint to get  
  // the user name instead of relying on the client to send it
  const firstLetter= parts.filter(r => r.name === "firstLetter")[0].data.toString();

  const template = await loadImage(badgeTemplateUrl);
  ctx.drawImage(template, 0, 0, templateWH[0], templateWH[1]);

  ctx.font = "68px Calibri";
  ctx.fillStyle = "#fff";
  ctx.fillText(firstLetter, letterStart[0], letterStart[1]);

  const profileImage = await loadImage(parts[0].data);
  ctx.drawImage(
    profileImage,
    profilePictureStart[0],
    profilePictureStart[1],
    profilePictureWH[0],
    profilePictureWH[1]
  );

  return canvas;
};

module.exports = async function (context, req) {
  const accessToken = getAuthToken(req);
  const jwt = await oktaJwtVerifier.verifyAccessToken(
    accessToken,
    "api://default"
  );

  const canvas = await drawImage(req);

  var stream = await canvas.pngStream();
  context.res.setHeader("Content-Type", "image/png");
  context.res.end(canvas.toBuffer("image/png"));
};