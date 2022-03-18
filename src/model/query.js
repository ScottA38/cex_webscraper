const {observable, computed, observableArray} = require('knockout');
const functions = require('../lib/functions');
const currencyKeys = ['cashPrice', 'sellPrice'];

function ScraperQuery () {
  let self = this;

  // To be populated by user input
  self.title = observable(null);
  self.boxId = observable(null);
  // To be populated by user input
  self.postcode = observable(null);
  self.boxes = observableArray([]);

  self.currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: "currency",
    currency: "GBP"
  });

  self.titleSearch = computed(function() {
    if (self.title()) {
      let url = new URL('/findTitle', location);
      url.searchParams.set('title', self.title());
      functions.fetch(url, true)
      .then(function(result) {
        let data = JSON.parse(result);
        self.boxes([]);
        data.response.data.boxes.forEach(function(box) {
          currencyKeys.forEach(function (key) {
            if (Object.prototype.hasOwnProperty.call(box, key)) {
              box[key] = self.currencyFormatter.format(Number(box[key]));
            }
          });
          self.boxes.push(box)
        });
      })
    }
  }, self);

  self.getResultCount = computed(function() {
    let headingNode = document.createElement('strong');
    headingNode.innerHTML = "Results:";
    headingNode.className = "result-count-heading";

    return headingNode.outerHTML + self.boxes().length;
  }, self);
}

module.exports = ScraperQuery;