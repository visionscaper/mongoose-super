# mongoose-super
Augments Mongoose.js models with super() to call parent model methods. Augmentation is done in an inherit() function that returns a child model based on a parent model and a child schema.

## Installation

    npm install mongoose-super
    
## Usage

Load the mongoose-super module and create the inherit function.

    var MongooseSuper   = require('mongoose-super');
    var inherit         = MongooseSuper.createInherit();
    
It also possible to pass a configuration object, for now you can only specify an external logging object as configuration option:

    var inherit         = MongooseSuper.createInherit({
        logger : myLogger
    });
    
Before creating schemas and models you need to load the Mongoose.js module:

    var mongoose = require('mongoose');

The definition of the parent schema and model

    var AnimalSchema = new mongoose.Schema({ numberOfLegs : Number });
    AnimalSchema.methods.whoami = function() {
        console.log("I have " + this.numberOfLegs + " legs.");
    };

    var Animal = mongoose.model('Animal', AnimalSchema);

Now we are going to inherit the Human model from the Animal model and extend it using the Human schema extension. 
The whoami() method calls the parent version of the method using the super() method and defines additional functionality.

    //Human inherits from Animal
    var HumanSchemaExtension = new mongoose.Schema({ name : String,  numberOfLegs : { type: Number, default: 2 }});
    
    HumanSchemaExtension.methods.whoami = function() {
        this.super('whoami')();
        console.log("My name is " + this.name);
    };

    //Human inherits from Animal
    var Human = inherit(Animal, 'Human', HumanSchemaExtension);

When we create an instance of the Human model whoami() prints the logs from the parent and child methods as expected:

    var human = new Human({ name : "Jim" });
    human.whoami();
    // Prints:
    //
    // I have 2 legs.
    // My name is Jim

