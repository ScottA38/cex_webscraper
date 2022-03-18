const {applyBindings} = require('knockout');
const ScraperQuery = require('./model/query');
const vm = new ScraperQuery();
require('./style.scss');

var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos > currentScrollPos) {
    document.getElementById("search").style.top = "0";
  } else {
    document.getElementById("search").style.top = "-75px";
  }
  prevScrollpos = currentScrollPos;
}

applyBindings(vm)