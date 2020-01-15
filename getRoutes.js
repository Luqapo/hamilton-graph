const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const girlsData = require('./data/girls');

const env = process.env.NODE_ENV || 'test';
const config = require('./config/config')[env];

const routes = {};

async function getRoute(from, to, departureTime) {
  const routeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=Katowice+${from}&destination=Katowice+${to}&mode=transit&departure_time=${departureTime}&key=${config.mapApiKey}`;
  const route = await fetch(routeUrl).then((res) => res.json());
  return route.routes[0].legs[0];
}

async function* getData(departureTime) {
  for(let j = 0; j < girlsData.points.length; j++) {
    const actualGirl = girlsData.points[j];
    routes[actualGirl.name] = {};
    for(let i = 0; i < girlsData.points.length; i++) {
      if(actualGirl.name !== girlsData.points[i].name) {
        // eslint-disable-next-line no-await-in-loop
        const route = await getRoute(actualGirl.location, girlsData.points[i].location, departureTime);
        routes[actualGirl.name][girlsData.points[i].name] = {
          details: route,
          duration: route.duration.value,
        };
        yield route.duration.value;
      }
    }
  }
}

// getRoute();

// eslint-disable-next-line consistent-return
async function getRoutesData() {
  const departureTime = new Date('Sun, 19 Jan 2020 07:00:00 GMT').getTime() / 1000;
  console.log('TCL: getRoutesData -> departureTime', departureTime);
  // eslint-disable-next-line no-restricted-syntax
  for await (const dur of getData(departureTime)) {
    console.log('Duration ->', dur);
  }
  fs.writeFileSync(path.join(__dirname, 'data', 'graph.json'), JSON.stringify(routes));
}

getRoutesData();
