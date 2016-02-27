Tasks = new Mongo.Collection("tasks");


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
 
  Template.body.helpers({
    tasks: function () {
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


  Template.body.events({
    "change .hide-completed input": function (event) {
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



  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });
 
  Template.buttons.onCreated(function() {
      this.subscribe("tasks", true);
  });

  Template.buttons.events({
    'click #create': function () {
      document.getElementById('enrollDiv').style.display = "none";
      document.getElementById('createDiv').style.display = "block";
    },
    'click #enroll': function () {
      document.getElementById('createDiv').style.display = "none";
      document.getElementById("enrollDiv").style.display = "block";
    }
  });  

  Template.enroll.onCreated(function() {
      this.subscribe("tasks", true);
  });
  Template.enroll.events({
    'click #destroyEnroll':function(){
      document.getElementById('enrollDiv').style.display = "none";
    },
    'click #submitEnroll': function() {
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
    'click #destroyCreate':function(){
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

    Tasks.insert({
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