// VARIABLE CONTAINING ARRAY OF LOCATION RESULTS AND BOOLEAN VARIABLE RECORDING CELSIUS VS FAHRENHEIT
let locationInfo;
let isCelsius = true;

// FUNCTION FOR TODAY'S WEATHER
async function getWeatherToday(location) {
  try {
    const data = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=648299d0737e4276acf143636232003&q=${location}&days=1&aqi=no&alerts=no`,
      { mode: "cors" }
    );
    const json = await data.json();
    const locationAPI = `${json.location.name}, ${json.location.country}`;
    const currentDateAndTime = json.current.last_updated;
    const regexTime = /(\d{2}):(\d{2})$/;
    let currentTime = currentDateAndTime.match(regexTime)[0];
    currentTime = convertTimeToAmPmString(currentTime, "long");

    const currentDateArray = currentDateAndTime.split("-");
    const currentDate = new Date(
      `${currentDateArray[0]}, ${currentDateArray[1]}, ${currentDateArray[2]}`
    );
    const currentDayOfWeek = currentDate.toLocaleString("en-us", {
      weekday: "short",
    });

    const condition = json.current.condition.text;
    const conditionIcon = json.current.condition.icon;
    const isDay = json.current.is_day;
    const temperatureCelsius = Math.round(json.current.temp_c);
    const temperatureFahrenheit = Math.round(json.current.temp_f);
    const precipitationChance =
      json.forecast.forecastday[0].day.daily_chance_of_rain;
    const humidity = json.current.humidity;
    const wind_kph = json.current.wind_kph;
    const wind_mph = json.current.wind_mph;

    return {
      location: locationAPI,
      currentTime: currentTime,
      currentDayOfWeek: currentDayOfWeek,
      condition: condition,
      conditionIcon: conditionIcon,
      isDay: isDay,
      temperatureCelsius: temperatureCelsius,
      temperatureFahrenheit: temperatureFahrenheit,
      precipitationChance: precipitationChance,
      humidity: humidity,
      wind_kph: wind_kph,
      wind_mph: wind_mph,
    };
  } catch (error) {
    console.log(`${error}`);
    console.log("Could not find the searched location");
  }
}

// FUNCTION FOR FORECASTED WEATHER FOR THE DAY (LOOKING AT MOST 21 HOURS AHEAD OF THE CURRENT TIME)(8 INCREMENTS OF 3HOURS)
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
    let nextHourTime = `${nextHour}:00`;

    const weatherEveryThreeHoursLibrary = [];
    for (
      let i = 0, forecastedHour = nextHour, currentDay = 0;
      i < 8;
      i++, forecastedHour += 3, nextHourTime = `${forecastedHour}:00`
    ) {
      if (forecastedHour > 23) {
        currentDay = 1;
        forecastedHour -= 24;
      }

      // Convert time to AM/PM syntax
      let forecastedHourAmPmConverted = convertTimeToAmPmString(
        nextHourTime,
        "short"
      );

      // Add weather for the current hour to the array of objects
      const obj = {};

      obj[`timeOfDay`] = forecastedHourAmPmConverted;
      obj[`tempCelsius`] = Math.round(
        json.forecast.forecastday[currentDay].hour[forecastedHour].temp_c
      );
      obj[`tempFahrenheit`] = Math.round(
        json.forecast.forecastday[currentDay].hour[forecastedHour].temp_f
      );
      weatherEveryThreeHoursLibrary.push(obj);
    }
    return weatherEveryThreeHoursLibrary;
  } catch (error) {
    console.log(`${error}`);
    console.log("Could not find the searched location");
  }
}

// FUNCTION FOR FORECASTED WEATHER IN THE UPCOMING DAYS
async function getWeatherForecastedDay(location) {
  try {
    const data = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=648299d0737e4276acf143636232003&q=${location}&days=8&aqi=no&alerts=no`,
      { mode: "cors" }
    );
    const json = await data.json();

    const WeatherDailyLibrary = [];
    for (let i = 0; i < 8; i++) {
      // Get day of the week
      const currentDateArray = json.forecast.forecastday[i].date.split("-");
      const currentDate = new Date(
        `${currentDateArray[0]}, ${currentDateArray[1]}, ${currentDateArray[2]}`
      );
      const dayOfWeek = currentDate.toLocaleString("en-us", {
        weekday: "short",
      });

      // Get forecasted condition code and temp of current day (high and low for both celsius and fahrenheit)
      let conditionIcon = json.forecast.forecastday[i].day.condition.icon;
      const regex = /(?<=\/)\d+(?=\.\w+$)/;
      const match = conditionIcon.match(regex);
      conditionIcon = match[0];

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

      // Add weather for the current day to the array of objects
      const obj = {};

      obj["conditionIcon"] = conditionIcon;
      obj["dayOfTheWeek"] = dayOfWeek;
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

// LOCATION INPUT FORM EVENT HANDLER FUNCTION
async function inputFormHandler(locationOnProgramStartup) {
  let location;
  const searchForm = document.querySelector("input");
  if (locationOnProgramStartup) {
    location = locationOnProgramStartup;
  } else {
    location = searchForm.value;
  }
  searchForm.value = "";

  // Resolve promises and finish with an array of processed data
  const promise1 = getWeatherToday(location);
  const promise2 = getWeatherForecastedTrihoral(location);
  const promise3 = getWeatherForecastedDay(location);
  const results = await Promise.all([promise1, promise2, promise3]);
  console.log("SUCCESS!!");
  return results;
}

// CHANGE UNITS TO BE USED DURING THE SESSION AND UPDATE DOM WITH VALUES WITH NEW UNITS
function changeUnits() {
  if (isCelsius) {
    isCelsius = false;
  } else {
    isCelsius = true;
  }
  AppendTemperatureAndWindSpeed();
}

// CONVERT TIME TO AM/PM SYNTAX
function convertTimeToAmPmString(currentTime, format) {
  const regexHour = /^\d+(?=:)/;
  const regexMinute = /(?<=:)\d+/;
  let currentHour = currentTime.match(regexHour)[0];
  const currentMinutes = currentTime.match(regexMinute)[0];
  let forecastedHourAmPmConverted;
  if (currentHour > 11 && currentHour < 24) {
    if (format === "short") {
      if (currentHour == 12) {
        forecastedHourAmPmConverted = `${currentHour}p.m.`;
      } else {
        forecastedHourAmPmConverted = `${currentHour - 12}p.m.`;
      }
    } else if (format === "long") {
      if (currentHour == 12) {
        forecastedHourAmPmConverted = `${currentHour}:${currentMinutes} p.m.`;
      } else {
        forecastedHourAmPmConverted = `${
          currentHour - 12
        }:${currentMinutes} p.m.`;
      }
    }
  } else if (currentHour == 24) {
    if (format === "short") {
      forecastedHourAmPmConverted = `${currentHour - 12}a.m.`;
    } else if (format === "long") {
      forecastedHourAmPmConverted = `${
        currentHour - 12
      }:${currentMinutes} a.m.`;
      forecastedHourAmPmConverted = `${
        currentHour - 12
      }:${currentMinutes} p.m.`;
    }
  } else if (currentHour > 24) {
    currentHour -= 24;
    if (format === "short") {
      forecastedHourAmPmConverted = `${currentHour}a.m.`;
    } else if (format === "long") {
      forecastedHourAmPmConverted = `${currentHour}:${currentMinutes} a.m.`;
    }
  } else {
    if (format === "short") {
      forecastedHourAmPmConverted = `${currentHour}a.m.`;
    } else if (format === "long") {
      forecastedHourAmPmConverted = `${currentHour}:${currentMinutes} a.m.`;
    }
  }
  return forecastedHourAmPmConverted;
}

// APPEND MAIN CONTENT TO THE DOM AND STYLE
function AppendMainContentAndStyle() {
  // Declare elements
  const rootStyles = window.getComputedStyle(document.documentElement);
  const nightContainerBackground = rootStyles.getPropertyValue(
    "--night-container-background"
  );
  const sunnyContainerBackground = rootStyles.getPropertyValue(
    "--sunny-container-background"
  );
  const fogContainerBackground = rootStyles.getPropertyValue(
    "--fog-container-background"
  );
  const overcastRainContainerBackground = rootStyles.getPropertyValue(
    "--overcast-rain-container-background"
  );
  const snowLighteningContainerBackground = rootStyles.getPropertyValue(
    "--snow-lightening-container-background"
  );
  const secondaryContentNightFontColor = rootStyles.getPropertyValue(
    "--secondary-content-night-font-color"
  );
  const secondaryContentSunnyFontColor = rootStyles.getPropertyValue(
    "--secondary-content-sunny-font-color"
  );
  const secondaryContentOvercastFontColor = rootStyles.getPropertyValue(
    "--secondary-content-overcast-font-color"
  );
  const secondaryContentFogFontColor = rootStyles.getPropertyValue(
    "--secondary-content-fog-font-color"
  );
  const secondaryContentRainFontColor = rootStyles.getPropertyValue(
    "--secondary-content-rain-font-color"
  );
  const secondaryContentSnowFontColor = rootStyles.getPropertyValue(
    "--secondary-content-snow-font-color"
  );
  const secondaryContentLighteningFontColor = rootStyles.getPropertyValue(
    "--secondary-content-lightening-font-color"
  );
  const background = document.querySelector("video");
  const contentWrapper = document.querySelector("#content-wrapper");
  const location = document.querySelector("#location");
  const block3 = document.querySelector(".block-3");
  const precipitationToday = document.querySelector(".precipitation-today");
  const humidityToday = document.querySelector(".humidity-today");
  const dayAndTimeToday = document.querySelector(".day-and-time-today");
  const conditionToday = document.querySelector(".condition-today");
  const time = document.querySelectorAll(".time");
  const timeIncrementTime1 = document.querySelector(".time-1");
  const timeIncrementTime2 = document.querySelector(".time-2");
  const timeIncrementTime3 = document.querySelector(".time-3");
  const timeIncrementTime4 = document.querySelector(".time-4");
  const timeIncrementTime5 = document.querySelector(".time-5");
  const timeIncrementTime6 = document.querySelector(".time-6");
  const timeIncrementTime7 = document.querySelector(".time-7");
  const timeIncrementTime8 = document.querySelector(".time-8");
  const dayOfWeek1 = document.querySelector(".day-1");
  const dayOfWeek2 = document.querySelector(".day-2");
  const dayOfWeek3 = document.querySelector(".day-3");
  const dayOfWeek4 = document.querySelector(".day-4");
  const dayOfWeek5 = document.querySelector(".day-5");
  const dayOfWeek6 = document.querySelector(".day-6");
  const dayOfWeek7 = document.querySelector(".day-7");
  const dayOfWeek8 = document.querySelector(".day-8");
  const iconDay1 = document.querySelector(".icon-1 > img");
  const iconDay2 = document.querySelector(".icon-2 > img");
  const iconDay3 = document.querySelector(".icon-3 > img");
  const iconDay4 = document.querySelector(".icon-4 > img");
  const iconDay5 = document.querySelector(".icon-5 > img");
  const iconDay6 = document.querySelector(".icon-6 > img");
  const iconDay7 = document.querySelector(".icon-7 > img");
  const iconDay8 = document.querySelector(".icon-8 > img");
  const tempDayLow = document.querySelectorAll(
    ".temperature-day > div:last-child"
  );

  // Append updated weather info to the dom
  // Change background
  if (!locationInfo[0].isDay) {
    background.setAttribute("src", `./images/backgrounds/night.mp4`);
    contentWrapper.style.backgroundColor = nightContainerBackground;
    block3.style.color = secondaryContentNightFontColor;
    dayAndTimeToday.style.color = secondaryContentNightFontColor;
    conditionToday.style.color = secondaryContentNightFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentNightFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentNightFontColor;
    });
  } else if (
    locationInfo[0].condition === "Sunny" ||
    locationInfo[0].condition === "Partly cloudy"
  ) {
    background.setAttribute("src", `./images/backgrounds/sunny.mp4`);
    contentWrapper.style.backgroundColor = sunnyContainerBackground;
    block3.style.color = secondaryContentSunnyFontColor;
    dayAndTimeToday.style.color = secondaryContentSunnyFontColor;
    conditionToday.style.color = secondaryContentSunnyFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentSunnyFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentSunnyFontColor;
    });
  } else if (
    locationInfo[0].condition === "Cloudy" ||
    locationInfo[0].condition === "Overcast"
  ) {
    background.setAttribute("src", `./images/backgrounds/overcast.mp4`);
    contentWrapper.style.backgroundColor = overcastRainContainerBackground;
    block3.style.color = secondaryContentOvercastFontColor;
    dayAndTimeToday.style.color = secondaryContentOvercastFontColor;
    conditionToday.style.color = secondaryContentOvercastFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentOvercastFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentOvercastFontColor;
    });
  } else if (
    locationInfo[0].condition === "Mist" ||
    locationInfo[0].condition === "Fog" ||
    locationInfo[0].condition === "Freezing Fog"
  ) {
    background.setAttribute("src", `./images/backgrounds/fog.mp4`);
    contentWrapper.style.backgroundColor = fogContainerBackground;
    block3.style.color = secondaryContentFogFontColor;
    dayAndTimeToday.style.color = secondaryContentFogFontColor;
    conditionToday.style.color = secondaryContentFogFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentFogFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentFogFontColor;
    });
  } else if (
    locationInfo[0].condition === "Patchy rain possible" ||
    locationInfo[0].condition === "Patchy rain possible" ||
    locationInfo[0].condition === "Patchy sleet possible" ||
    locationInfo[0].condition === "Patchy sleet possible" ||
    locationInfo[0].condition === "Patchy freezing drizzle possible" ||
    locationInfo[0].condition === "Patchy light drizzle" ||
    locationInfo[0].condition === "Light drizzle" ||
    locationInfo[0].condition === "Freezing drizzle" ||
    locationInfo[0].condition === "Heavy freezing drizzle" ||
    locationInfo[0].condition === "Patchy light rain" ||
    locationInfo[0].condition === "Light rain" ||
    locationInfo[0].condition === "Moderate rain at times" ||
    locationInfo[0].condition === "Moderate rain" ||
    locationInfo[0].condition === "Heavy rain at times" ||
    locationInfo[0].condition === "Heavy rain" ||
    locationInfo[0].condition === "Light freezing rain" ||
    locationInfo[0].condition === "Moderate or heavy freezing rain" ||
    locationInfo[0].condition === "Light sleet" ||
    locationInfo[0].condition === "Moderate or heavy sleet" ||
    locationInfo[0].condition === "Moderate or heavy sleet" ||
    locationInfo[0].condition === "Ice pellets" ||
    locationInfo[0].condition === "Light rain shower" ||
    locationInfo[0].condition === "Moderate or heavy rain shower" ||
    locationInfo[0].condition === "Torrential rain shower" ||
    locationInfo[0].condition === "Light sleet showers" ||
    locationInfo[0].condition === "Moderate or heavy sleet showers" ||
    locationInfo[0].condition === "Light showers of ice pellets" ||
    locationInfo[0].condition === "Moderate or heavy showers of ice pellets"
  ) {
    background.setAttribute("src", `./images/backgrounds/rain.mp4`);
    contentWrapper.style.backgroundColor = overcastRainContainerBackground;
    block3.style.color = secondaryContentRainFontColor;
    dayAndTimeToday.style.color = secondaryContentRainFontColor;
    conditionToday.style.color = secondaryContentRainFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentRainFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentRainFontColor;
    });
  } else if (
    locationInfo[0].condition === "Patchy light snow" ||
    locationInfo[0].condition === "Light snow" ||
    locationInfo[0].condition === "Patchy moderate snow" ||
    locationInfo[0].condition === "Moderate snow" ||
    locationInfo[0].condition === "Patchy heavy snow" ||
    locationInfo[0].condition === "Heavy snow" ||
    locationInfo[0].condition === "Heavy snow" ||
    locationInfo[0].condition === "Light snow showers" ||
    locationInfo[0].condition === "Moderate or heavy snow showers" ||
    locationInfo[0].condition === "Blowing snow" ||
    locationInfo[0].condition === "Blizzard"
  ) {
    background.setAttribute("src", `./images/backgrounds/snow.mp4`);
    contentWrapper.style.backgroundColor = snowLighteningContainerBackground;
    block3.style.color = secondaryContentSnowFontColor;
    dayAndTimeToday.style.color = secondaryContentSnowFontColor;
    conditionToday.style.color = secondaryContentSnowFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentSnowFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentSnowFontColor;
    });
  } else if (
    locationInfo[0].condition === "Patchy light rain with thunder" ||
    locationInfo[0].condition === "Moderate or heavy rain with thunder" ||
    locationInfo[0].condition === "Patchy light snow with thunder" ||
    locationInfo[0].condition === "Moderate or heavy snow with thunder"
  ) {
    background.setAttribute("src", `./images/backgrounds/lightening.mp4`);
    contentWrapper.style.backgroundColor = snowLighteningContainerBackground;
    block3.style.color = secondaryContentLighteningFontColor;
    dayAndTimeToday.style.color = secondaryContentLighteningFontColor;
    conditionToday.style.color = secondaryContentLighteningFontColor;
    time.forEach((element) => {
      element.style.color = secondaryContentLighteningFontColor;
    });
    tempDayLow.forEach((element) => {
      element.style.color = secondaryContentLighteningFontColor;
    });
  }

  // Change location
  location.textContent = locationInfo[0].location;

  // Today's weather icon
  const imgBlock1 = document.querySelector(".block-1 > img");
  const regex = /(?<=\/)\d+(?=\.\w+$)/;
  const match = locationInfo[0].conditionIcon.match(regex)[0];
  if (locationInfo[0].isDay) {
    imgBlock1.setAttribute("src", `./images/day/${match}.png`);
  } else {
    imgBlock1.setAttribute("src", `./images/night/${match}.png`);
  }

  // Today's weather block 3 info
  precipitationToday.textContent = `Precipitation: ${locationInfo[0].precipitationChance}%`;
  humidityToday.textContent = `Humidity: ${locationInfo[0].humidity}%`;

  // Today's weather block 4 info
  dayAndTimeToday.textContent = `${locationInfo[0].currentDayOfWeek} ${locationInfo[0].currentTime}`;
  conditionToday.textContent = `${locationInfo[0].condition}`;

  // Weather forecast trihoral times
  timeIncrementTime1.textContent = `${locationInfo[1][0].timeOfDay}`;
  timeIncrementTime2.textContent = `${locationInfo[1][1].timeOfDay}`;
  timeIncrementTime3.textContent = `${locationInfo[1][2].timeOfDay}`;
  timeIncrementTime4.textContent = `${locationInfo[1][3].timeOfDay}`;
  timeIncrementTime5.textContent = `${locationInfo[1][4].timeOfDay}`;
  timeIncrementTime6.textContent = `${locationInfo[1][5].timeOfDay}`;
  timeIncrementTime7.textContent = `${locationInfo[1][6].timeOfDay}`;
  timeIncrementTime8.textContent = `${locationInfo[1][7].timeOfDay}`;

  // Weather forecast daily times
  dayOfWeek1.textContent = `${locationInfo[2][0].dayOfTheWeek}`;
  dayOfWeek2.textContent = `${locationInfo[2][1].dayOfTheWeek}`;
  dayOfWeek3.textContent = `${locationInfo[2][2].dayOfTheWeek}`;
  dayOfWeek4.textContent = `${locationInfo[2][3].dayOfTheWeek}`;
  dayOfWeek5.textContent = `${locationInfo[2][4].dayOfTheWeek}`;
  dayOfWeek6.textContent = `${locationInfo[2][5].dayOfTheWeek}`;
  dayOfWeek7.textContent = `${locationInfo[2][6].dayOfTheWeek}`;
  dayOfWeek8.textContent = `${locationInfo[2][7].dayOfTheWeek}`;

  // Daily weather icons
  iconDay1.setAttribute(
    "src",
    `./images/day/${locationInfo[2][0].conditionIcon}.png`
  );
  iconDay2.setAttribute(
    "src",
    `./images/day/${locationInfo[2][1].conditionIcon}.png`
  );
  iconDay3.setAttribute(
    "src",
    `./images/day/${locationInfo[2][2].conditionIcon}.png`
  );
  iconDay4.setAttribute(
    "src",
    `./images/day/${locationInfo[2][3].conditionIcon}.png`
  );
  iconDay5.setAttribute(
    "src",
    `./images/day/${locationInfo[2][4].conditionIcon}.png`
  );
  iconDay6.setAttribute(
    "src",
    `./images/day/${locationInfo[2][5].conditionIcon}.png`
  );
  iconDay7.setAttribute(
    "src",
    `./images/day/${locationInfo[2][6].conditionIcon}.png`
  );
  iconDay8.setAttribute(
    "src",
    `./images/day/${locationInfo[2][7].conditionIcon}.png`
  );
}

