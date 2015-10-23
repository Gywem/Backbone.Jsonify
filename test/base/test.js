var artist = new Backbone.Model({
	firstName: 	"Wassily",
	lastName: 	"Kandinsky",
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

test("Default jsonify.", function () {
	var json = artist.toJSON();

	deepEqual(json, {
		firstName: 	"Wassily",
		lastName: 	"Kandinsky",
		age: 26
	});
	
});

test("Picks attributes provided by \"pick\" option.", function () {
	// Boolean parameter
	var json = artist.toJSON({
		pick: true // pick all attributes
	});

	deepEqual(json, {
		firstName: 	"Wassily",
		lastName: 	"Kandinsky",
		age: 26
	});

	json = artist.toJSON({
		pick: false // Picks no attributes
	});

	deepEqual(json, {});

	// String parameter
	var json = artist.toJSON({
		pick: "firstName" // Only picks firstName
	});

	// Outputs {firstName: "Wassily"}
	deepEqual(json, {
		firstName: "Wassily"
	});

	// Array parameter
	json = artist.toJSON({
		pick: ["firstName", "lastName"] // Picks firstName and lastName
	});

	// Outputs {firstName: "Wassily", lastName: "Kandinsky"}
	deepEqual(json, {
		firstName: 	"Wassily",
		lastName: 	"Kandinsky"
	});

	// Function parameter
	json = artist.toJSON({
		pick: function(attrValue, attrKey, object) { // Only picks firstName and attribute values that are numbers
			return (attrKey == "firstName") 
				|| _.isNumber(attrValue);
		}
	});

	// Outputs {firstName: "Wassily", age: 26}
	deepEqual(json, {
		firstName: "Wassily",
		age: 26
	});

});

test("Omits attributes provided by \"omit\" option.", function () {
	// Boolean parameter
	var json = artist.toJSON({
		omit: true // Omits all attributes
	});

	deepEqual(json, {});

	json = artist.toJSON({
		omit: false // Omits no attributes
	});

	deepEqual(json, {
		firstName: 	"Wassily",
		lastName: 	"Kandinsky",
		age: 26
	});

	// String parameter
	json = artist.toJSON({
		omit: "firstName" // Omits firstName
	});

	// Outputs {lastName: "Kandinsky"}
	deepEqual(json, {
		lastName: "Kandinsky",
		age: 26
	});

	// Array parameter
	json = artist.toJSON({
		omit: ["firstName", "lastName"] // Omits firstName and lastName
	});

	// Outputs {age: 26}
	deepEqual(json, {
		age: 26
	});

	// Function parameter
	json = artist.toJSON({
		omit: function(attrValue, attrKey, object) { // Omits firstName and attribute values that are numbers
			return (attrKey == "firstName") 
				|| _.isNumber(attrValue);
		}
	});

	// Outputs {lastName: "Kandinsky"}
	deepEqual(json, {
		lastName: "Kandinsky"
	});

});

test("Deep serialization.", function () {
	var json = director.toJSON({
		deepJson: true
	});
	ok(json.lastName !== director.attributes.lastName);

	json = director.toJSON({
		deepJson: false
	});
	ok(json.lastName === director.attributes.lastName);
});

test("Serializes model and collection attributes.", function () {
	var json = movie.toJSON();

	var artistsJson = movie.get("artists").toJSON();
	deepEqual(json.artists, artistsJson);

	var directorJson = movie.get("director").toJSON();
	deepEqual(json.director, directorJson);
});