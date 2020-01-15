const fs = require('fs');
const path = require('path');
const routesGraph = require('./data/routes.json');

Object.keys(routesGraph).forEach((r) => {
  fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), `Start point: ${routesGraph[r].name} \n`);
  routesGraph[r].steps.forEach((step) => {
    if(step.travel_mode === 'WALKING') {
      fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), `Walking: ${step.duration.text} \n`);
    } else if(step.travel_mode === 'TRANSIT') {
      fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), `Transit: ${step.duration.text}, line: ${step.transit_details.line.name}, departure: ${step.transit_details.departure_time.text}, transit type: ${step.transit_details.line.vehicle.type} \n`);
    }
  });
  fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), `Time with ${routesGraph[r].name}: ${routesGraph[r].girlsTime / 60} min \n`);
});
fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), 'End point: Dworzec \n');
const sumTravelDuration = routesGraph.reduce((acc, x) => acc + x.duration, 0);
const sumGirlsDuration = routesGraph.reduce((acc, x) => acc + x.girlsTime, 0);
fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), `Time with girls: ${sumGirlsDuration / 60 / 60} hours \n`);
fs.appendFileSync(path.join(__dirname, 'results', 'results.txt'), `Travel time: ${sumTravelDuration / 60 / 60} hours \n`);