// APPEND TEMPERATURE AND WIND SPEED DATA TO THE DOM
function AppendTemperatureAndWindSpeed() {
  // Declare elements
  const temperatureToday = document.querySelector(".temperature-today");
  const windToday = document.querySelector(".wind-today");
  const timeIncrementTemperature1 = document.querySelector(".temperature-1");
  const timeIncrementTemperature2 = document.querySelector(".temperature-2");
  const timeIncrementTemperature3 = document.querySelector(".temperature-3");
  const timeIncrementTemperature4 = document.querySelector(".temperature-4");
  const timeIncrementTemperature5 = document.querySelector(".temperature-5");
  const timeIncrementTemperature6 = document.querySelector(".temperature-6");
  const timeIncrementTemperature7 = document.querySelector(".temperature-7");
  const timeIncrementTemperature8 = document.querySelector(".temperature-8");
  const tempDay1High = document.querySelector(".temp-day-1 > div:first-child");
  const tempDay1Low = document.querySelector(".temp-day-1 > div:last-child");
  const tempDay2High = document.querySelector(".temp-day-2 > div:first-child");
  const tempDay2Low = document.querySelector(".temp-day-2 > div:last-child");
  const tempDay3High = document.querySelector(".temp-day-3 > div:first-child");
  const tempDay3Low = document.querySelector(".temp-day-3 > div:last-child");
  const tempDay4High = document.querySelector(".temp-day-4 > div:first-child");
  const tempDay4Low = document.querySelector(".temp-day-4 > div:last-child");
  const tempDay5High = document.querySelector(".temp-day-5 > div:first-child");
  const tempDay5Low = document.querySelector(".temp-day-5 > div:last-child");
  const tempDay6High = document.querySelector(".temp-day-6 > div:first-child");
  const tempDay6Low = document.querySelector(".temp-day-6 > div:last-child");
  const tempDay7High = document.querySelector(".temp-day-7 > div:first-child");
  const tempDay7Low = document.querySelector(".temp-day-7 > div:last-child");
  const tempDay8High = document.querySelector(".temp-day-8 > div:first-child");
  const tempDay8Low = document.querySelector(".temp-day-8 > div:last-child");

  // Today's weather temperature
  if (isCelsius) {
    temperatureToday.textContent = `${locationInfo[0].temperatureCelsius}°C`;
  } else {
    temperatureToday.textContent = `${locationInfo[0].temperatureFahrenheit}°F`;
  }

  // Today's weather wind speed
  if (isCelsius) {
    windToday.textContent = `Wind: ${locationInfo[0].wind_kph}Km/h`;
  } else {
    windToday.textContent = `Wind: ${locationInfo[0].wind_mph}mph`;
  }

  // Weather forecast trihoral
  if (isCelsius) {
    timeIncrementTemperature1.textContent = `${locationInfo[1][0].tempCelsius}°C`;
    timeIncrementTemperature2.textContent = `${locationInfo[1][1].tempCelsius}°C`;
    timeIncrementTemperature3.textContent = `${locationInfo[1][2].tempCelsius}°C`;
    timeIncrementTemperature4.textContent = `${locationInfo[1][3].tempCelsius}°C`;
    timeIncrementTemperature5.textContent = `${locationInfo[1][4].tempCelsius}°C`;
    timeIncrementTemperature6.textContent = `${locationInfo[1][5].tempCelsius}°C`;
    timeIncrementTemperature7.textContent = `${locationInfo[1][6].tempCelsius}°C`;
    timeIncrementTemperature8.textContent = `${locationInfo[1][7].tempCelsius}°C`;
  } else {
    timeIncrementTemperature1.textContent = `${locationInfo[1][0].tempFahrenheit}°F`;
    timeIncrementTemperature2.textContent = `${locationInfo[1][1].tempFahrenheit}°F`;
    timeIncrementTemperature3.textContent = `${locationInfo[1][2].tempFahrenheit}°F`;
    timeIncrementTemperature4.textContent = `${locationInfo[1][3].tempFahrenheit}°F`;
    timeIncrementTemperature5.textContent = `${locationInfo[1][4].tempFahrenheit}°F`;
    timeIncrementTemperature6.textContent = `${locationInfo[1][5].tempFahrenheit}°F`;
    timeIncrementTemperature7.textContent = `${locationInfo[1][6].tempFahrenheit}°F`;
    timeIncrementTemperature8.textContent = `${locationInfo[1][7].tempFahrenheit}°F`;
  }

  // Daily Temperatures
  if (isCelsius) {
    tempDay1High.textContent = `${locationInfo[2][0].maxTempCelsius}°C`;
    tempDay1Low.textContent = `${locationInfo[2][0].minTempCelsius}°C`;
    tempDay2High.textContent = `${locationInfo[2][1].maxTempCelsius}°C`;
    tempDay2Low.textContent = `${locationInfo[2][1].minTempCelsius}°C`;
    tempDay3High.textContent = `${locationInfo[2][2].maxTempCelsius}°C`;
    tempDay3Low.textContent = `${locationInfo[2][2].minTempCelsius}°C`;
    tempDay4High.textContent = `${locationInfo[2][3].maxTempCelsius}°C`;
    tempDay4Low.textContent = `${locationInfo[2][3].minTempCelsius}°C`;
    tempDay5High.textContent = `${locationInfo[2][4].maxTempCelsius}°C`;
    tempDay5Low.textContent = `${locationInfo[2][4].minTempCelsius}°C`;
    tempDay6High.textContent = `${locationInfo[2][5].maxTempCelsius}°C`;
    tempDay6Low.textContent = `${locationInfo[2][5].minTempCelsius}°C`;
    tempDay7High.textContent = `${locationInfo[2][6].maxTempCelsius}°C`;
    tempDay7Low.textContent = `${locationInfo[2][6].minTempCelsius}°C`;
    tempDay8High.textContent = `${locationInfo[2][7].maxTempCelsius}°C`;
    tempDay8Low.textContent = `${locationInfo[2][7].minTempCelsius}°C`;
  } else {
    tempDay1High.textContent = `${locationInfo[2][0].maxTempFahrenheit}°F`;
    tempDay1Low.textContent = `${locationInfo[2][0].minTempFahrenheit}°F`;
    tempDay2High.textContent = `${locationInfo[2][1].maxTempFahrenheit}°F`;
    tempDay2Low.textContent = `${locationInfo[2][1].minTempFahrenheit}°F`;
    tempDay3High.textContent = `${locationInfo[2][2].maxTempFahrenheit}°F`;
    tempDay3Low.textContent = `${locationInfo[2][2].minTempFahrenheit}°F`;
    tempDay4High.textContent = `${locationInfo[2][3].maxTempFahrenheit}°F`;
    tempDay4Low.textContent = `${locationInfo[2][3].minTempFahrenheit}°F`;
    tempDay5High.textContent = `${locationInfo[2][4].maxTempFahrenheit}°F`;
    tempDay5Low.textContent = `${locationInfo[2][4].minTempFahrenheit}°F`;
    tempDay6High.textContent = `${locationInfo[2][5].maxTempFahrenheit}°F`;
    tempDay6Low.textContent = `${locationInfo[2][5].minTempFahrenheit}°F`;
    tempDay7High.textContent = `${locationInfo[2][6].maxTempFahrenheit}°F`;
    tempDay7Low.textContent = `${locationInfo[2][6].minTempFahrenheit}°F`;
    tempDay8High.textContent = `${locationInfo[2][7].maxTempFahrenheit}°F`;
    tempDay8Low.textContent = `${locationInfo[2][7].minTempFahrenheit}°F`;
  }
}

function loadingScreenStart() {
  const loadingScreen = document.querySelector("#loading-screen");
  loadingScreen.style.display = "flex";
}

function loadingScreenFinish() {
  setTimeout(() => {
    const loadingScreen = document.querySelector("#loading-screen");
    loadingScreen.style.display = "none";
  }, 1000);
}

// FLOW CONTROL FUNCTION
async function flowControl(locationOnProgramStartup) {
  loadingScreenStart();
  const results = await inputFormHandler(locationOnProgramStartup);
  locationInfo = results;
  console.log(locationInfo);
  AppendMainContentAndStyle();
  AppendTemperatureAndWindSpeed();
  loadingScreenFinish();
}

// DEFAULT CITY WEATHER ON STARTUP (MONTREAL)
flowControl("Montreal");

// INPUT FORM EVENT LISTENER
let searchForm = document.querySelector("input");
searchForm.addEventListener("keypress", async (event) => {
  if (event.key === "Enter") {
    flowControl();
  }
});

// CHANGE UNITS EVENT LISTENER
const temperatureToday = document.querySelector(".temperature-today");
temperatureToday.addEventListener("click", changeUnits);
