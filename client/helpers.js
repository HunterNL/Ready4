Session.setDefault("editing_name",false)

Template.home.helpers({
	example_event : function() {
		return Session.get("example_event");
	}
});

Template.room_form.events({

	//Catch submit
	"submit" : function(e,tmp) { 
	
		var room_name = tmp.find("input").value; //Get room name from form
		
		Router.go("room",{
			_id : Random.id(),
			name: room_name
		}); //Move ourselfs over to the room template/route
		
		return false; //Prevent form submit. If this doesn't work, make sure there's nothing throwing exeptions
	}
});

Template.room.helpers({
	isOwner: function() {
		return (this.owner == Meteor.userId());
	}
});


Template.user_list.helpers({
	roomusers : function() {
		return Meteor.users.find({"rooms.roomId": this._id})
	},

	user : function() {
		return Meteor.users.findOne(this.userId)
	},
	
	trclass : function() {
		return (Meteor.userId()==this._id?"is_self":"")
	},
	
	editing_name : function() {
		return (Session.get("editing_name") === true && this._id == Meteor.userId())
	},
	
	//Gets the name of a user, including self suffix, defaulting when no name is set
	name : function() {
		function isSelf(user) {
			return user && user._id == Meteor.userId()
		}
	
		function getName(user) {
			var suffix = " (You!)"
			var default_name = "Somebody" + (isSelf(user)?suffix:"")
			
			if(!user || !user.profile) {
				return default_name 
			} 
			
			return user.profile.username || default_name
			
			/*
			
			if(user.changedUserName) {
				return user.username
			} else {
				return default_name 
			}*/
		}
		
	
		var user = Meteor.users.findOne(this._id)
		var username = getName(user)
		var easter_egg = (username.toLowerCase().indexOf("hunter")> -1?" <i class='fa fa-paw'></i>":"") //Rawr
		var edit_icon = (isSelf(user)?'<i class="fa fa-edit" data-action="name_edit"></i>':"")
		
		return "<td>"+username+easter_egg+" "+edit_icon+"</td>"

	},
	
	//Returns the 3TD's with intents for behind someones name
	intents : function() {
		function findRoomInArray(array,roomId) {
			for(var i=0;i<array.length;i++) {
				if(array[i].roomId==roomId) {
					return array[i]
				}
			}
		}
		var html_string = ""
		
		function createTD(intent,active) {
			return "<td data-intent=\""+intent+"\" class=\""+intent.toLowerCase()+(active?" active":"")+"\">"+intent+"</td>"
		}
		
		["YEP","NOPE","LATER"].forEach(function(intent){
			html_string+=createTD(intent,intent==findRoomInArray(this.rooms,Template.parentData()._id).intent) //Oneliner wheeeeeeeee
		},this);
		
		return html_string;
	}
})

Template.user_list.events({

	//When a user clicks on an intent behind his name, change intent of user
	"click .is_self [data-intent]" : function(e,tmp) {
		Meteor.call("userSetIntent",e.target.dataset.intent,tmp.parent().data._id)
		//Template.parentData() wouldn't work :s
	},
	
	//When a user clicks the edit name button, show the form
	'click [data-action="name_edit"]' : function(e,tmp) {
		Session.set("editing_name",true)
	},
	
	//When the user submits the form or presses the checkmark, change name
	'submit, click [data-action="name_edit_confirm"]' : function(e,tmp) {
		var username = tmp.find("#name_edit").value
		Meteor.call("userChangeName",username)
		Session.set("editing_name",false)
		return false //Prevent form submit
	},
	
	//When a user clicks the cancel button, hide the form
	'click [data-action="name_edit_cancel"]' : function(e,tmp) {
		Session.set("editing_name",false)
	},
	
	
})
//When a user presses escape, hide the form
Meteor.startup(function(){
	document.addEventListener("keydown",function(e){
		if(e && e.which && e.which == 27) { //Extra safeguard since according to moz
			Session.set("editing_name",false) // all ways to read a keycode are
		} //either deprecated or unimplemented...developers...
		//https://developer.mozilla.org/en-US/docs/Web/Events/keydown
	})
})

