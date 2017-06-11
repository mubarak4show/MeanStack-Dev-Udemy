var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

var runGeoQuery = function(req, res) {

  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);

  // a geoJSON point
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };

  var geoOPtions = {
    spherical: true,
    maxDistance: 2000, //2000 meters (2km)
    num: 5
  };

  Hotel
    .geoNear(point, geoOPtions, function(err, results, stats) {
      console.log('Geo results', results);
      console.log('Geo stats', stats);
      if (err) {
        console.log("Error finding hotels");
        res
          .status(500)
          .json(err);
      } else {
        res
          .status(200)
          .json(results);
      }
    });
};

module.exports.hotelsGetAll = function(req, res) {

  console.log('GET the hotels');
  console.log(req.query);

  var offset = 0;
  var count = 5;
  var maxCount = 10;

  if (req.query && req.query.lat && req.lng) {
    runGeoQuery(req, res);
    return;
  };

  if (req.query && req.query.offset) {
    offset = parseInt(req.query.offset, 10);
  }

  if (req.query && req.query.count) {
    count = parseInt(req.query.count, 10);
  }

  if (isNaN(offset) || isNaN(count)) {
    res
      .status(400)
      .json({
        "Message": "If supplied in query string, count and offset should be numbers"
      })
    return;
  }

  if (count > maxCount) {
    res
      .status(400)
      .json({
        "Message": "Count limit of " + maxCount + " exceeded"
      });
    return;
  }

  Hotel
    .find()
    .skip(offset)
    .limit(count)
    .exec(function(err, hotels) {
      if (err) {
        console.log("Error finding hotels", err);
        res
          .status(500)
          .json(err);
      } else {
        console.log("Found hotels", hotels.length);
        res
          .json(hotels);
      }
    });

};

module.exports.hotelsGetOne = function(req, res) {
  var id = req.params.hotelId;
  console.log('GET hotelId', id);

  Hotel
    .findById(id)
    .exec(function(err, doc) {
      var response = {
        status: 200,
        message: doc
      };
      if (err) {
        console.log("Error finding hotel");
        response.status = 500;
        response.message = err;
      } else if (!doc) {
        console.log("No document found");
        response.status = 404;
        response.message = {
          "message": "Hotel ID not found"
        };
      }
      res
        .status(response.status)
        .json(response.message);
    });
};

var _splitArray = function(input) {
  var output;
  if (input && input.length > 0) {
    output = input.split(";");
  } else {
    output = [];
  }
  return output;
};

module.exports.hotelsAddOne = function(req, res) {
  console.log("POST new Hotel");

  Hotel
    .create({
      name: req.body.name,
      description: req.body.description,
      stars: parseInt(req.body.stars, 10),
      services: _splitArray(req.body.services),
      photos: _splitArray(req.body.photos),
      currecny: req.body.currecny,
      location: {
        address: req.body.address,
        coordinates: [
          parseFloat(req.body.lng),
          parseFloat(req.body.lat)
        ]
      }

    }, function(err, hotel) {
      if (err) {
        console.log("Error creating hotel");
        res
          .status(400)
          .json(err);
      } else {
        console.log("Hotel created", hotel);
        res
          .status(201)
          .json(hotel);
      }
    });

  // console.log("POST new hotel");
  // var db = dbconn.get();
  // var collection = db.collection('hotels');
  // var newHotel;
  //
  // if (req.body && req.body.name && req.body.stars) {
  //     newHotel = req.body;
  //     newHotel.stars = parseInt(req.body.stars, 10);
  //     collection.insertOne(newHotel, function(err, response) {
  //         console.log("Hotel added", response);
  //         console.log("Hotel added", response.ops);
  //         res
  //             .status(201)
  //             .json(response.ops);
  //     });
  //     // console.log(newHotel);
  //     // res
  //     //   .status(200)
  //     //   .json(newHotel);
  // } else {
  //     console.log("Data missing from body");
  //     res
  //         .status(400)
  //         .json({
  //             message: "Required data missing from body"
  //         });
  // }
};

module.exports.hotelsUpdateOne = function(req, res) {
  var id = req.params.hotelId;
  console.log('PUT hotelId', id);

  Hotel
    .findById(id)
    .select("-reviews -rooms")
    .exec(function(err, doc) {
      var response = {
        status: 200,
        message: doc
      };
      if (err) {
        console.log("Error finding hotel");
        response.status = 500;
        response.message = err;
      } else if (!doc) {
        console.log("No document found");
        response.status = 404;
        response.message = {
          "message": "Hotel ID not found"
        };
      }
      if (response.status !== 200) {
        res
          .status(response.status)
          .json(response.message);
      } else {
        doc.name = req.body.name;
        doc.description = req.body.description,
          doc.stars = parseInt(req.body.stars, 10),
          doc.services = _splitArray(req.body.services),
          doc.photos = _splitArray(req.body.photos),
          doc.currecny = req.body.currecny,
          doc.location = {
            address: req.body.address,
            coordinates: [
              parseFloat(req.body.lng),
              parseFloat(req.body.lat)
            ]
          };

          doc.save(function(err, hotelUpdated) {
            if (err) {
              res
                .status(500)
                .json(err);
            } else {
              res
                .status(204)
                .json();
            }
          });
      }
    });
};

module.exports.hotelsDeleteOne = function(req, res) {
  var hotelId = req.params.hotelId;

  Hotel
    .findByIdAndRemove(hotelId)
    .exec(function(err, hotel) {
      if (err) {
        res
          .status(404)
          .json(err);
      } else {
        console.log("Hotel delete's id:", hotelId);
        res
          .status(204)
          .json();
      }
    });
};
