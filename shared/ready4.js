Rooms = new Mongo.Collection("rooms");

Router.route("/",function() {
	this.render("home");
}, {
	name: "home"
});

//Helper
function roomContainsUser(roomId,userId) {
	check(roomId,String)
	check(userId,String)
	var user = Meteor.users.findOne(userId)
	return (user.roomId===roomId) 
}

//Main route
Router.route("/:name/:_id",function() {
	console.log("Ran room route")
	
	//Wait untill we got the room info
	//TODO: Don't wait and add fancy animations to hide loading times :)
	this.wait(Meteor.subscribe("room_single",this.params._id))
	this.wait(Meteor.subscribe("room_userdata",this.params._id))
	
	//Hurray reactive programming
	if(this.ready())  {
		var room = Rooms.findOne(this.params._id);
		
		if(!room) {
			//No room, lets go get the server to make one!
			Meteor.call("roomCreate",{
				title: this.params.name,
				roomId: this.params._id,
			})
			
			//And show the user a loading screen
			this.render("loading")
			
		} else {
			//If we got a room, add ourselves if we're not in already
			if(!roomContainsUser(room._id,Meteor.userId())) {
				Meteor.call("roomAddUser",room._id)
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


 
Meteor.methods({
	/*Creates a new room and adds the logged in user to it , takes:
		args.title		Room title
		args.roomId 		Room ID
		All required
	*/
	roomCreate : function(args) {
		check(args,{
			title : String,
			roomId : String
		})
		
		var title = args.title || 'Unnamed room'
		
		var query = {
			owner: this.userId,
			title: title,
			date_created : new Date(),
			date_last_activity : new Date(),
		}
		
		if(args.roomId) {
			query._id = args.roomId
		}
		
		if(Rooms.findOne(args.roomId)) {
			throw new Meteor.error("duplicate_room_id","Duplicate room id","ID: "+args.roomId)
		}
		
		var room_id = Rooms.insert(query);
		Meteor.users.update(this.userId,{$set:{roomId:args.roomId}})
	},
	
	//Adds logged in user to given room
	roomAddUser : function(roomId) {
		check(roomId,String)
		var userId = this.userId
		if(roomContainsUser(roomId,userId)) {return false}
		
		console.log("Adding user "+this.userId+" to room "+roomId)
		
		Meteor.users.update(userId,{$set: {
			roomId:roomId,
			intent:"YEP"
		}})
		
		return true
	},
	
	//Sets logged in user's intent
	userSetIntent : function(intent) {
		check(intent,String)
		Match.test(intent,Match.OneOf("YEP","NOPE","LATER"))
		
		Meteor.users.update(this.userId,{
			$set : {
				intent : intent
			}
		})
		
	},
	
	//Change username of currently logged in user, reset if false-ish
	userChangeName : function(newname) {
		check(newname,String)
		var q = Meteor.users.update(this.userId,{
			$set : {
				username: newname,
				changedUserName : !!newname
			}
		})
		
		console.log(q)
	},
	
	//Remove me sometime
	WIPE : function() {
		Meteor.users.remove({})
		Rooms.remove({})
	}
});

