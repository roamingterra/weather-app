// VARIABLE CONTAINING ARRAY OF LOCATION RESULTS AND BOOLEAN VARIABLE RECORDING CELSIUS VS FAHRENHEIT
let locationInfo;
let lastLocation;
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
    console.log(`Error fetching todays weather for this location ${error}`);
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
    console.log(json);
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

      // Get hourly forecasted condition icon code
      let conditionIcon =
        json.forecast.forecastday[currentDay].hour[forecastedHour].condition
          .icon;
      const regex = /(?<=\/)\d+(?=\.\w+$)/;
      const match = conditionIcon.match(regex);
      conditionIcon = match[0];

      // Add weather, isDay info, and condition icon for the current hour to the array of objects
      const obj = {};

      obj[`tempCelsius`] = Math.round(
        json.forecast.forecastday[currentDay].hour[forecastedHour].temp_c
      );
      obj[`tempFahrenheit`] = Math.round(
        json.forecast.forecastday[currentDay].hour[forecastedHour].temp_f
      );
      obj["conditionIcon"] = conditionIcon;
      obj[`timeOfDay`] = forecastedHourAmPmConverted;
      obj[`isDay`] =
        json.forecast.forecastday[currentDay].hour[forecastedHour].is_day;
      weatherEveryThreeHoursLibrary.push(obj);
    }
    return weatherEveryThreeHoursLibrary;
  } catch (error) {
    console.log(
      `Error fetching forecasted hourly weather for this location ${error}`
    );
  }
}

// LOCATION INPUT FORM EVENT HANDLER FUNCTION
async function inputFormHandler(locationOnProgramStartup) {
  try {
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
    const results = await Promise.all([promise1, promise2]);
    return results;
  } catch (error) {
    console.log(`Error fetching weather data: ${error}`);
  }
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
  } else if (currentHour == 0) {
    if (format === "short") {
      forecastedHourAmPmConverted = `${12} a.m.`;
    } else if (format === "long") {
      forecastedHourAmPmConverted = `${12}:${currentMinutes} a.m.`;
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
      forecastedHourAmPmConverted = `${Number(currentHour)}a.m.`;
    } else if (format === "long") {
      forecastedHourAmPmConverted = `${Number(
        currentHour
      )}:${currentMinutes} a.m.`;
    }
  }
  return forecastedHourAmPmConverted;
}

// APPEND MAIN CONTENT TO THE DOM AND STYLE
function AppendMainContentAndStyle() {
  console.log(locationInfo);
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
  const iconHour1 = document.querySelector(".icon-1 > img");
  const iconHour2 = document.querySelector(".icon-2 > img");
  const iconHour3 = document.querySelector(".icon-3 > img");
  const iconHour4 = document.querySelector(".icon-4 > img");
  const iconHour5 = document.querySelector(".icon-5 > img");
  const iconHour6 = document.querySelector(".icon-6 > img");
  const iconHour7 = document.querySelector(".icon-7 > img");
  const iconHour8 = document.querySelector(".icon-8 > img");
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

  // Weather forecast trihoral condition icons
  if (locationInfo[1][0].isDay) {
    iconHour1.setAttribute(
      "src",
      `./images/day/${locationInfo[1][0].conditionIcon}.png`
    );
  } else {
    iconHour1.setAttribute(
      "src",
      `./images/night/${locationInfo[1][0].conditionIcon}.png`
    );
  }
  if (locationInfo[1][1].isDay) {
    iconHour2.setAttribute(
      "src",
      `./images/day/${locationInfo[1][1].conditionIcon}.png`
    );
  } else {
    iconHour2.setAttribute(
      "src",
      `./images/night/${locationInfo[1][1].conditionIcon}.png`
    );
  }
  if (locationInfo[1][2].isDay) {
    iconHour3.setAttribute(
      "src",
      `./images/day/${locationInfo[1][2].conditionIcon}.png`
    );
  } else {
    iconHour3.setAttribute(
      "src",
      `./images/night/${locationInfo[1][2].conditionIcon}.png`
    );
  }
  if (locationInfo[1][3].isDay) {
    iconHour4.setAttribute(
      "src",
      `./images/day/${locationInfo[1][3].conditionIcon}.png`
    );
  } else {
    iconHour4.setAttribute(
      "src",
      `./images/night/${locationInfo[1][3].conditionIcon}.png`
    );
  }
  if (locationInfo[1][4].isDay) {
    iconHour5.setAttribute(
      "src",
      `./images/day/${locationInfo[1][4].conditionIcon}.png`
    );
  } else {
    iconHour5.setAttribute(
      "src",
      `./images/night/${locationInfo[1][4].conditionIcon}.png`
    );
  }
  if (locationInfo[1][5].isDay) {
    iconHour6.setAttribute(
      "src",
      `./images/day/${locationInfo[1][5].conditionIcon}.png`
    );
  } else {
    iconHour6.setAttribute(
      "src",
      `./images/night/${locationInfo[1][5].conditionIcon}.png`
    );
  }
  if (locationInfo[1][6].isDay) {
    iconHour7.setAttribute(
      "src",
      `./images/day/${locationInfo[1][6].conditionIcon}.png`
    );
  } else {
    iconHour7.setAttribute(
      "src",
      `./images/night/${locationInfo[1][6].conditionIcon}.png`
    );
  }
  if (locationInfo[1][7].isDay) {
    iconHour8.setAttribute(
      "src",
      `./images/day/${locationInfo[1][7].conditionIcon}.png`
    );
  } else {
    iconHour8.setAttribute(
      "src",
      `./images/night/${locationInfo[1][7].conditionIcon}.png`
    );
  }

  // Weather forecast trihoral times
  timeIncrementTime1.textContent = `${locationInfo[1][0].timeOfDay}`;
  timeIncrementTime2.textContent = `${locationInfo[1][1].timeOfDay}`;
  timeIncrementTime3.textContent = `${locationInfo[1][2].timeOfDay}`;
  timeIncrementTime4.textContent = `${locationInfo[1][3].timeOfDay}`;
  timeIncrementTime5.textContent = `${locationInfo[1][4].timeOfDay}`;
  timeIncrementTime6.textContent = `${locationInfo[1][5].timeOfDay}`;
  timeIncrementTime7.textContent = `${locationInfo[1][6].timeOfDay}`;
  timeIncrementTime8.textContent = `${locationInfo[1][7].timeOfDay}`;
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
}

function loadingScreenStart() {
  const loadingScreen = document.querySelector("#loading-screen");
  loadingScreen.style.display = "flex";
  loadingScreen.style.width = "100%";
  loadingScreen.style.height = "100%";
}

function loadingScreenFinish() {
  setTimeout(() => {
    const loadingScreen = document.querySelector("#loading-screen");
    loadingScreen.style.display = "none";
    loadingScreen.style.width = "0";
    loadingScreen.style.height = "0";
  }, 1000);
}

// FLOW CONTROL FUNCTION
async function flowControl(locationOnProgramStartup) {
  loadingScreenStart();
  locationInfo = await inputFormHandler(locationOnProgramStartup);
  if (locationInfo[0] === undefined && locationInfo[1] === undefined) {
    flowControl(lastLocation);
  }
  AppendMainContentAndStyle();
  AppendTemperatureAndWindSpeed();
  loadingScreenFinish();

  // Store new location into this variable for use when user searches for a miss-typed location next time
  lastLocation = locationInfo[0].location;
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
