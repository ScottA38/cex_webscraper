const https = require("https");
const http = require("http");
const PostcodesIO = require("postcodesio-client");
const postcodes = new PostcodesIO();

/**
 * @param  {object|string}  param
 * @param  {string} host
 * @param  {Boolean} isProdQry
 *
 * @return {URL}
 */
function constructPath(param, host, isProdQry) {
  if (isProdQry) {
    console.assert(typeof param == "string", `An incorrect data type of ${typeof param} was provided to construct a 'get products' url path`);
    let url = new URL(`/v3/boxes`, host);
    url.search = new URLSearchParams({
      q: param,
      firstRecord: 1,
      count: 50,
      sortBy: "relevance",
      sortOrder: "desc"
    });

    return url;
  }
  else {
    console.assert(typeof param == "object", `An incorrect data type of ${typeof param} was provided to construct a 'get nearest stores' url path`);
    let url = new URL(`/v3/boxes/${param.boxId}/neareststores`, host);
    url.search = new URLSearchParams({
      latitude: param.location[0].toString(),
      longitude: param.location[1].toString()
    });

    return url;
  }
}

/**
 * @param  {object|string} params
 * @param  {Boolean} isProdQry
 *
 * @return {string} JSON-formatted
 */
function getData(params, isProdQry) {
  let url = constructPath(params, "https://wss2.cex.uk.webuy.io", isProdQry);

  return fetch(url);
}

/**
 * @param  {URL} options
 *
 * @return {string}  JSON-formatted
 */
function fetch(url) {
  let reqModule = url.protocol === 'http:' ? http : https;

  return new Promise (function (resolve, reject) {
      reqModule.get(url.href, function(resp) {
        resp.setEncoding('utf8');
        let data = "";

        resp.on('data', function(chunk) {
          data += chunk;
        });

        resp.on('end', function() {
          resolve(data);
        })
      }).on("error", function (err) {
        reject(err);
    });
  });

}

/**
 * Per UK format
 * @param  {string} value
 *
 * @return {Boolean}
 */
function validatePostcode(value) {
  // inwards code (last 3), plus 1 for 0-index
  let splitIndex = value.length - 3;
  let o = value.substring(0, splitIndex);
  let i = value.substring(splitIndex);

  return value.length <= 7
    && value.length >= 5
    && !Number.isNan(o[(o.length - 1)])
    && !Number.isNan(i[0]);
}

/**
 * Find a postcode string via API
 * @param  {string} postcode
 *
 * @return {array}
 */
function geocoder(postcode) {
  return new Promise(function(resolve) {
    postcodes.lookup(postcode).then(function(geocode) {
      resolve([geocode.latitude, geocode.longitude]);
    })
    .catch(function(err) {
      console.error("There was a problem geocoding the postcode information: " + err.toString());
    })
  });
}

module.exports = {
  getData: getData,
  validatePostcode: validatePostcode,
  fetch: fetch,
  geocoder: geocoder
}
