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

	Backbone.Jsonify.VERSION =  '<%= version %>';

	// @include ../backbone.jsonify.js
	// @include ../supermodel.jsonify.js

}));

