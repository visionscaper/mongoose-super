/**
 * Created by Freddy on 18/04/16.
 */

var mongoose        = require('mongoose');
var MongooseSuper   = require('./index.js');

var _u              = MongooseSuper._u;
var inherit         = MongooseSuper.createInherit();

if (!_u.func(inherit)) {
    console.error("Failed to create inherit function, test failed");
    process.exit(-1);
}

var AnimalSchema = new mongoose.Schema({ numberOfLegs : Number });
AnimalSchema.methods.whoami = function() {
    console.log("I have " + this.numberOfLegs + " legs.");
};

var Animal = mongoose.model('Animal', AnimalSchema);


var HumanSchemaExtension = new mongoose.Schema({ name : String,  numberOfLegs : { type: Number, default: 2 }});
HumanSchemaExtension.methods.whoami = function() {
    this.super('whoami')();
    console.log("My name is " + this.name);
};

HumanSchemaExtension.methods.methodWithoutSuper = function() {
    this.super('methodWithoutSuper')();
};

var Human = inherit(Animal, 'Human', HumanSchemaExtension);

var human = new Human({ name : "Jim" });
human.whoami();
human.methodWithoutSuper();

console.log("Repeating whoami() to see the caching of the super method in action : ");
human.whoami();

process.exit(0);