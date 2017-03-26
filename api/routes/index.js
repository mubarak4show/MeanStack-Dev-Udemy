var express =  require('express');
var router = express.Router();

var ctrlClubs = require('../controllers/clubs.controllers.js');


router
	.route('/clubs')
	.get(ctrlClubs.clubsGetAll);

router
	.route('/clubs/:clubID')
	.get(ctrlClubs.clubsGetOne);

router
	.route('/clubs/new')
	.post(ctrlClubs.clubsAddOne);

	module.exports = router;

//test