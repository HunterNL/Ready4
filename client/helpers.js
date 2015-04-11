Session.setDefault("editing_username",false);
Session.setDefault("editing_title",false);

Template.home.helpers({
	example_event : function() {
		return Session.get("example_event");
	}
});

Template.room_form.events({

	//Catch submit
	"submit" : function(e,tmp) {

		var room_name = tmp.find("input").value || "an unnamed event"; //Get room name from form

		Router.go("room",{
			_id : Random.id(),
			name: room_name
		}); //Move ourselfs over to the room template/route

		return false; //Prevent form submit. If this doesn't work, make sure there's nothing throwing exeptions
	}
});




Template.user_list.helpers({
	roomusers : function() {
		return Meteor.users.find({
			"rooms.roomId": this._id
		}); //TODO: Actually find a way to sort with the current data structure
	},

	user : function() {
		return Meteor.users.findOne(this.userId);
	},

	trclass : function() {
		return (Meteor.userId()==this._id?"is_self":"");
	},

	editing_name : function() {
		return (Session.get("editing_username") === true && this._id == Meteor.userId());
	},

	//Gets the name of a user, including self suffix, defaulting when no name is set
	//TODO: fix this, it's way too heavy for a helper
	name : function() {
		function isSelf(user) {
			return user && user._id == Meteor.userId();
		}

		function getName(user) {
			var suffix = " (You!)";
			var default_name = "Somebody" + (isSelf(user)?suffix:"");

			if(!user || !user.profile) {
				return default_name;
			}

			return user.profile.username || default_name;

		}


		var user = this;
		var username = getName(user);
		var easter_egg = (username.toLowerCase().indexOf("hunter")> -1?" <i class='fa fa-paw'></i>":""); //Rawr
		var edit_icon = (isSelf(user)?'<i class="fa fa-edit" data-action="edit_username_start"></i>':"");

		return "<td>"+username+easter_egg+" "+edit_icon+"</td>";

	},

	//Returns the 3TD's with intents for behind someones name, is also quite a mess
	intents : function() {
		function findRoomInArray(array,roomId) {
			for(var i=0;i<array.length;i++) {
				if(array[i].roomId==roomId) {
					return array[i];
				}
			}
		}

		function printRegularIntents(){
			var intents = ["YEP","NOPE","LATER"];

			intents.forEach(function(intent){

			html_string+=createTD(intent,intent===user_intent); //Oneliner wheeeeeeeee
			});
		}

		function printQuestionMark() {
			html_string+=createTD("?",true,3);
		}

		//Creates single <td> with proper tags/classes/content
		function createTD(intent,active,colspan) {
			var css_class = intent.toLowerCase() + (active?" active":"");
			colspan = colspan || "";
			//return "<td data-intent=\""+intent+"\" class=\""+intent.toLowerCase()++"\" >"+intent+"</td>"
			return '<td data-intent="'+intent+'" class="'+css_class+'" colspan="'+colspan+'">'+intent+'</td>';
		}

		var html_string = "";
		var user_intent = findRoomInArray(this.rooms,Template.parentData()._id).intent;
		/*
		var print_all = (this._id == Meteor.userId())
		console.log("Origional print all:",print_all)

		if(user_intent=="?") {print_all = !print_all}

		console.log("second print all: ",print_all)

		if(print_all) {
			printRegularIntents()
		} else {
			printQuestionMark()
		}*/


		if(this._id != Meteor.userId() && user_intent == "?") {
			printQuestionMark();
		} else {
			printRegularIntents();
		}




		//For every intent, create the table cells


		return html_string;
	}
});

Template.user_list.events({
	//When a user clicks on an intent behind his name, change intent of user
	"click .is_self [data-intent]" : function(e,tmp) {
		var intent = e.target.dataset.intent;
		var roomId = Template.parentData(0)._id; //This works like this.. somehow
		Meteor.call("userSetIntent",intent,roomId);
	},

	//When the user submits the form or presses the checkmark, change name
	'submit #edit_field_username, click [data-action=username_edit_confirm]' : function(e,tmp) {
		var username = tmp.find("input").value;
		Meteor.call("userChangeName",username);
	},

	"click [data-action=edit_username_start]" : function(e,tmp) {
		Session.set("editing_username",true);
	}

});


Template.room.onRendered(function(){
	gapi.hangout.render("hangouts_placeholder",{
		render: "createhangout"
	});
});

Template.room.helpers({
	isOwner: function() {
		return (this.owner == Meteor.userId());
	},

	editing_title : function() {
		return (this.owner == Meteor.userId() && Session.get("editing_title"));
	}
});




//Same stories as user_list template
Template.room.events({
	'submit #edit_field_title, click [data-action=title_edit_confirm]' : function(e,tmp) {
		var roomtitle = tmp.find("input").value;
		var roomId = Template.currentData()._id;
		Meteor.call("roomChangeTitle",roomId,roomtitle);
	},

	"click [data-action=title_edit]" : function(e,tmp) {
		Session.set("editing_title",true);
	}



});
//When a user presses escape, hide the form
Meteor.startup(function(){
	document.addEventListener("keydown",function(e){
		if(e && e.which && e.which == 27) { //Extra safeguard since according to moz
			Session.set("editing_name",false); // all ways to read a keycode are
			Session.set("editing_title",false); // all ways to read a keycode are
		} //either deprecated or unimplemented...developers...
		//https://developer.mozilla.org/en-US/docs/Web/Events/keydown
	});
});
