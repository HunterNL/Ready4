//Homepage route
Router.route("/",function() {
	this.render("home");
}, {
	name: "home"
});

//Room route
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
			if(!Utils.roomContainsUser(room._id,Meteor.user())) {
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