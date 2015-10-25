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
	
	var exToJSON = Backbone.Model.prototype.toJSON;
	
	var allAssociations = function () {
	  var allAssociations = {};
	
	  var ctor = this;
	  do {
	    _.extend(allAssociations, ctor._associations);
	    ctor = ctor.parent;
	  } while (ctor);
	
	  return allAssociations;
	};
	
	var toJSON = function (options) {
	  if (this instanceof Backbone.Model) {
	    return toJSONModel.call(this, options);
	  } else if (this instanceof Backbone.Collection) {
	    return toJSONCollection.call(this, options);
	  }
	};
	
	var toJSONModel = function (options) {
	  // Building the attribute configuration.
	  var assocAttrConfig = getAssocAttrConfig(options.assocName, this, options);
	  return this.toJSON(_.extend(options, assocAttrConfig));
	};
	
	var toJSONCollection = function (options) {
	  var output = [];
	  this.each(function (model) {
	    output.push(toJSONModel.call(model, options));
	  }, this);
	
	  return output;
	};
	
	/*
	 * Gets the attribute config of the assoc.
	 * @return {Object|Boolean} Returns a concrete attribute config for
	 * the assoc.
	 **/
	var getAssocAttrConfig = function (assocName, assocStore, options) {
	  var assocAttrConfig = {};
	
	  var assocAttrFunc,
	      assocAttrOption = [];
	
	  if (_.isFunction(options.assocPick)) {
	    // A function to pick attributes is set
	    assocAttrFunc = options.assocPick;
	    assocAttrConfig.pick = assocAttrOption;
	  } else if (_.isFunction(options.assocOmit)) {
	    // A function to omit attributes is set
	    assocAttrFunc = options.assocOmit;
	    assocAttrConfig.omit = assocAttrOption;
	  }
	
	  if (assocAttrFunc) {
	    // Looks through each attribute that pass the truth test.
	    _.each(assocStore.attributes, function (value, key) {
	      if (assocAttrFunc(assocName, value, key, assocStore)) {
	        assocAttrOption.push(key);
	      }
	    }, assocStore);
	
	    // All attributes results to be omitted.
	    if (assocAttrOption.length === 0) {
	      return {
	        omit: true
	      };
	    }
	  }
	
	  return assocAttrConfig;
	};
	
	/*
	 * Gets the association config.
	 * @return {Object|Boolean} Returns a concrete config for
	 * the assoc or the default one. Otherwise, false.
	 **/
	var getAssocConfig = function (assocName, assocOption) {
	  var assocConfig = {};
	
	  if (_.isObject(assocOption) &&
	    !_.isFunction(assocOption)) {
	    // Config as an object.
	
	    var defaultAssocOptions = assocOption['*'];
	
	    // The configuration for the assoc is false.
	    if (_.isBoolean(defaultAssocOptions) && defaultAssocOptions) {
	      defaultAssocOptions = {
	        pick: true
	      };
	    }
	
	    assocConfig = assocOption[assocName];
	
	    // The configuration for the assoc is false.
	    if (_.isBoolean(assocConfig) &&
	      !assocConfig) {
	      return false;
	    }
	
	    // There is not configuration available
	    // for the assoc, but default one.
	    if (_.isObject(assocOption) &&
	      !_.isFunction(assocOption) &&
	      _.isObject(defaultAssocOptions) &&
	      !assocConfig) {
	      assocConfig = defaultAssocOptions;
	    }
	
	    // There is not configuration available for the assoc (neither default nor assoc).
	    if (_.isObject(assocOption) &&
	      !_.isFunction(assocOption) &&
	      _.isBoolean(defaultAssocOptions) &&
	      !defaultAssocOptions &&
	      !assocConfig) {
	      return false;
	    }
	
	    // There is not any configuration for the assoc.
	    if (_.isObject(assocOption) &&
	      !_.isFunction(assocOption) &&
	      _.isUndefined(defaultAssocOptions) &&
	      !assocConfig) {
	      return false;
	    }
	
	  } else if (_.isFunction(assocOption)) {
	    // Config as an function.
	    assocConfig.assoc = assocOption;
	  }
	
	  return assocConfig;
	};
	
	Supermodel.Model.prototype.toJSON = _.wrap(exToJSON,
	  function (exToJSON) {
	    var options = arguments[1];
	
	    options || (options = {});
	
	    // Jsonify model
	    var output = exToJSON.call(this, options);
	
	    // Include cid?
	    if (!options.cid) {
	      delete output[this.cidAttribute];
	    }
	
	    var assocOption = options.assoc;
	    // Jsonify assocs?
	    if ((_.isObject(assocOption) || _.isBoolean(assocOption) || _.isFunction(assocOption)) &&
	      assocOption) {
	      // the assoc config is an object, function or boolean.
	
	      var defaultAssocOptions;
	      // Config as an object. Get default config for each association.
	      if (_.isObject(assocOption) &&
	        !_.isFunction(assocOption)) {
	        defaultAssocOptions = assocOption['*'];
	      }
	
	      // Config as an object. Only "*" is set and false.
	      if (_.isObject(assocOption)  &&
	        !_.isFunction(assocOption) &&
	        _.keys(assocOption).length === 1 &&
	        _.isBoolean(defaultAssocOptions) &&
	        !defaultAssocOptions) {
	        return output;
	      }
	
	      // Prepares an object of assocs with assocName as key
	      // and assocStore as value.
	      var allAssoc = allAssociations.call(this.constructor);
	      allAssoc = _.mapObject(allAssoc, function (assoc) {
	        return this[assoc.name]();
	      }, this);
	
	      // Iterates over associations.
	      for (var assocName in allAssoc) {
	        if (allAssoc.hasOwnProperty(assocName)) {
	          var assocStore = allAssoc[assocName];
	
	          var assocConfig = getAssocConfig(assocName, assocOption);
	
	          // There is not a valid config for the assoc. Skip current assoc jsonify.
	          if (!assocConfig) {
	            continue;
	          }
	
	          var newAssocConfig = _.extend({}, options, {
	            assocName: assocName,
	            assoc: undefined, // Cleans assoc option.
	            pick: undefined, // Cleans pick option.
	            omit: undefined // Cleans omit option.
	          }, assocConfig);
	
	          // Jsonify deep mode.
	          if (options.deepAssoc) {
	            var avoidLoop = _.union([], options.avoidLoop);
	
	            // Check if prevent loop.
	            if (!assocOption.assoc ||
	              (assocOption.assoc && !assocOption.assoc[assocName])) { // There is not an assoc config.
	              if (assocStore instanceof Backbone.Model) {
	                if (_.indexOf(avoidLoop, assocStore) >= 0) {
	                  continue;
	                }
	              } else if (assocStore instanceof Backbone.Collection) {
	                if (_.indexOf(avoidLoop, assocStore.owner) >= 0) {
	                  continue;
	                }
	              }
	            }
	
	            // Builds the option for excluding models already jsonified.
	            avoidLoop = _.union(avoidLoop, _.values(allAssoc), [this]);
	
	            // Prepares the option for the deep models.
	            _.extend(newAssocConfig, {
	              assoc: {
	                "*": defaultAssocOptions // The default config for associations is spread.
	              },
	              deepAssoc: true,
	              avoidLoop: avoidLoop
	            }, assocConfig);
	          }
	
	          // The assoc option is a function.
	          if (_.isFunction(assocOption)) {
	            if (!assocOption(assocName, assocStore)) {
	              continue;
	            }
	          }
	
	          // Jsonify assoc.
	          output[assocName] = toJSON.call(assocStore, newAssocConfig);
	        }
	      }
	    }
	
	    return output;
	  });
	

}));

