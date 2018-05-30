var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendfile('views/emptyhouse.html');
});
router.get('/test', function (req, res, next) {
    res.sendfile('views/index2.html')
})
module.exports = router;
