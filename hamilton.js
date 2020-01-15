const routesData = require('./data/routes');

const result = [];

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
    if(distancesArray.length === 0) {
      return {
        duration: 666,
        name: 'end',
      };
    }
    inResult = result.find((x) => x.name === distancesArray[distancesArray.length -1].name);
    if(inResult) distancesArray.pop();
  } while(inResult);
  return distancesArray[distancesArray.length -1];
}

function hamilton() {
  let acualGirl = Object.keys(routesData).find((g) => !result.find((x) => x.name === g));
  while(result.length < 21) {
    const closesGirl = findNearestGirl(routesData[acualGirl]);
    result.push({
      name: acualGirl,
      duration: closesGirl.duration,
      nextGirl: closesGirl.name,
      steps: closesGirl.steps,
    });
    acualGirl = closesGirl.name;
  }
  Object.keys(result).forEach((r) => {
    console.log('From:', result[r].name);
    console.log('Travel to:', result[r].nextGirl);
    let transitTime = 0;
    let walkingTime = 0;
    result[r].steps.forEach((step) => {
      // console.log('Step ->', step);
      if(step.travel_mode === 'TRANSIT') {
        console.log('Transit line: ', step.transit_details.line.name);
        console.log('Departure time: ', step.transit_details.departure_time.text);
        console.log('Transit time: ', step.duration.text);
        console.log('mode of transportation : ', step.transit_details.line.vehicle.type);
        transitTime += step.duration.value;
      } else {
        console.log('Walking time: ', step.duration.text);
        walkingTime += step.duration.value;
      }
    });
    console.log('Overall waking time: ', walkingTime / 60);
    console.log('Overall transit time: ', transitTime / 60);
  });
  const sumDuration = result.reduce((acc, x) => acc + x.duration + (15 * 60), 0);
  console.log('SUM ->', sumDuration / 60 / 60);
}

hamilton();
