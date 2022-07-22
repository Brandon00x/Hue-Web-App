const axios = require("axios");
const { hueIp, authToken } = require("./Private/config");

const lightsOn = { on: true, sat: 13, bri: 254, hue: 39392 };
const lightsOff = { on: false };

async function changeLight(lightNum, lightName, isGroup) {
  let lightStats = [];
  const apiGroupUrl = `${hueIp}/api/${authToken}/groups/${lightNum}/action`;
  const apiSingleUrl = `${hueIp}/api/${authToken}/lights/${lightNum}/state`;
  let url = isGroup === true ? apiGroupUrl : apiSingleUrl;

  // Get Light Status
  let status = await getLightStatus(lightNum, isGroup);

  // Turn Light(s) On or Off
  let setLightValue = status[1] === true ? lightsOff : lightsOn;
  await axios.put(url, setLightValue);

  lightStats.push(lightNum, lightName, !status[1]);
  return lightStats;
}

// Get Light Reachable Status and On Off Status
async function getLightStatus(lightNum, isGroup) {
  let status = [];
  const apiGroupUrl = `${hueIp}/api/${authToken}/groups/${lightNum}/`;
  const apiSingleUrl = `${hueIp}/api/${authToken}/lights/${lightNum}/`;

  let url = isGroup === true ? apiGroupUrl : apiSingleUrl;
  let res = await axios.get(url);
  let lightData = res.data;

  // Light Reachable
  let lightReachable =
    isGroup === true
      ? await getGroupSinglelightReachable(lightData) // Recursively Get Each Light Status
      : lightData.state.reachable;

  // Light On/Off
  let lightOn =
    isGroup === true
      ? await getGroupSinglelightReachable(lightData) // Recursively Get Each Light Status
      : lightData.state.on;

  status.push(lightReachable, lightOn);
  if (isGroup) {
  }
  return status;
}

//Recursively Gets Group Light Status of each light
async function getGroupSinglelightReachable(lightData) {
  let groupStatus; // Set Status On if 1 light is on.
  let i = 0;

  // Get Status of Lights in Group
  for (let light of lightData.lights) {
    let lightStatus = await getLightStatus(light, false);

    // Lights are On
    if (lightStatus[1] === true) {
      groupStatus = true;
      break;
    } else if (lightStatus[0] === true) {
      groupStatus = "reachable";
    }
    // Lights are Off
    else {
      groupStatus = false;
    }
    i++;
  }

  return groupStatus;
}

async function getAllLightsStatus(lights) {
  let lightReachable = [];
  for (let light in lights) {
    lightNum = lights[light][0];
    isGroup = lights[light][1];
    let lightValue = await getLightStatus(lightNum, isGroup);
    lightReachable.push({
      lightName: light,
      lightNum: lightNum,
      on: lightValue[1],
      reachable: lightValue[0],
    });
  }
  return lightReachable;
}

module.exports = { changeLight, getAllLightsStatus };

// Future Brightness Controls
// if (lightStatus) {
//   let statusObj = Object.fromEntries(
//     Object.entries(res.data).map(([k, v]) => [k, v])
//   );

//   let hue1 = Object.values(statusObj)[1];
//   let hue2 = Object.values(hue1)[0];
//   let hue3 = Object.values(hue2)[0];

//   let sat1 = Object.values(statusObj)[2];
//   let sat2 = Object.values(sat1)[0];
//   let sat3 = Object.values(sat2)[0];

//   let bri1 = Object.values(statusObj)[3];
//   let bri2 = Object.values(bri1)[0];
//   let bri3 = Object.values(bri2)[0];

//   lightStats.push(hue3, sat3, bri3);
// }
