var Model = Supermodel.Model;
var Collection = Backbone.Collection;

var User = Model.extend();
var Admin = User.extend({}, {parent: User});
var Membership = Model.extend();
var Group = Model.extend();
var Settings = Model.extend({idAttribute: '_id'});

var visible = function(model) {
  return !model.get('hidden');
};

var Users = Collection.extend({
  model: function(attrs, options){
    return User.create(attrs, options);
  }
});

var Memberships = Collection.extend({
  model: function(attrs, options){
    return Membership.create(attrs, options);
  }
});

var Groups = Collection.extend({
  model: function(attrs, options){
    return Group.create(attrs, options);
  }
});

function beforeStart() {
  Model.reset();
  User.reset();
  Admin.reset();
  Settings.reset();
  Membership.reset();
  Group.reset();

  Membership.has()
    .one('user', {
      model: User,
      inverse: 'memberships'
    })
    .one('group', {
      model: Group,
      inverse: 'memberships'
    });

  Settings.has()
    .one('user', {
      model: User,
      inverse: 'settings'
    });

  User.has()
    .one('settings', {
      model: Settings,
      inverse: 'user'
    })
    .many('memberships', {
      collection: Memberships,
      inverse: 'user',
      where: visible
    })
    .many('affiliations', {
      source: 'affiliations',
      collection: Memberships,
      inverse: 'user',
      where: visible
    })
    .many('groups', {
      source: 'group',
      collection: Groups,
      through: 'memberships',
      where: visible
    });

  Group.has()
    .many('memberships', {
      collection: Memberships,
      inverse: 'group',
      where: visible
    })
    .many('users', {
      source: 'user',
      collection: Users,
      through: 'memberships',
      where: visible
    });
}

QUnit.testStart(beforeStart);

test('Picks and omits from Supermodel.', function () {

  var group = Group.create({
    id: 1,
    name: "Jsonify"
  });

  var modelJson = group.toJSON({
    pick: ["id", "name"]
  }); // Outputs {id: 1, name: "Jsonify"}

  deepEqual(modelJson, {
    id: 1,
    name: "Jsonify"
  });

  modelJson = group.toJSON({
    omit: "id"
  }); // Outputs {name: "Jsonify"} 

  deepEqual(modelJson, {
    name: "Jsonify"
  });

});

test('Picks and omits "cid" attribute.', function () {

  var group = Group.create();

  var modelJson = group.toJSON({
    cid: false
  }); // Outputs {}

  ok(!modelJson.cid);

  modelJson = group.toJSON({
    cid: true
  }); // Outputs {cid: "XX"}

  ok(modelJson.cid);

});

test('Picks all associations from a Supermodel.', function () {

  var user = User.create({
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3, group: {id: 1}},
      {id: 4, group: {id: 1}}
    ]
  });

  var modelJson = user.toJSON({
    pick: false,
    assoc: true // Pick all associations
  });

  deepEqual(modelJson, {
    affiliations: [],
    settings: {
      subscribed: true,
      user_id: undefined
    },
    memberships: [
      {
        id: 3,
        group_id: 1,
        user_id: undefined
      },
      {
        id: 4,        
        group_id: 1,
        user_id: undefined
      }
    ],
    groups: [
      {id: 1}
    ]
  });

});

test('Omit all associations from a Supermodel.', function () {
  
  var user = User.create({
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3, group: {id: 1}},
      {id: 4, group: {id: 1}}
    ]
  });

  var modelJson = user.toJSON({
    pick: false,
    assoc: false // Omit all associations
  });

  deepEqual(modelJson, {});

});

test('Jsonify associations from a Supermodel.', function () {
  
  var user = User.create({
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3, group: {id: 1}},
      {id: 4, group: {id: 1}}
    ]
  });

  // Case #1. Using default and one-level config.
  var modelJson = user.toJSON({
    pick: false,
    assoc: {
      '*': {
        pick: 'id' // By default, picks 'id' from all associations,
      },
      settings: {
        pick: 'subscribed' // picks 'subscribed' from settings,
      },
      groups: {
        omit: 'id' // and omits 'id' from groups.
      }
    }
  });

  deepEqual(modelJson, {
    affiliations: [],
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3},
      {id: 4}
    ],
    groups: [
      {}
    ]
  });

  // Case #2. Using default configuration to false and one-level config.
  modelJson = user.toJSON({
    pick: false,
    assoc: {
      '*': false, // By default, omits all associations
      settings: {
        pick: 'subscribed' // and picks 'subscribed' from settings.
      }
    }
  });

  deepEqual(modelJson, {
    settings: {
      subscribed: true
    }
  });

  // Case #3. Using two-level config.
  modelJson = user.toJSON({
    pick: false,
    assoc: {
      '*': false, // By default, omits all associations
      memberships: {
        omit: true,
        assoc: {
          group: true
        }
      }
    }
  });

  deepEqual(modelJson, {
    memberships: [
      {group: {id: 1}},
      {group: {id: 1}}
    ]
  });

  // Case #4. Using two-level and default config.
  modelJson = user.toJSON({
    pick: false,
    assoc: {
      '*': false, // By default, omits all associations
      memberships: {
        omit: true,
        assoc: {
          '*': true,
          user: {
            pick: false
          }
        }
      }
    }
  });

  deepEqual(modelJson, {
    memberships: [
      {group: {id: 1}, user: {}},
      {group: {id: 1}, user: {}}
    ]
  }); 

});

test('Jsonify associations deeply from a Supermodel.', function () {
  
  var user = User.create({
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3, group: {id: 1}},
      {id: 4, group: {id: 1}}
    ]
  });

  var modelJson = user.toJSON({
    pick: false,
    assoc: {
      '*': {
        pick: 'id' // By default, picks 'id' from all associations,
      },
      settings: {
        pick: 'subscribed' // picks 'subscribed' from settings,
      },
      groups: false // and omits groups association.
    },
    deepAssoc: true // Jsonify associations deeply
  });

  deepEqual(modelJson, {
    affiliations: [],
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3, group: {id: 1}},
      {id: 4, group: {id: 1}}
    ]
  });

});

test('Jsonify associations from a Supermodel using a function.', function () {
  
  var user = User.create({
    settings: {
      subscribed: true
    },
    memberships: [
      {id: 3, group: {id: 1}},
      {id: 4, group: {id: 1}}
    ]
  });

  var modelJson = user.toJSON({
    pick: false,
    assoc: function (assocName, value, key, model) {
      switch(assocName) {
        case "settings":
          return !key ||
            key === "subscribed";

        case "group":
          return !key ||
            key === "id";

        case "memberships":
          return !key;

      }

      return false;
    },
    deepAssoc: true // Jsonify associations deeply
  });

  deepEqual(modelJson, {
    settings: {
      subscribed: true
    },
    memberships: [
      {group: {id: 1}},
      {group: {id: 1}}
    ]
  });

});