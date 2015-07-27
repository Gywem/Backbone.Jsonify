/*! backbone.jsonify - v0.1.0 - 2015-07-27
* Copyright (c) 2015 Nacho Codoñer; Licensed MIT */
/*! backbone.jsonify - v0.1.0 - 2015-07-27
* Copyright (c) 2015 Nacho Codoñer; Licensed MIT */

(function (root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['underscore', 'backbone'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		var _ = require('underscore'),
			Backbone = require('backbone');

		module.exports = factory(_, Backbone);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(root._, root.Backbone);
	}
}(this, function (_, Backbone) {

	'use strict';

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

	Backbone.Model.prototype.toJSON = function () {
		var options = arguments[0];

		var output;
		if (options && options.includeInJson) { // `includeInJson` logic
			output = _.pick(this.attributes, options.includeInJson);
		} else if (options && options.excludeInJson) { // `excludeInJson` logic
			output = _.omit(this.attributes, options.excludeInJson);
		} else if (options && options.filterInJson) { // `filterInJson` logic
			output = {};
			_.each(this.attributes, function (attrValue, attrKey) {
				if (options.filterInJson(attrValue, attrKey)) {
					output[attrKey] = attrValue;
				}
			});
		} else { // default `toJSON` logic
			output = exToJSON.call(this, options);
		}
		
		output = deepSerialize(output);

		return output;
	};

	return Backbone;
}));