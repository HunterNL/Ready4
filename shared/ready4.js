Rooms = new Mongo.Collection("rooms");

Router.route("/",function() {
	this.render("home");
}, {
	name: "home"
});

Router.route("/:name/:_id",function() {
	console.log("Ran room route")
	
	//Helper
	function roomContainsUser(room,id) {
		var users = room.users;
		
		for(var i=0;i<users.length;i++) {
			if(users[i].userId==id) {
				return true;
			}
		}
		return false;
	}
	
	//Grab roomId from URL and get the complete room from DB
	//Also enstabishes dependancy, rerunning this as needed
	this.wait(Meteor.subscribe("room_single",this.params._id))
	
	
	if(this.ready())  {
		var room = Rooms.findOne(this.params._id);
		console.log("room ",room)
	
		if(!room) {
		
			console.log("no room")
			//Get server to create the room
			Meteor.call("roomCreate",{
				title: this.params.name,
				id: this.params._id
			})
			
			//And show the user a loading screen
			this.render("loading")
			
		} else {
		
			console.log('got room')
			//If we got a room, add ourselves if we're not in already
			if(!roomContainsUser(room,Meteor.userId())) {
				console.log("adding user ",Meteor.userId()," to room ",room._id)
				Meteor.call("roomAddUser",{
					userId: Meteor.userId(),
					roomId: room._id,
					intent: "YEP"
				})
			}
			
			//Finally render the room with room data
			this.render("room",{data:room})
		}
	} else {
		this.render("loading")
	}
	
}, {
	name: "room"
});

//Whats a decent way to give this as arg? call/apply/bind??
//Unused with accounts-guest package
function ensureUserId(call) {
	if(!call.userId) {
		call.setUserId(Random.id());
	}
}

 
Meteor.methods({
	"roomCreate" : function(args) {
		//ensureUserId(this);
		
		var title = args.title || 'Unnamed room'
		
		var query = {
			owner: this.userId,
			title: title,
			date_created : new Date(),
			date_last_activity : new Date(),
			users : []
		}
		
		if(args.id) {
			query._id = args.id
		}
		
		if(Rooms.findOne(args.id)) {
			throw new Meteor.error("duplicate_room_id","Duplicate room id","ID: "+args.id)
		}
	
		var room_id = Rooms.insert(query);
		
		/*var succes = Meteor.call("roomAddUser",{
			roomId: room_id, 
			userId: this.userId,
			intent: "YEP",
		}) 
		
		if(succes) {
			return {
				roomId: room_id,
				title: title
			}
		} else {
			return false
		}*/
		
		
	},
	
	//Adds a userID to a room , takes an object with userId and intent string and optionaly ready time
	"roomAddUser" : function(args) {
		console.log("Adding user ",args.userId," with intent ",args.intent," to room ",args.roomId)
		if(!args) {return false;}
		if(!args.roomId) {return false;}
		
		var userid;
		var intent;
		
		if(args.userId) {
			 userId = args.userID;
		} else {
			return false;
		}
		
		if(args.intent) {
			intent = args.intent
		} else {
			return false;
		}
		
		
		Rooms.update(args.roomId,{
			$push : {users : {userId:args.userId,intent:args.intent}}
		});
		
		return true
	},
	
	//Sets intent for specific user in specific room
	roomSetUserIntent : function(args) {
	
		if(!args) {return false;}
		if(!args.roomId) {return false;}
		if(!args.intent) {return false;}
		if(!args.userId) {return false;}
		
		//Prevent people changing other people's intent
		if(args.userId != this.userId) {return false} 
		
		var result = Rooms.update({
			_id: args.roomId,
			"users.userId" : args.userId
		},{
				$set : {
					"users.$.intent" : args.intent
				}
		});
		
	},
	
	userChangeName : function(args) {
		if(!(args && args.id)) {
			throw new Meteor.Error("invalid_arguments_userchangename","Invalid arguments to change user name method","ID: "+args.id+" Name:"+args.name)
		}
		
		if(this.userId!=args.id) {
			throw new Meteor.Error("security_userchangename","Requesting user and target user for changename don't match",this.userid+" "+args.id)
		}
		
		
		Meteor.users.update(args.id,{
			$set : {
				username: args.name,
				"profile.changedUserName" : !!args.name
			}
		})
	
	
	}
});

