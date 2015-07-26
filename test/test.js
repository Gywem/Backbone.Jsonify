var artist = new Backbone.Model({
  firstName: "Wassily",
  lastName: "Kandinsky",
  age: 26
});

var director = new Backbone.Model({
  firstName: "Pedro",
  lastName: {
  	first: 	"Montoro",
  	second: "Gimeno"
  },
  age: 38
});

var movie = new Backbone.Model({
  title: "Backbone Jsonify",
  artists: new Backbone.Collection([artist]),
  director: director
});

test("Picks attributes provided by \"includeInJson\" option.", function () {
	var json = artist.toJSON({
	    includeInJson: "firstName" // Only picks firstName
	});

	// Outputs {firstName: "Wassily"}
	deepEqual(json, {
	  firstName: "Wassily"
	});
});

test("Omits attributes provided by \"excludeInJson\" option.", function () {
	var json = artist.toJSON({
	    excludeInJson: "firstName" // Omits firstName
	});

	// Outputs {lastName: "Kandinsky"}
	deepEqual(json, {
	  lastName: "Kandinsky",
	  age: 26
	});
});

test("Filters attributes provided by \"filterInJson\" option.", function () {
    var json = artist.toJSON({
	    filterInJson: function(attrKey, attrValue) { // Only picks firstName and attribute values that are numbers
	        return (attrKey == "firstName") || _.isNumber(attrValue);
	    }
	});

	// Outputs {firstName: "Wassily", age: 26}
	deepEqual(json, {
	  firstName: "Wassily",
	  age: 26
	});
});

test("Deep serialization.", function () {
	var json = director.toJSON();
    ok(json.lastName !== director.attributes.lastName);
});

test("Serializes model and collection attributes.", function () {
	var json = movie.toJSON();

	var artistsJson = movie.get("artists").toJSON();
	deepEqual(json.artists, artistsJson);

	var directorJson = movie.get("director").toJSON();
	deepEqual(json.director, directorJson);
});