# Backbone.Jsonify

Backbone Jsonify alters and provides a extended configuration to the "toJSON" method for models and collections. In general terms, the library enhances it by the following features: 

* **Serializes deeply**. This means model's attributes which are arrays and objects will be copied deeply.
* **Serializes model and collection**. When model's attributes are another model or a collection, those will be serialized as well.
* **Filters output**. "toJSON" method accepts new configuration options in order to control its output. This means to be useful for persisting and templating processes, when you wish to filter somehow data you want to work with.

## Usage
The new configuration options accepted by "toJSON" function are described below:
```javascript
model.toJSON([options]) 
```

### Options

#### includeInJson


**String**, **String[]** or **Function**. Returns the object which represents the model but only picks the provided attribute/s. 

The function looks through each attribute in the model, and picks all the attributes that pass a truth test defined by the function, which is invoked with up to three arguments; (value [, index|key, object]).

#### excludeInJson

**String**, **String[]** or **Function**. Returns the object which represents the model but omits the provided attribute/s.

The function looks through each attribute in the model, and omits all the attributes that pass a truth test defined by the function, which is invoked with up to three arguments; (value [, index|key, object]).

### Examples
```javascript
var artist = new Backbone.Model({
  firstName: "Wassily",
  lastName: "Kandinsky"
});

artist.toJSON({
	includeInJson: "firstName" // Only picks firstName
}); // Outputs {firstName: "Wassily"}

artist.toJSON({
	excludeInJson: "firstName" // Omits firstName
}); // Outputs {lastName: "Kandinsky"}

artist.set({age: 26});

artist.toJSON({
	includeInJson: function(attrKey, attrValue) { // Only picks firstName and attribute values that are numbers
        return (attrKey == "firstName") || _.isNumber(attrValue);
    }
}); // Outputs {firstName: "Wassily", age: 26}

artist.toJSON({
	excludeInJson: function(attrKey, attrValue) { // Omits firstName and attribute values that are numbers
        return (attrKey == "firstName") || _.isNumber(attrValue);
    }
}); // Outputs {lastName: "Kandinsky"}

```
## Building and Testing
First install locally all the required development dependencies.
```bash
npm install
```

### Building
```bash
grunt
```

### Testing
```bash
grunt test
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing
coding style.
Add unit tests for any new or changed functionality. Lint and test your
code using [grunt](https://github.com/cowboy/grunt).

## Release History
Read the CHANGELOG.md file distributed with the project.

## License
Read the LICENSE-MIT file distributed with the project.