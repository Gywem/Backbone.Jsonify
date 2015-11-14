/*! backbone.jsonify - v0.2.0 - 2015-11-14
* Copyright (c) 2015 Nacho Codoñer; Licensed MIT */

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

	Backbone.Jsonify.exToJSON = Backbone.Model.prototype.toJSON;
	
	var serializeDeeper = function (object, deepJson) {
		_.each(object, function (value, key) {
			if (value instanceof Backbone.Model ||
				value instanceof Backbone.Collection) {
				object[key] = value.toJSON({
					deepJson: deepJson
				});
			} else if (_.isObject(value) && deepJson) {
				object[key] = serializeDeeper(_.clone(value), deepJson);
			}
		});
	
		return object;
	};
	
	Backbone.Model.prototype.exToJSON = Backbone.Jsonify.exToJSON;
	
	Backbone.Model.prototype.toJSON = _.wrap(Backbone.Jsonify.exToJSON,
		function (exToJSON) {
			var options = arguments[1];
	
			options || (options = {});
	
			var output;
			if (_.isBoolean(options.omit) && options.omit ||
				_.isBoolean(options.pick) && !options.pick) {
				// When 'true' omit, or 'false' pick
				return {};
			} else if (_.isBoolean(options.pick) && options.pick ||
				_.isBoolean(options.omit) && !options.omit) {
				// When 'true' pick, or 'false' omit
				output = exToJSON.call(this, options);
			} else if (options.pick) { // `pick` logic
				output = _.pick(this.attributes, options.pick);
			} else if (options.omit) { // `omit` logic
				output = _.omit(this.attributes, options.omit);
			} else {
				output = exToJSON.call(this, options);
			}
	
			output = serializeDeeper(output, options.deepJson);
	
			return output;
		});
	

}));

