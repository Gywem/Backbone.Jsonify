(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['supermodel', 'backbone', 'underscore'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// CommonJS
		var Supermodel = require('supermodel'),
			Backbone = require('backbone'),
			_ = require('underscore');

		module.exports = factory(Supermodel, Backbone, _);
	} else {
		// Browser globals
		factory(root.Supermodel, root.Backbone, root._);
	}
}(this, function (Supermodel, Backbone, _) {
	'use strict';

	Backbone.Jsonify = {};

	Backbone.Jsonify.VERSION =  '<%= version %>';

	// @include ../backbone.jsonify.js
	// @include ../supermodel.jsonify.js

}));

