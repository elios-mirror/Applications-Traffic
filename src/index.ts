const Request = require('request');

const elios_sdk = require('elios-sdk');

const sdk = new elios_sdk.default();

export default class Traffic {
  name: string = '';
  installId: string = '';

  requireVersion: string = '0.0.1';
  showOnStart: boolean = true;

  widget: any;
  it: any;

  secondsConverter(number:any, unit:any) {
    let d, h, m, s;

    if (unit === 'sec' || unit === 'seconds') {
      s = number
    } else if (unit === 'ms' || unit === 'milliseconds' || !unit) {
      s = Math.floor(number / 1000)
    }

    m = Math.floor(s / 60)
    s = s % 60
    h = Math.floor(m / 60)
    m = m % 60
    d = Math.floor(h / 24)
    h = h % 24

    return {days: d, hours: h, minutes: m, seconds: s}
  }

  render(departureAddress:string, arrivalAddress:string) {
    let late = require("./img/arrow-up.svg");
    var latlngStart:any;
    var latlngEnd:any;

    console.log(departureAddress);
    console.log(arrivalAddress);

    if (departureAddress == "" || arrivalAddress == "") {
      this.widget.html("<div style=\"text-align:center;\"><p style=\"font-size:35px;font-weight:bold;margin:-10px;\">Please set a departure and an arrival address.</p></div>");
    } else {
      Request("https://api.opencagedata.com/geocode/v1/json?q=" + departureAddress + "&key=03df20db789a46bd9af2b14cf499d1e1&language=en&pretty=1", (error: any, response: any, body: any) => {
        if (error)
        console.log('error : ', error);
        let responseBody = JSON.parse(body);
        if (responseBody.total_results == 0)
        this.widget.html("<div style=\"text-align:center;\"><p style=\"font-size:25px;font-weight:bold;\">Invalid departure address.</p></div>");
        else {
          latlngStart = [responseBody.results[0].geometry.lat, responseBody.results[0].geometry.lng];

          Request("https://api.opencagedata.com/geocode/v1/json?q=" + arrivalAddress + "&key=03df20db789a46bd9af2b14cf499d1e1&language=en&pretty=1", (error: any, response: any, body: any) => {
            if (error)
            console.log('error : ', error);

            let responseBody = JSON.parse(body);
            if (responseBody.total_results == 0)
            this.widget.html("<div style=\"text-align:center;\"><p style=\"font-size:25px;font-weight:bold;\">Invalid arrival address.</p></div>");
            else {
              latlngEnd = [responseBody.results[0].geometry.lat, responseBody.results[0].geometry.lng];

              Request("https://api.tomtom.com/routing/1/calculateRoute/" + latlngStart[0] + "," + latlngStart[1] + ":" + latlngEnd[0] + "," + latlngEnd[1] + "/jsonp?routeType=fastest&traffic=true&avoid=unpavedRoads&travelMode=car&key=gB6pn6hyZhOirdd4l8LpeEdcf1vQGezs", (error: any, response: any, body: any) => {
                if (error)
                console.log('error : ', error);

                let responseBody = JSON.parse(JSON.stringify(response)).body;

                let travelTime = JSON.stringify(JSON.parse(JSON.stringify(responseBody).substr(10, JSON.stringify(responseBody).length - 12).split('\\').join('')).routes[0].summary.travelTimeInSeconds);

                const convertedTravelTime = this.secondsConverter(+travelTime, "sec");

                if (convertedTravelTime.days > 0)
                this.widget.html("<div style=\"text-align:center;\"><p style=\"font-size:35px;font-weight:bold;margin:-10px;\"><img style=\"margin-right:10px;height:30px;\" src=\"" + late + "\"/>" + convertedTravelTime.days + " d " + convertedTravelTime.hours + " h " + convertedTravelTime.minutes + " m </p><p>" + arrivalAddress + "</p></div>");
                else if (convertedTravelTime.hours > 0)
                this.widget.html("<div style=\"text-align:center;\"><p style=\"font-size:35px;font-weight:bold;margin:-10px;\"><img style=\"margin-right:10px;height:30px;\" src=\"" + late + "\"/>" + convertedTravelTime.hours + " h " + convertedTravelTime.minutes + " m </p><p>" + arrivalAddress + "</p></div>");
                else
                this.widget.html("<div style=\"text-align:center;\"><p style=\"font-size:35px;font-weight:bold;margin:-10px;\"><img style=\"margin-right:10px;height:30px;\" src=\"" + late + "\"/>" + convertedTravelTime.minutes + " m </p><p>" + arrivalAddress + "</p></div>");
              });
            }
          });
        }
      });
    }
  }

  constructor() {
    console.log('Traffic constructor.');
  }

  start() {
    console.log('Traffic started.');

    let arrivalAddress = "";
    let departureAddress = "";

    this.widget = sdk.createWidget();

    sdk.config().subscribe((config:any) => {
      if (config.Departure)
      departureAddress = config.Departure;
      if (config.Arrival)
      arrivalAddress = config.Arrival;

      this.render(departureAddress, arrivalAddress);
    });

    setInterval(() => {
      this.render(departureAddress, arrivalAddress);
    }, 1800000); //30 min refresh
  }
}

const traffic = new Traffic();

traffic.start();
