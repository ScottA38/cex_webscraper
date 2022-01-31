const {applyBindings} = require('knockout')
const ScraperQuery = require('./model/query')
const vm = new ScraperQuery()

applyBindings(vm)