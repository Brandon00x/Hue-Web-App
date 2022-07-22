import React, { Component } from "react";
import axios from "axios";
import keys from "./private/keys";
import "./NavBar.css";

export default class NavBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: null,
      date: null,
      lat: keys.lat,
      lon: keys.lon,
      apiKey: keys.WeatherAPIKey,
      weatherDesc: null,
      temp: null,
      tempMax: null,
      tempMin: null,
      tempFeels: null,
      humidity: null,
      wind: null,
      windDirection: null,
      dayList1: null,
      dayList2: null,
      day1Temp: null,
      day2Temp: null,
      weekDay: null,
      dateString: null,
    };
    this.setTime = this.setTime.bind(this);
    this.setDate = this.setDate.bind(this);
    this.setWeekDay = this.setWeekDay.bind(this);
    this.getWeatherFiveDay = this.getWeatherFiveDay.bind(this);
    this.getWeather = this.getWeather.bind(this);
    this.updateData = this.updateData.bind(this);
  }

  async componentDidMount() {
    this.setTime();
    this.setDate();
    this.setWeekDay();
    this.getWeather();
    this.getWeatherFiveDay();
    this.updateData();
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);
    clearInterval(this.dateInterval);
    clearInterval(this.updateWeather);
  }

  updateData() {
    this.timeInterval = setInterval(() => {
      this.setTime();
    }, 1000);
    this.dateInterval = setInterval(() => {
      this.setTime();
    }, 1000);
    this.updateWeather = setInterval(() => {
      this.setWeekDay();
      this.getWeather();
      this.getWeatherFiveDay();
    }, 600000); // Every 10 Minutes
  }

  setTime() {
    this.setState({ time: new Date().toLocaleTimeString() });
  }

  setDate() {
    this.setState({ date: new Date().toDateString() });
  }

  async setWeekDay() {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Nov",
      "Dec",
    ];

    let d = new Date();
    this.day = d.getDate();
    this.weekday = weekdays[d.getDay()];
    this.month = months[d.getMonth()];
    this.year = d.getFullYear();
    this.dateString = [this.day + " " + this.month + " " + this.year];

    let j = -1;
    let returnArray = [];

    for (let i = 0; i < 5; i++) {
      let futureDay = weekdays[d.getDay() + i];
      if (futureDay !== undefined) {
        returnArray.push(futureDay);
      } else {
        j++;
        let wrapFutureDay = weekdays[j];
        returnArray.push(wrapFutureDay);
      }
    }
    //Return Array Values
    this.dayList1 = returnArray[1].slice(0, 3);
    this.dayList2 = returnArray[2].slice(0, 3);

    this.setState({
      dayList1: this.dayList1,
      dayList2: this.dayList2,
      weekDay: this.weekday,
      dateString: this.dateString,
    });
  }

  getWeather = async () => {
    Promise.resolve()
      .then(async () => {
        const res = await axios.get(
          `http://api.openweathermap.org/data/2.5/weather?lat=${this.state.lat}&lon=${this.state.lon}&appid=${this.state.apiKey}`
        );
        let data = res.data;
        return data;
      })
      .then((data) => {
        console.log(data);
        this.weatherMain = data.weather[0].main;
        //let weatherDesc = data.weather[0].description;
        this.temp = (1.8 * (data.main.temp - 273) + 32).toFixed(0) + "°F";
        this.tempMax =
          (1.8 * (data.main.temp_max - 273) + 32).toFixed(0) + "°F";
        this.tempMin =
          (1.8 * (data.main.temp_min - 273) + 32).toFixed(0) + "°F";
        this.tempFeels =
          (1.8 * (data.main.feels_like - 273) + 32).toFixed(0) + "°F";
        this.humidity = data.main.humidity + "% RH";
        this.location = data.name;
        this.windDirection = data.wind.deg;
        this.wind = data.wind.speed + " MPH";

        this.setState({
          temp: this.temp,
          tempMax: this.tempMax,
          tempMin: this.tempMin,
          tempFeels: this.tempFeels,
          humidity: this.humidity,
          wind: this.wind,
          windDirection: this.windDirection,
          weatherDesc: this.weatherMain,
          // weatherIcon: this.weatherIcon,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  getWeatherFiveDay = async () => {
    const res = await axios.get(
      `http://api.openweathermap.org/data/2.5/forecast?lat=${this.state.lat}&lon=${this.state.lon}&appid=${this.state.apiKey}`
    );
    let data = res.data;
    let temp1 = [];
    let temp2 = [];
    let day1 = new Date().getDay();
    let day2 = new Date().getDay() + 1;

    for (let i = 0; i < data.list.length; i++) {
      let date = new Date(data.list[i].dt * 1000);
      let temp = (((data.list[i].main.temp_max - 273.15) * 9) / 5 + 32).toFixed(
        0
      );
      if (date.getDay() === day1) {
        temp1.push(temp);
      } else if (date.getDay() === day2) {
        temp2.push(temp);
      }
    }

    this.dayList1Weather = Math.max(...temp1) + "°F";
    this.dayList2Weather = Math.max(...temp2) + "°F";

    this.setState({
      dayList1Weather: this.dayList1Weather,
      dayList2Weather: this.dayList2Weather,
    });
  };

  render() {
    return (
      <div className="navBar">
        <div id="weather">
          <div className="weatherCurrentTemp">
            {this.state.temp}
            <div className="weatherDescription">{this.state.weatherDesc}</div>
          </div>
          <div className="weatherFeels">
            Feels Like: <br /> {this.state.tempFeels}
          </div>
          <div className="weatherRange">
            <div>High: {this.state.tempMax}</div>
            <div>Low: {this.state.tempMin}</div>
          </div>
          <div className="weatherWeek">
            <div className="weatherWeekTop">
              <div className="weatherNextDays">
                {this.state.dayList1}: {this.state.dayList1Weather}
              </div>
              <div className="weatherNextDays">
                {this.state.dayList2}: {this.state.dayList2Weather}
              </div>
            </div>
            <div className="weatherWeekBot">
              <div className="weatherNextDays">
                Humidity: {this.state.humidity}
              </div>
              <div className="weatherNextDays">
                Wind: {this.state.wind}
                <div
                  style={{
                    transform: `rotate(${this.state.windDirection}deg)`,
                    display: "inline-block",
                    marginLeft: "1vw",
                  }}
                >
                  {"V"}
                </div>
              </div>
            </div>
          </div>
        </div>
        <span id="time">
          {this.state.time} <br />
          {this.state.date}
        </span>
      </div>
    );
  }
}
