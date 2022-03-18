var readline = require("readline").createInterface( {
  input: process.stdin,
  output: process.stdout
})

const dataHelper = require('./src/lib/functions.js')

function askForTerms() {
  return new Promise( function (resolve) {
    readline.question("Please enter the title of the dvd (or item) you would like to look for on CEX:\n>",function(terms) {
      resolve(terms);
    })
  })
}

function askForLocation() {
  return new Promise(function (resolve) {
    readline.resume();
    var result = {};
    readline.question("If you would like to check stock of a specific location, please copy and paste a product's 'boxId' from\nthe above results\n", function(response) {
      result.boxId = response;
      readline.question("What is the postcode of the location which you would like to check for store stock around?", function(response) {
        dataHelper.geocoder(response)
        .then(function(latlong) {
          result.location = latlong;
          resolve(result)
        });

      })
    })
  })
}

askForTerms()
.then(function(result){
  console.log(`Your search term/s is/are: ${result}`);
  let terms = encodeURIComponent(result);
  //pause, not close should allow the input stream to be resumed later if required
  readline.pause();

  dataHelper.getData(terms, true)
  .then(function (result) {
    console.log("resolved!");
    var respJSON = JSON.parse(result);
    //alias the product data of the response for simpler referencing
    let products = respJSON.response.data.boxes
    for (var i = 0; i < products.length; i++){
      console.log(products[i].boxId);
      console.log(products[i].boxName);
      console.log(products[i].boxName + " sells for: £" + products[i].sellPrice);
      console.log(products[i].boxName + " is bought in cash for: £" + products[i].cashPrice);
      console.log("The CEX system says that " + products[i].boxName + ` is ${products[i].outOfStock?"out of":"in"} stock in stores`);
      console.log("The CEX system says that " + products[i].boxName + ` is ${products[i].outOfEcomStock?"out of":"in"} stock online\n\n`);
    }

    askForLocation()
    .then(function(response) {
      console.log(response.boxId);
      console.log(response.location);
      readline.close();

      //ask for location information about location
      dataHelper.getData(response, false)
      .then(function(result) {
        console.log(JSON.parse(result));
      })
      .catch(function(err){
        console.log("Error occurred getting data for nearest store locations: " + err.toString());
      })
    })
    .catch(function(err) {
      console.log("Failed to take location and product ID, error: " + err.toString());
    })
  })
  .catch(function (reason) {
    console.log(`Failed to GET cex web page, reason: ${reason}`);
  })
});
