
Tasks = new Mongo.Collection("tasks");
choateUsers = new Mongo.Collection('choateUsers');  //var means private
Courses = new Mongo.Collection('courses');  //var means private


if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("choateUsers");
  Meteor.subscribe("tasks");

  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {block: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
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
   




    // "submit .new-task": function (event) {
    //   var texter = document.getElementById("texter").value;
      

    //   // Prevent default browser form submit
    //   // event.preventDefault();
    //   // console.log(event);
    //   // // Get value from form element
    //   // //var text = event.target.text.value;
    //   // var texter = document.getElementById('texter');
    //   // console.log(texter);
    //   // // Insert a task into the collection
    //   // Meteor.call("addTask", texter);

    //   // Clear form
    //   //event.target.text.value = "";
    // },
    // "submit .new-task": function (name, teacher, block) {
    //   // Prevent default browser form submit
    //   name.preventDefault();
    //   teacher.preventDefault();
    //   block.preventDefault();

    //   // Get value from form element
    //   var textName = name.target.text.value;
    //   var textTeacher = teacher.target.text.value;
    //   var textBlock = block.target.text.value;

    //   // Insert a task into the collection
    //   Meteor.call("addTask", textName, textTeacher, textBlock);

    //   // Clear form
    //   name.target.text.value = "";
    //   teacher.target.text.value = "";
    //   block.target.text.value = "";
    // },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }

  });

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    },
    'title': function() {
      console.log(Tasks.findOne(Meteor.userId));
      return Tasks.findOne({Meteor.userId});
    }
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
  Template.buttons.events({
    'click .create': function () {
      document.getElementById('createDiv').style.display = "block";
    },
    'click .bunny': function () {
      console.log("en test");
      //document.getElementById('enrollDiv').style.display = "block";
      document.getElementById('bunnyDiv').style.display = "block";
    }
  });

    Template.create.events({
      'click .destroyCreate':function(){
        document.getElementById('createDiv').style.display = "none";
      }
 });
    Template.enroll.events({
      'click .destroyEnroll':function(){
        document.getElementById('createDiv2').style.display = "none";
      }
    });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  Template.buttons.helpers({
     // 'dell': function () {
     //    choateUsers.insert({
     //      'name': "Kanye",
     //      'info': {
     //        'title': "APCS",
     //        'instructor': "Ms. Hoke", 
     //        'block': "d"}
     //    })
     //   // console.log(choateUsers.find());
     //  }
      // 'dispClassList': function (){
      //   var  player = choateUsers.find() 
      // }
  });
  Template.buttons.events({
    "click .enroll": function () {
      Meteor.call("addUser", "George", "AP CS","ms hoke", "d" );
      Meteor.call("addClassDiv", "hello");


      //console.log("enroll");
    },
    "click .create": function () {
      var name = document.getElementById("textName").value;
      var teacher = document.getElementById("textTeacher").value;
      var block = document.getElementById("textBlock").value;
      Meteor.call("addTask", name,teacher,block);
      name = "";
      teacher = "";
      block = "";

    }
    // "click .create": function (event) {
    //   // Prevent default browser form submit
    //   event.preventDefault();

    //   // Get value from form element
    //   var text = event.target.text.value;
    //   console.log(text);
    //   // Insert a task into the collection
    //   Meteor.call("addTask", text);

    //   // Clear form
    //   event.target.text.value = "";
    // }

    // "click .create": function (name, teacher, block) {
    //   // Prevent default browser form submit
    //   name.preventDefault();
    //   teacher.preventDefault();
    //   block.preventDefault();

    //   // Get value from form element
    //   var textName = name.target.text.value;
    //   var textTeacher = teacher.target.text.value;
    //   var textBlock = block.target.text.value;

    //   // Insert a task into the collection
    //   Meteor.call("addTask", textName, textTeacher, textBlock);

    //   // Clear form
    //   name.target.text.value = "";
    //   teacher.target.text.value = "";
    //   block.target.text.value = "";
    // }
  });
  Template.classes.events({
    'name': function() {
      return choateUsers.find();
    }
  });
}










Meteor.methods({
  // addTask: function (text) {
  //   // Make sure the user is logged in before inserting a task
  //   if (! Meteor.userId()) {
  //     throw new Meteor.Error("not-authorized");
  //   }
  //   Tasks.insert({
  //     text: text,
  //     createdAt: new Date(),
  //     owner: Meteor.userId(),
  //     username: Meteor.user().username
  //   });
  // },
  addTask: function (name, teacher, blockTime) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      title: name,
      instructor: teacher,
      block: blockTime,
      owner: Meteor.userId(),
      username: Meteor.user().username
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
<<<<<<< HEAD
  // addUser: function (nameUser, class, teacher, classBlock){
  //   choateUsers.insert({
  //     'name': "nameUser",
  //     'title': "class",
  //     'instructor': "teacher",
  //     'block': "classBlock"
  //   });
  // }
=======
  addUser: function (nameUser, class, teacher, classBlock){
    choateUsers.insert({
      'name': "nameUser",
      'title': "class",
      'instructor': "teacher",
      'block': "classBlock"
    });
  }
<<<<<<< HEAD
  
=======
>>>>>>> origin/master
  // addClassDiv: function (nameUser){
  //   //var title = choateUsers.find({name: nameUser}).fetch();
  //   var msgContainer = document.createElement('div');
  //   //var ll = document.getElementByID("hello");
  //   msgContainer.id = 'hello';
  //   msgContainer.className = 'From the other side';
  //   msgContainer.appendChild(document.createTextNode("hello"));
  //   document.body.appendChild(msgContainer);//getElementByID("yolo")
  //  console.log("add class div");
  // }
  // addUser: function (nameUser, class, teacher, classBlock) {
  //   // Make sure the user is logged in before inserting a task
  //   if (! Meteor.userId()) {
  //     throw new Meteor.Error("not-authorized");
  //   }

  //   choateUsers.insert({
  //     'name':nameUser,
  //     'title': class,
  //     'instructor': teacher,
  //     'block': classBlock
  //   });
  // }
>>>>>>> origin/master
});
