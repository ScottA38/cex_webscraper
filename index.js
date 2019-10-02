var readline = require("readline").createInterface( {
  input: process.stdin,
  output: process.stdout
})
var https = require("https");
var PostcodesIO = require("postcodesio-client");
var postcodes = new PostcodesIO();

var search_terms = undefined;

function askForTerms() {
  return new Promise( function (resolve, reject) {
    readline.question("Please enter the title of the dvd (or item) you would like to look for on CEX:\n>",function(terms) {
      /*readline.question("Do you want to continue with these terms? (Press enter if yes)\n>", function(reply) {
        if (reply != "\n") { process.exit();}
      })*/
      resolve(terms);
    })
  })
}

function askForLocation() {
  return new Promise(function (resolve, reject) {
    readline.resume();
    var result = {};
    readline.question("If you would like to check stock of a specific location, please copy and paste a product's 'boxId' from\nthe above results\n", function(response) {
      result.boxId = response;
      readline.question("What is the postcode of the location which you would like to check for store stock around?", function(response) {
        geocoder(response)
        .then(function(latlong) {
          result.location = latlong;
          resolve(result)
        });

      })
    })
  })
}

function constructPath(data, isProdQry) {
  if (isProdQry) {
    console.assert(typeof data == "string", `An incorrect data type of ${typeof data} was provided to construct a 'get products' url path`);
    return `/v3/boxes?q=${data}&firstRecord=1&count=50&sortBy=relevance&sortOrder=desc`
  }
  else {
    console.assert(typeof data == "object", `An incorrect data type of ${typeof data} was provided to construct a 'get nearest stores' url path`);
    return `/v3/boxes/${data.boxId}/neareststores?latitude=${data.location[0].toString()}&longitude=${data.location[1].toString()}`
  }
}

function getData(params, isProdQry) {
  return new Promise (function (resolve, reject) {
      let options = {
        hostname: "wss2.cex.uk.webuy.io",
        path: constructPath(params, isProdQry)
      }

      https.get(options, function(resp) {
        console.log(resp.statusCode);
        console.log(`Headers: ${JSON.stringify(resp.headers)}`);
        resp.setEncoding('utf8');
        let data = "";

        resp.on('data', function(chunk) {
          data += chunk;
        });

        resp.on('end', function() {
          //console.log(JSON.parse(data).explanation);
          resolve(data);
        })
      }).on("error", function (err) {
        reject(err);
    });
  });
}


function geocoder(postcode) {
  return new Promise(function(resolve, reject) {
    postcodes.lookup(postcode).then(function(geocode) {
      resolve([geocode.latitude, geocode.longitude]);
    })
    .catch(function(err) {
      console.log("There was a problem geocoding the postcode information: " + err.toString());
    })
  });
}


askForTerms()
.then(function(result){
  console.log(`Your search term/s is/are: ${result}`);
  let terms = encodeURIComponent(result);
  //pause, not close should allow the input stream to be resumed later if required
  readline.pause();

  getData(terms, true)
  .then(function (result) {
    console.log("resolved!");
    var respJSON = JSON.parse(result);
    //console.log(respJSON);
    //alias the product data of the response for simpler referencing
    let products = respJSON.response.data.boxes
    for (var i = 0; i <products.length; i++){
      console.log(products[i].boxId);
      console.log(products[i].boxName);
      console.log(products[i].boxName + " sells for: £" + products[i].sellPrice);
      console.log(products[i].boxName + " is bought in cash for: £" + products[i].cashPrice);
      console.log("The CEX system says that " + products[i].boxName + ` is ${products[i].outOfStock?"out of":"in"} stock in stores`);
      console.log("The CEX system says that " + products[i].boxName + ` is ${products[i].outOfEcomStock?"out of":"in"} stock online\n\n`);
    };
    askForLocation()
    .then(function(response) {
      console.log(response.boxId);
      console.log(response.location);
      readline.close();

      //ask for location information about location
      getData(response, false)
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
