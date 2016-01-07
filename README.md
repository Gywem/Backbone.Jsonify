# backbone-jsonify

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

#### pick


**String**, **String[]**, **Boolean**, or **Function**. Returns the object which represents the model but only picks the provided attribute/s. 

The function looks through each attribute in the model, and picks all the attributes that pass a truth test defined by the function, which is invoked with up to three arguments; (value [, index|key, object]).

#### omit

**String**, **String[]**, **Boolean** or **Function**. Returns the object which represents the model but omits the provided attribute/s.

The function looks through each attribute in the model, and omits all the attributes that pass a truth test defined by the function, which is invoked with up to three arguments; (value [, index|key, object]).

#### deepJson

**Boolean**. Whether or not to copy deeply model's attributes which are array or objects.

### Examples
```javascript
var artist = new Backbone.Model({
  firstName: "Wassily",
  lastName: "Kandinsky"
});

artist.toJSON({
	pick: "firstName" // Only picks firstName
}); // Outputs {firstName: "Wassily"}

artist.toJSON({
	omit: "firstName" // Omits firstName
}); // Outputs {lastName: "Kandinsky"}

artist.set({age: 26});

artist.toJSON({
	pick: function(attrKey, attrValue) { // Only picks firstName and attribute values that are numbers
        return (attrKey == "firstName") || _.isNumber(attrValue);
    }
}); // Outputs {firstName: "Wassily", age: 26}

artist.toJSON({
	omit: function(attrKey, attrValue) { // Omits firstName and attribute values that are numbers
        return (attrKey == "firstName") || _.isNumber(attrValue);
    }
}); // Outputs {lastName: "Kandinsky"}

```
## Supermodel compatibility
[Supermodel](http://pathable.github.io/supermodel/) is a Backbone plugin for model tracking and relationships between models. Backbone.Jsonify has been adapted to work along such library and it provides more options to address the jsonify process of the relationships.

For using it, it is needed to include the Supermodel library just before *supermodel.jsonify.js* or the minimized version of the plugin.

### Options

#### assoc
Serialices the model associations by a configuration.

**Object** representing:

```javascript
{
	'*': defaultConfiguration, // Takes a default configuration for all associations (optional)
	associationName : configuration,
    // [...] more association configs
}
```

The **Configuration** may accept a boolean or an object.

* **Boolean**. Set to true to serialize the related model and the full set of attributes and associations. In case of false, the relationship is not be serialized.
* **Object**. Serializes the related model and represents a configuration for the association.
  * **pick**. **String**, **String[]**, **Boolean**, or **Function**.  Includes the provided attribute/s.
  * **omit**. **String**, **String[]**, **Boolean**, or **Function**. Omits the provided attribute/s.
  * **assoc**. **Object** or **Function**.
  * **assocPick**. **Function**.
  * **assocOmit**. **Function**.
  * **deepAssoc**. **Boolean**.
 
or a **Function** invoked with the following interface:


```javascript
function (assocName, model)
```
and tests which associations it must include.

#### assocPick
A **Function** that tests which attributes for each association must be included.

```javascript
function (assocName, value, key, model)
```
#### assocOmit
A **Function** that tests which attributes for each association must be excluded.

```javascript
function (assocName, value, key, model)
```
#### deepAssoc
**Boolean**. Performs a deep serialization of the model and the relationships.

## Building and Testing
First install locally all the required development dependencies.
```bash
npm install
```

### Building
```bash
grunt
```
#### Backbone.Jsonify

```bash
grunt base
```

#### Supermodel.Jsonify
```bash
grunt supermodel
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
