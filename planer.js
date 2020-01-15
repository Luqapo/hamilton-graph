const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const girlsData = require('./data/girls');

const env = process.env.NODE_ENV || 'test';
const config = require('./config/config')[env];

// const routes = {};
const result = [];

async function getRoute(from, to, departureTime) {
  const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=Katowice+${from}&destination=Katowice+${to}&mode=transit&&departure_time=${departureTime}&key=${config.mapApiKey}`;
  const route = await fetch(routeUrl).then((res) => res.json());
  return route.routes[0].legs[0];
}

async function* getData(actualGirlName, actualTime) {
  const actualGirl = girlsData.points.find((g) => g.name === actualGirlName);
  const routes = {};
  for(let i = 0; i < girlsData.points.length; i++) {
    if(actualGirl.name !== girlsData.points[i].name) {
      // eslint-disable-next-line no-await-in-loop
      const route = await getRoute(actualGirl.location, girlsData.points[i].location, actualTime);
      routes[girlsData.points[i].name] = {
        details: route,
        duration: route.duration.value,
      };
    }
  }
  yield routes;
}

// getRoute();

// eslint-disable-next-line consistent-return
async function getRoutesData(actualGirl, actualTime) {
  // eslint-disable-next-line no-restricted-syntax
  for await (const routes of getData(actualGirl, actualTime)) {
    return routes;
  }
}

function findNearestGirl(routes) {
  const distancesArray = Object
    .keys(routes).map((r) => ({
      duration: routes[r].duration,
      name: r,
      steps: routes[r].details.steps,
    }));
  distancesArray.sort((a, b) => b.duration - a.duration);
  let inResult;
  do {
    if(result.length === 20) {
      return distancesArray.find((i) => i.name === 'Dworzec');
    }
    inResult = result.find((x) => x.name === distancesArray[distancesArray.length -1].name);
    if(inResult) distancesArray.pop();
  } while(inResult);
  return distancesArray[distancesArray.length -1];
}

async function* hamilton() {
  let actualGirl = girlsData.points.find((g) => g.name === 'Dworzec').name;
  console.log('TCL: function*hamilton -> actualGirl', actualGirl);
  let actualTime = new Date('Sun, 19 Jan 2020 07:00:00 GMT').getTime() / 1000;
  while(result.length < 21) {
    console.log('Actual Time ->', new Date(actualTime * 1000));
    // eslint-disable-next-line no-await-in-loop
    const routes = await getRoutesData(actualGirl, actualTime);
    const closesGirl = findNearestGirl(routes);
    const girlsTime = 15 * 60;
    const bestPath = {
      name: actualGirl,
      duration: closesGirl.duration,
      nextGirl: closesGirl.name,
      steps: closesGirl.steps,
      girlsTime,
    };
    result.push(bestPath);
    actualGirl = closesGirl.name;
    actualTime += girlsTime + closesGirl.duration;
    yield bestPath;
  }
}

async function getHamilton() {
  // eslint-disable-next-line no-restricted-syntax
  for await (const bestPath of hamilton()) {
    console.log('Best path ->', bestPath);
  }
  fs.writeFileSync(path.join(__dirname, 'data', 'routes.json'), JSON.stringify(result));
  const sumTravelDuration = result.reduce((acc, x) => acc + x.duration, 0);
  console.log('SUM TRavel->', sumTravelDuration / 60 / 60);
  const sumGirlsDuration = result.reduce((acc, x) => acc + x.girlsTime, 0);
  console.log('SUM Girls->', sumGirlsDuration / 60 / 60);
}

getHamilton();
