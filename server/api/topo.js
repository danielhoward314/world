const router = require('express').Router()
const path = require('path')
module.exports = router

router.get('/', async (req, res, next) => {
  console.log("inside handleGetJson");
  fetch(`../../public/custom.geo.json`, {
      headers : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       }

    })
    .then((response) => response.json())
})
