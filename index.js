/**
 * Created by Freddy Snijder on 17/04/16.
 */

/**********************************************************
 *
 * UTILITIES
 *
 **********************************************************/
var toString = Object.prototype.toString;

var _u = {
    obj : function(o) {
        return ('[object Object]' == toString.call(o));
    },

    func : function(f) {
        return (typeof f === "function");
    },

    array : function(a) {
        return (toString.call(a) == '[object Array]');
    },

    hasMethod : function(o, methodName) {
        return (this.obj(o) || this.func(o) || this.array(o)) && this.func(o[methodName]);
    },

    string : function(s) {
        return typeof s === "string";
    },

    modelName : function(m) {
        var type = typeof m;
        if ((type !== "function") && (type !== "object")) {
            return "[UNKNOWN MODEL]";
        }

        var c = m.constructor || {};
        return c.modelName || "[UNKNOWN MODEL]";
    }
};
/**********************************************************
 *
 * END UTILITIES
 *
 **********************************************************/

// In the future this could provide different super() methods based on some context (e.g. Mongoose.js version)
function __createSuper(config) {
    config = config || {};

    var _l = config.logger;
    if (!_l) {
        _l = console;
    }

    return function(methodName) {
        var self = this;

        var pp = this.__npm_mongoose_super_proto_proto;
        if (!pp) {
            pp = this.__proto__ || {};
            pp = pp.__proto__ || {};

            this.__npm_mongoose_super_proto_proto = pp;
        }

        var methodList  = this.__npm_mongoose_super_method_list || {};
        var method      = methodList[methodName];
        if (!method) {
            method = pp[methodName];
            if (!_u.func(method)) {
                return function() {

                    _l.error("mongoose-super::super", "Error : Parent model of " + _u.modelName(self) +
                            " has no method '" + methodName +"'");
                }
            }

            method = method.bind(this);
            methodList[methodName] = method;
            this.__npm_mongoose_super_method_list = methodList;
        }

        return method;
    };
}

/**
 *
 * Creates inherit function
 *
 * Usage :
 * var inherit = MongooseSuper();
 * // ... OR ..
 * var inherit = MongooseSuper({
 *      logger : myLogger
 * });
 *
 * var ChildModel = inherit(ParentModel, childModelName, childSchemaExtension[, childModelOptions]);
 *
 *
 * @param {object} [config]   Optional configuration object
 * @param {object} [config.logger=console]  Optional external logger object
 *
 * @returns {function|null}     On success returns inherit function
 *
 */
var createInherit = function(config) {
    var me = "mongoose-super::createInherit";

    config = config || {};

    var _l = config.logger;
    if (!_u.obj(_l)) {
        _l = console;
    }

    var __super = __createSuper(config);
    if (!_u.func(__super)) {
        _l.error(me,
                 "Error: Unable to create super method, setup of mongoose-super failed ...");
        return function() {
            _l.error(
                    "mongoose-super::inherit",
                    "Error: Setup of mongoose-super failed, unable to create child model ...");
        }
    }

    var __inherit = function(ParentModel, childModelName, ChildSchemaExtension, childModelOptions) {
        var me = "mongoose-super::inherit";

        if ((!_u.string(childModelName)) || (childModelName.length == 0)) {
            _l.error(me, "Error: Given child model name is not a string or empty, " +
                         "unable to create child model");
            return null;
        }

        if (!_u.hasMethod(ParentModel, "discriminator")) {
            _l.error(me, "Error: Given parent model is undefined or has no discriminator method, " +
                         "unable to create child model " + childModelName);
            return null;
        }

        if (!_u.obj(ChildSchemaExtension)) {
            _l.error(me, "Error: No valid ChildSchemaExtension given, " +
                         "unable to create child model " + childModelName +
                         " of " + _u.modelName(ParentModel));
            return null;
        }

        try {
            var ChildModel = ParentModel.discriminator(childModelName, ChildSchemaExtension, childModelOptions);
            if (_u.func(ChildModel)) {
                ChildModel.prototype.super = __super;
            } else {
                _l.error(me, "Error: UNEXPECTED : Creation failed of child model " + childModelName +
                             " of " + _u.modelName(ParentModel));
            }
        } catch(e) {
            _l.error(me, "Error: An exception occurred trying to create child model " + childModelName +
                         " of " + _u.modelName(ParentModel) + " : ", e, e.stack);
        }

        return ChildModel;
    };

    return __inherit;
};

module.exports._u = _u;
module.exports.createInherit = createInherit;