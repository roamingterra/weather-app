# weather-app

A small web application putting into practice what I've learned so far with regards to asynchronous code and APIs

In this project, I am pulling data from weatherapi which can be accessed from the following link: https://www.weatherapi.com/

Here are a list of steps I took to complete this project:

1. Write functions to get info from the api and start by logging the info to the console
2. Make these functions process the data and return an object
3. Set up a simple form for the user to enter a location to have the info be logged to the console
4. Write up the html and css to flesh out a proper looking app
5. Add a loading component as extra credit

Context:
I originally took inspiration from the google search engines weather section for the look of the app. I went with this to limit the scope of the project to only include few key pieces of info regarding the weather of the location in question. I was then inspired by the IOS weather app to add dynamic backgrounds that change depending on the weather conditions, and to give my website a sleek, eye catching design. Finally, a note on the responsive aspect of this web site. I originally set a couple of parameters when coming up with the look of the site, one of which is as follows: I wanted everything to be on the view port and not be scrollable. This meant that I had to make it so that as the window would shrink, the content that would overflow would be hidden and scrollable in the horizontal direction. This was done, like limiting the amount of info shown on the app, to limit the scope fo the project to be completed in a reasonable time. Now looking at this with hindsight, this obviously does not look as good as it would if the content would wrap as the window shrinks and make it scrollable. Changing the responsive design to make the app scrollable in the vertical direction can be a future potential improvement.

Future potential improvements:

1. Make the app scrollable in the vertical direction rather than in the horizontal direction. In other words, take more inspirations from the layout of the data shown in the IOS weather app.

2. The time that is shown as actually just the time of last update from the api and not the actual time. This was a small thing that I let slide to the end of the project, and decided to make it a future improvement.

3. Add more info such as a feels like temperature, which I find to be very important, but I skipped out on it for now.

4. Show the country abbreviated code rather than the country. I thought of doing this while fixing the logic of my code, but I decided that this would take too long for now. My idea is to Make a JSON file with a list of all the countries and their respective country codes, then have the js file sift through the JSON file for the appropriate country code before adding it to the dom.

**_ April 6 2023 UPDATE _**
Because my free trial for weatherapi expired, I no longer have access to forecasted data for more than 3 days, which completely rendered my daily forecast section entirely useless. For this update, I therefor removed this section entirely. Because there were weather condition icons in this section, which gave the app a lot of depth, I decided to add weather condition icons to the trihoral forecast section. The cool thing about these icons is that they are the appropriate day or night icons depending on the time of day. Finally, I updated replaced the rain.mp4 with a better quality one, which was able to be pushed through to github and looks more clear, and I cropped the lightening.mp4 background, to remove a certain portion of the video that is unnecessary.

**_ June 26 2023 UPDATE _**
The site was not working on safari. The reason for this was that I was previously using lookbehind assertions in my regex expressions, which are not supported by the browser. I therefore converted all of these expressions to ones without lookbehind assertions. The site can now be viewed on Safari. Additionally, the dynamic backgrounds were not playing on safari IOS. To remedy this, I added the playsinline attribute to the video tag.
