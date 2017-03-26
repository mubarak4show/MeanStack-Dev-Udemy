var clubData = require('../data/hotel-data.json');

module.exports.clubsGetAll = function(req, res){
	console.log("GET the clubs");
	console.log(req.query);

	var offset = 0;
	var count = 5;

	if (req.query && req.query.offset) {
		offset = parseInt(req.query.offset, 10);
	}

	if (req.query && req.query.count) {
		count = parseInt(req.query.count, 10);
	}


	var returnData = clubData.slice(offset, offset+count);

	res
		.status(200)
		.json( returnData );
};

module.exports.clubsGetOne = function(req, res){
	var clubID = req.params.clubID;
	var thisClub = clubData[clubID];
	console.log("GET a club", clubID);
	res
		.status(200)
		.json( thisClub );
};

module.exports.clubsAddOne = function(req, res) {
	console.log("POST new club");
	console.log(req.body);
	res
		.status(200)
		.json(req.body);
};

//asdasdasd