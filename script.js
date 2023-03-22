async function getWeatherToday(location) {
  try {
    const data = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=648299d0737e4276acf143636232003&q=${location}&aqi=no`,
      { mode: "cors" }
    );
    const json = await data.json();
    const locationAPI = json.location.name;
    const condition = json.current.condition.text;
    const temperatureCelsius = Math.round(json.current.temp_c);
    const temperatureFahrenheit = Math.round(json.current.temp_f);
    const feelsLike_c = Math.round(json.current.feelslike_c);
    const feelsLike_f = Math.round(json.current.feelslike_f);
    const precipitation_mm = json.current.precip_mm;
    const precipitation_in = json.current.precip_in;
    const humidity = json.current.humidity;
    const wind_kph = json.current.wind_kph;
    const wind_mph = json.current.wind_mph;

    // console.log(`WEATHER TODAY`);
    // console.log(locationAPI);
    // console.log(condition);
    // console.log(`Temperature: ${temperatureCelsius}°C`);
    // console.log(`Temperature: ${temperatureFahrenheit}°F`);
    // console.log(`Feels like: ${feelsLike_c}°C`);
    // console.log(`Feels like: ${feelsLike_f}°F`);
    // console.log(`Precipitation: ${precipitation_mm}mm`);
    // console.log(`Precipitation: ${precipitation_in}in`);
    // console.log(`Humidity: ${humidity}%`);
    // console.log(`Wind: ${wind_kph}km/h`);
    // console.log(`Wind: ${wind_mph}Mi/h`);

    return {
      location: locationAPI,
      condition: condition,
      temperatureCelsius: temperatureCelsius,
      temperatureFahrenheit: temperatureFahrenheit,
      feelsLikeCelsius: feelsLike_c,
      feelsLikeFahrenheit: feelsLike_f,
      precipitation_mm: precipitation_mm,
      precipitation_in: precipitation_in,
      humidity: humidity,
      wind_kph: wind_kph,
      wind_mph: wind_mph,
    };
  } catch (error) {
    console.log(`${error}`);
    console.log("Could not find the searched location");
  }
}

// Function for forecasted weather for the day (Looking at most 21 hours ahead of the current time)(8 increments of 3hours)
async function getWeatherForecastedTrihoral(location) {
  try {
    const data = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=648299d0737e4276acf143636232003&q=${location}&days=2&aqi=no&alerts=no`,
      { mode: "cors" }
    );
    const json = await data.json();
    const currentDateAndTime = json.current.last_updated;
    const re = /(?<=\s)\d+(?=:)/;
    const currentHour = Number(currentDateAndTime.match(re)[0]);

    //Temperature forecast of every three hours (starting from the hour that is closest to the current time)
    const nextHour = currentHour + 1;

    // console.log("WEATHER FORECAST TRIHORAL FOR THE NEXT 22 HOURS");

    const weatherEveryThreeHoursLibrary = [];
    for (
      let i = 0, forecastedHour = nextHour, currentDay = true;
      i < 8;
      i++, forecastedHour += 3
    ) {
      // Convert time to AM/PM syntax
      let forecastedHourAmPmConverted;
      if (forecastedHour > 12 && forecastedHour < 24) {
        forecastedHourAmPmConverted = `${forecastedHour - 12} p.m.`;
      } else if (forecastedHour >= 24) {
        forecastedHour -= 24;
        currentDay = false;
        forecastedHourAmPmConverted = `${forecastedHour} a.m.`;
      } else {
        forecastedHourAmPmConverted = `${forecastedHour} a.m.`;
      }

      // Log to console
      //   if (currentDay) {
      //     console.log(
      //       `${forecastedHourAmPmConverted}: ${Math.round(
      //         json.forecast.forecastday[0].hour[forecastedHour].temp_c
      //       )}°C, ${Math.round(
      //         json.forecast.forecastday[0].hour[forecastedHour].temp_f
      //       )}°F`
      //     );
      //   } else {
      //     console.log(
      //       `${forecastedHourAmPmConverted}: ${Math.round(
      //         json.forecast.forecastday[1].hour[forecastedHour].temp_c
      //       )}°C, ${Math.round(
      //         json.forecast.forecastday[1].hour[forecastedHour].temp_f
      //       )}°F`
      //     );
      //   }

      // Add weather for the current hour to the array of objects
      const obj = {};

      obj[`Time of Day`] = forecastedHourAmPmConverted;

      obj[`Temp Celsius`] = Math.round(
        json.forecast.forecastday[0].hour[forecastedHour].temp_c
      );

      obj[`Temp Fahrenheit`] = Math.round(
        json.forecast.forecastday[0].hour[forecastedHour].temp_f
      );

      weatherEveryThreeHoursLibrary.push(obj);
    }

    return weatherEveryThreeHoursLibrary;
  } catch (error) {
    console.log(`${error}`);
    console.log("Could not find the searched location");
  }
}

