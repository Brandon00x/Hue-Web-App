const axios = require("axios");
const { hueIp, authToken } = require("./Private/config");

const lightsOn = { on: true, sat: 13, bri: 254, hue: 39392 };
const lightsOff = { on: false };

async function changeLight(lightNum, lightName, isGroup) {
  const apiGroupUrl = `${hueIp}/api/${authToken}/groups/${lightNum}/action`;
  const apiSingleUrl = `${hueIp}/api/${authToken}/lights/${lightNum}/state`;
  let url = isGroup === true ? apiGroupUrl : apiSingleUrl;

  let lightStats = [];
  let lightStatus = await getLightStatus(lightNum, isGroup);

  let res = await axios.put(url, lightStatus === true ? lightsOff : lightsOn);
  let newLightStatus1 = res.data[0];
  let newLightStatus2 = Object.values(newLightStatus1)[0];
  let newLightStatus = Object.values(newLightStatus2)[0];

  lightStats.push(lightNum, lightName, newLightStatus);
  if (newLightStatus) {
    let statusObj = Object.fromEntries(
      Object.entries(res.data).map(([k, v]) => [k, v])
    );

    let hue1 = Object.values(statusObj)[1];
    let hue2 = Object.values(hue1)[0];
    let hue3 = Object.values(hue2)[0];

    let sat1 = Object.values(statusObj)[2];
    let sat2 = Object.values(sat1)[0];
    let sat3 = Object.values(sat2)[0];

    let bri1 = Object.values(statusObj)[3];
    let bri2 = Object.values(bri1)[0];
    let bri3 = Object.values(bri2)[0];

    lightStats.push(hue3, sat3, bri3);
  }

  return lightStats;
}

async function getLightStatus(lightNum, isGroup) {
  // LightNum and Group Num are Same
  const apiGroupUrl = `${hueIp}/api/${authToken}/groups/${lightNum}/`;
  const apiSingleUrl = `${hueIp}/api/${authToken}/lights/${lightNum}/`;
  let url = isGroup === true ? apiGroupUrl : apiSingleUrl;
  let res = await axios.get(url);
  let lightData = res.data;

  let lightStatus =
    isGroup === true
      ? getGroupSingleLightStatus(lightData) //lightData.state.any_on
      : lightData.state.reachable;
  return lightStatus;
}

async function getGroupSingleLightStatus(lightData) {
  let groupStatus; // Set Status On if 1 light is on.

  // Get Status of Lights in Group
  for (let light of lightData.lights) {
    let groupLightStatus = await getLightStatus(light, false);
    // One or More Lights on
    if (groupLightStatus === true) {
      groupStatus = true;
    }
    // Lights are Off
    else {
      groupStatus = false;
    }
  }
  return groupStatus;
}

async function getAllLightsStatus(lights) {
  let lightStatus = [];

  for (let light in lights) {
    lightNum = lights[light][0];
    isGroup = lights[light][1];
    let lightValue = await getLightStatus(lightNum, isGroup);
    lightStatus.push({ lightName: light, lightNum: lightNum, on: lightValue });
  }
  return lightStatus;
}

module.exports = { changeLight, getAllLightsStatus };
