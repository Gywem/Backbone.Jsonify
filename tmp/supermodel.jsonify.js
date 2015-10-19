(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['backbone', 'underscore'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS
		var Backbone = require('backbone'),
			_ = require('underscore');

		module.exports = factory(Backbone, _);
	} else {
		// Browser globals
		factory(root.Backbone, root._);
	}
}(this, function (Backbone, _) {
	'use strict';

	Backbone.Jsonify = {};

	Backbone.Jsonify.VERSION =  '0.2.0';

	var exToJSON = Backbone.Model.prototype.toJSON;
	
	var deepSerialize = function (object) {
		_.each(object, function (value, key) {
			if (value instanceof Backbone.Model ||
				value instanceof Backbone.Collection) {
				object[key] = value.toJSON();
			} else if (_.isObject(value)) {
				object[key] = deepSerialize(_.clone(value));
			}
		});
	
		return object;
	};
	
	Backbone.Model.prototype.exToJSON = exToJSON;
	
	Backbone.Model.prototype.toJSON = _.wrap(exToJSON, function (exToJSON) {
		var options = arguments[1];
	
		var output;
		if (options && options.includeInJson) { // `includeInJson` logic
			output = _.pick(this.attributes, options.includeInJson);
		} else if (options && options.excludeInJson) { // `excludeInJson` logic
			output = _.omit(this.attributes, options.excludeInJson);
		} else { // default `toJSON` logic
			output = exToJSON.call(this, options);
		}
	
		output = deepSerialize(output);
	
		return output;
	});
	


}));