// Function for forecasted weather in the upcoming days
async function getWeatherForecastedDay(location) {
  try {
    const data = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=648299d0737e4276acf143636232003&q=${location}&days=8&aqi=no&alerts=no`,
      { mode: "cors" }
    );
    const json = await data.json();

    // console.log("WEATHER FORECASTED DAILY FOR THE NEXT 7 DAYS");

    const WeatherDailyLibrary = [];
    for (let i = 0; i < 8; i++) {
      // Get day of the week
      const currentDateArray = json.forecast.forecastday[i].date.split("-");
      const currentDate = new Date(
        `${currentDateArray[0]}, ${currentDateArray[1]}, ${currentDateArray[2]}`
      );
      const dayOfWeek = currentDate.toLocaleString("en-us", {
        weekday: "long",
      });

      // Get forecasted temp of current day (high and low for both celsius and fahrenheit)
      const maxTempCelsius = Math.round(
        json.forecast.forecastday[i].day.maxtemp_c
      );
      const minTempCelsius = Math.round(
        json.forecast.forecastday[i].day.mintemp_c
      );
      const maxTempFahrenheit = Math.round(
        json.forecast.forecastday[i].day.maxtemp_f
      );
      const minTempFahrenheit = Math.round(
        json.forecast.forecastday[i].day.mintemp_f
      );

      // Log data to console
      //   console.log(
      //     `${dayOfWeek}: ${maxTempCelsius}°C ${maxTempFahrenheit}°F, ${minTempCelsius}°C ${minTempFahrenheit}°F`
      //   );

      // Add weather for the current day to the array of objects
      const obj = {};

      obj[`Day of the Week`] = dayOfWeek;
      obj["maxTempCelsius"] = maxTempCelsius;
      obj["minTempCelsius"] = minTempCelsius;
      obj["maxTempFahrenheit"] = maxTempFahrenheit;
      obj["minTempFahrenheit"] = minTempFahrenheit;

      WeatherDailyLibrary.push(obj);
    }
    return WeatherDailyLibrary;
  } catch (error) {
    console.log(`${error}`);
    console.log("Could not find the searched location");
  }
}

// Location input form event handler function
async function inputFormHandler(event) {
  if (event.key === "Enter") {
    const location = searchForm.value;
    searchForm.value = "";
    // Wrap these functions in a promise.all function. Also, the functions need to return objects with the required data,
    // and the promise.all function will return an array of all of the required data?

    const promise1 = getWeatherToday(location);
    const promise2 = getWeatherForecastedTrihoral(location);
    const promise3 = getWeatherForecastedDay(location);

    // Resolve promises and finish with an array of processed data
    const results = await Promise.all([promise1, promise2, promise3]);
    console.log("SUCCESS!!");
    console.log(results);
  }
}

// Input form event listener
let searchForm = document.querySelector("input");
searchForm.addEventListener("keypress", inputFormHandler);
