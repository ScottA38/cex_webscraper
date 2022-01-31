const {observable, computed, observableArray} = require('knockout')
const functions = require('../lib/functions')
const url = require('url')

function ScraperQuery () {
  let self = this;

  // To be populated by user input
  self.title = observable(null);
  self.boxId = observable(null);
  // To be populated by user input
  self.postcode = observable(null);
  self.boxes = observableArray([]);

  self.titleSearch = computed(function() {
    if (self.title()) {
      let url = new URL('/findTitle', location);
      url.searchParams.set('title', self.title());
      functions.fetch(url, true)
      .then(function(result) {
        let respJSON = JSON.parse(result)
        respJSON.response.data.boxes.forEach(function(box) {
          self.boxes.push(box)
        });
      })
    }
  }, self);
}

module.exports = ScraperQuery;