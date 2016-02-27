// AUTHORS: George Wildridge && Nat Kerman
// DATE OF SUBMISSION: 2/26/2016
Tasks = new Mongo.Collection("tasks");
//Mongo databas collection of classes and associated info 

if (Meteor.isServer) {
  // This code only runs on the server
  // This publishes classes that belong to the current user or publishes the entirety of the collection 
  Meteor.publish("tasks", function (author) {
    if (author == true){
      return Tasks.find({
        $or: [
          { private: {$ne: true} },
          { owner: this.userId }
        ]
      });
    } else {
      return Tasks.find();
    }
  });

}

if (Meteor.isClient) {
  // This code only runs on the client
// Meteor.subscribe("tasks", true);

  Template.body.onCreated(function() {
       this.subscribe("tasks", true);
  });
 
  Template.body.helpers({   //helper functions for enroll
    tasks: function () {     //finds the entire tasks list
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {block: 1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {block: 1}});
      }

    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
   
  });


  Template.body.events({  //ActionListener style click events
    "change .hide-completed input": function (event) {  //click on hide-completed button -> calls Hide Completed on object
      Session.set("hideCompleted", event.target.checked);
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.onCreated(function() {
      this.subscribe("tasks", true);
  });

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
    // hiddiv: function () {
    //   if ()
    // }
  });



  Template.task.events({    //task's listener
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {  //click on the delete "x" button
      Meteor.call("deleteTask", this._id);  //calls delete function
    },
    "click .toggle-private": function () {  //click on public/private toggle
      Meteor.call("setPrivate", this._id, ! this.private);  //switches permissions
    }
  });
 
  Template.buttons.onCreated(function() {
      this.subscribe("tasks", true);
  });

  Template.buttons.events({
    //listener for the buttons template (contains create and enroll buttons.)
  //create button makes sure only createDiv div is shown
    'click #create': function () {
      document.getElementById('enrollDiv').style.display = "none";
      document.getElementById('createDiv').style.display = "block";
    },
    'click #enroll': function () {
      //enroll button makes sure only EnrollDiv div is shown
      document.getElementById('createDiv').style.display = "none";
      document.getElementById("enrollDiv").style.display = "block";
    }
  });  

  Template.enroll.onCreated(function() {
      this.subscribe("tasks", true);
  });
  Template.enroll.events({
    'click #destroyEnroll':function(){  //listener for enroll template and div
      document.getElementById('enrollDiv').style.display = "none"; //cancel button hides enrollDiv
      },
    'click #submitEnroll': function() {

      //stores the data entered by the user in the enrollDiv to the Tasks database
      var unparsedText = document.getElementById("enrollSelect").value;
      var parseTextArray = unparsedText.split("-");
      if (parseTextArray.length > 1){
        var counter = Tasks.find({owner: Meteor.userId(), block: parseTextArray[5].trim()}).count();
        if (counter == 0) {
          Meteor.call("addTask", parseTextArray[1].trim(), parseTextArray[3].trim(), parseTextArray[5].trim());
          document.getElementById('enrollDiv').style.display = "none";
        }
      }
    }
  });

  Template.enroll.helpers({
    tasks: function () {
      return Tasks.find();
    }
  })
  
  Template.create.onCreated(function() {
      this.subscribe("tasks", true);
  });
  Template.create.events({
    //listener for create template and div
    "click #submitCreate": function () {
      var name = document.getElementById("textName").value;
      var teacher = document.getElementById("textTeacher").value;
      var blockLetter = document.getElementById("textBlock").value;
      var counter = Tasks.find({owner: Meteor.userId(), block: blockLetter}).count();
      if (counter == 0){
        Meteor.call("addTask", name,teacher,blockLetter);
        name = "";
        teacher = "";
        blockLetter = "";
        document.getElementById('createDiv').style.display = "none";
      }
    },
    'click #destroyCreate':function(){  //cancel button hides createDiv
      document.getElementById('createDiv').style.display = "none";
    }
  })


  // Theoretically these templates only should subscribe to the full collection; however, when this happens the entirety of the code pulls from the collection which shows all of the private divs. It was odd, extremely frustratring and we couldn't find a work around.
  // Template.choice.onCreated(function() {
  //     this.subscribe("tasks", false);
  // });
  // Template.username.onCreated(function() {
  //     this.subscribe("tasks", false);
  // });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

//------------------------------------------------

Meteor.methods({
  addTask: function (name, teacher, blockTime) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({  //Method for inseting data into the database tasks used by create
      text: name,
      instructor: teacher,
      block: blockTime,
      owner: Meteor.userId(),
      username: Meteor.user().username,
      private: true
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
  addClassDiv: function (nameUser){
    var msgContainer = document.createElement('span');
    msgContainer.appendChild(document.createTextNode(nameUser));
    // msgContainer.id = "";
    // msgContainer.className = "";
    document.getElementById("yolo").appendChild(msgContainer);
  },
});