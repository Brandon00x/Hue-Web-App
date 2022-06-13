const express = require("express");
const app = express();
const cors = require("cors");
const exec = require("child_process").exec;
const bodyParser = require("body-parser");
const { changeLight, getAllLightsStatus } = require("./lightController");

// Light Name: [LightNumber/GroupNumber, isGroup]
const lights = {
  bedroom1: [11, false], // West of Bed
  bedroom2: [14, false], // East of Bed
  bedroom3: [7, false], // Desk Lamp
  bedroom4: [15, false], // Closet
  bath1: [1, false],
  bath2: [2, false],
  bath3: [4, false],
  basement1: [12, false],
  basement2: [13, false],
  group1: [1, true], // Bedroom - All Lights
  group2: [6, true], // Bathroom - All Lights
  group3: [3, true], // Basement - All Lights
};
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors());
app.use(bodyParser.json());

// Screen Brightness
app.post("/api/brightness", cors(corsOptions), async (req, res) => {
  let brightness = await req.body.brightness;
  console.log(`Set Brightness to ${brightness}`);
  setBrightness(brightness);
  res.send(`Set Brightness to ${brightness}`);
});

// Light Request
app.post("/api/lights", cors(corsOptions), async (req, res) => {
  try {
    let requestedLight = await req.body.data;
    let isGroup;
    let lightNum;
    let lightName;
    for (let light in lights) {
      if (light === requestedLight) {
        lightNum = lights[light][0];
        isGroup = lights[light][1];
        lightName = light;
      }
    }
    let lightStatus = await changeLight(lightNum, lightName, isGroup);
    res.send(lightStatus);
  } catch (err) {
    console.error(err.message);
  }
});

app.get("/api/lightstatus", cors(corsOptions), async (req, res) => {
  let lightStatus = await getAllLightsStatus(lights);
  res.send(lightStatus);
});

app.listen(3001, () => {
  console.info(`Server Listening on 3001.`);
});
