Rooms = new Mongo.Collection("rooms");

Router.route("/",function() {
	this.render("home");
}, {
	name: "home"
});

//Helper
function roomContainsUser(roomId,user) {
	
	//IndexOf won't work AFAIK since we need to know the exacty object, including the intent field
	//So lets use an helper function instead
	function arrayContainsRoom(array,roomId) {
		for(var i=0;i<array.length;i++) {
			if(array[i].roomId===roomId) {
				console.log("found user")
				return true
			}
		}
		console.log("didn't find user")
		return false
	}
	
	check(roomId,String)
	Match.test(user,Match.OneOf(String,{rooms:Array}))
	
	if(typeof user == String) {
		var resolved_user = Meteor.users.findOne(user) //Resolve user if given userId
		
		if(resolved_user) {
			user = resolved_user
		} else {		
			throw new Meteor.error("user_not_found","Did not find user in roomContainsUser","RoomId: "+roomId+"  userID: "+user)
		}
	}
	return user.rooms && arrayContainsRoom(user.rooms,roomId) 
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
			if(!roomContainsUser(room._id,Meteor.user())) {
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
		
		Meteor.users.update(userId,{
			$addToSet: { //$addtoSet prevents duplicates, unlike $push
				rooms : {
					roomId: roomId,
					intent : "YEP"
				}
			}
		})
		
		return true
	},
	
	//Sets logged in user's intent
	userSetIntent : function(intent,roomId) {
		check(intent,String)
		check(roomId,String)
		
		Match.test(intent,Match.OneOf("YEP","NOPE","LATER"))
		
		Meteor.users.update({
			_id: this.userId,
			"rooms.roomId": roomId
		},{
			$set : {
				"rooms.$.intent" : intent
			}
		})
		
	},
	
	//Change username of currently logged in user, reset if false-ish
	userChangeName : function(newname) {
		check(newname,String)
		Meteor.users.update(this.userId,{
			$set : {
				"profile.username": (!!newname && newname),
			}
		})
	},
	
	//Remove me sometime
	WIPE : function() {
		Meteor.users.remove({})
		Rooms.remove({})
	},
	
	INFO : function() {
		var users = Meteor.users.find()
		users.forEach(function(user){
			console.dir(user,{
				showHidden: true,
				depth: 2,
				colors: true
			})
		})
	}
});

