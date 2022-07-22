import React, { Component } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import "./Home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lightsOn: "green",
      lightsOff: "red",
    };
    this.handleClick = this.handleClick.bind(this);
    this.sendLightRequest = this.sendLightRequest.bind(this);
    this.dimScreen = this.dimScreen.bind(this);
    this.getLightStatus = this.getLightStatus.bind(this);
    this.getLightStatusInterval = this.getLightStatusInterval.bind(this);
  }

  componentDidMount() {
    this.getLightStatus();
    this.getLightStatusInterval();
  }

  componentWillUnmount() {
    clearInterval(this.checkStatusInterval);
  }

  async getLightStatusInterval() {
    this.checkStatusInterval = setInterval(async () => {
      this.getLightStatus();
    }, 10000);
  }

  async getLightStatus() {
    this.res = await axios.get("/api/lightstatus");
    this.lightStatus = this.res.data;

    for (let i = 0; i < this.lightStatus.length; i++) {
      // Set Status Color Green - On
      if (
        this.lightStatus[i].on === true &&
        this.lightStatus[i].reachable === true
      ) {
        document
          .getElementById(this.lightStatus[i].lightName)
          .setAttribute("style", "background-color: green");
      }
      // Set Status Color Reachable
      else if (
        this.lightStatus[i].reachable === true ||
        this.lightStatus[i].reachable === "reachable"
      ) {
        document
          .getElementById(this.lightStatus[i].lightName)
          .setAttribute("style", "background-color: dodgerblue");
      }
      // Set Status Color Off Not Reachable
      else {
        document
          .getElementById(this.lightStatus[i].lightName)
          .setAttribute("style", "background-color: red");
      }
    }
  }

  handleClick(e) {
    this.light = e.target.id;
    this.isGroup = e.target.value;
    this.sendLightRequest(this.light, this.isGroup);
  }

  async dimScreen(e) {
    // this.brightness = "0"; //e.target.value;
    // this.res = await axios.post(`/api/brightness`, {
    //   data: this.brightness,
    // });
  }

  async sendLightRequest(light, isGroup) {
    this.res = await axios.post(`/api/lights`, {
      data: light,
      isGroup: isGroup,
    });
    this.getLightStatus();
  }

  render() {
    return (
      <div className="homePage">
        <NavBar />
        <div className="homeButtonsContainer">
          <div className="homeButtons">
            <button
              id="bedroom1"
              className="homeButton"
              onClick={this.handleClick}
            >
              West Bed Table
            </button>
            <button
              id="bedroom2"
              className="homeButton"
              onClick={this.handleClick}
            >
              East Bed Table
            </button>
            <button
              className="homeButton"
              id="bedroom3"
              onClick={this.handleClick}
            >
              Desk Light
            </button>
            <button
              className="homeButton"
              id="bedroom4"
              onClick={this.handleClick}
            >
              Closet Light
            </button>
          </div>
          <div className="homeButtons">
            <button
              className="homeButton"
              id="bath1"
              onClick={this.handleClick}
            >
              Bathroom Light 1
            </button>
            <button
              className="homeButton"
              id="bath2"
              onClick={this.handleClick}
            >
              Bathroom Light 2
            </button>
            <button
              className="homeButton"
              id="bath3"
              onClick={this.handleClick}
            >
              Bathroom Light 3
            </button>
            <button
              id="group2"
              className="homeButton"
              onClick={this.handleClick}
            >
              Bathroom
            </button>
          </div>
          <div className="homeButtons">
            <button
              id="group1"
              className="homeButton"
              onClick={this.handleClick}
            >
              Bedroom
            </button>
            <button
              className="homeButton"
              id="group3"
              onClick={this.handleClick}
            >
              Basement
            </button>
            <button
              className="homeButton"
              id="basement1"
              onClick={this.handleClick}
            >
              Basement Recliner
            </button>
            <button
              className="homeButton"
              id="basement2"
              onClick={this.handleClick}
            >
              Basement Loveseat
            </button>
          </div>
        </div>
        {/* <button
          className="disableScreen"
          id="screenBrightness"
          onClick={this.dimScreen}
        >
          Turn Off Screen
        </button> */}
      </div>
    );
  }
}
