var userFields = {
	//username:1, //username is unique and usually used for login names, lets use a more casual profile.username
	profile:1,
	_id:1,
	rooms:1,
}

//Null publishes to all users without having to subscribe
Meteor.publish(null,function(){
	return Meteor.users.find(this.userId,{fields:userFields})
})

//Returns room itself TODO?: Maybe merge with room_userdata, can just return multiple cursors
Meteor.publish("room_single",function(id){
	return Rooms.find(id);
})

//Returns room members
Meteor.publish("room_userdata",function(roomId) {

	return Meteor.users.find({
		"rooms.roomId" : roomId //rooms is an array containing objects, but Mongo is really neat, so this works!
	},{
		fields: userFields
	})
	
	//console.log("found "+q.count()+ " users to give to user "+this.userId+" in room "+roomId)
	//return q
})

//BEHOLD: A HORRIBLE WAY TO IMPLEMENT ROOMS
/*
Meteor.publish("room_userdata",function(roomId){
	console.log("Ran sub for user "+this.userId)
	var room = Rooms.findOne(roomId)
	var orQuery = [] //naming \o/
	
	if (room && room.users) {
		console.log("Got room")
		for(var i=0;i<room.users.length;i++) {
			orQuery.push({_id : room.users[i].userId})
		}
	}
	
	
	if(orQuery.length>0) {
		console.log("Doing DB query")
		var findQuery = {}
		findQuery.$or = orQuery 
		var q = Meteor.users.find(findQuery,{
			fields : {
				profile : 1,
				username : 1,
				_id : 1
			}
		})
		console.log("Found users #"+q.count()+", returning")
		return q
	}
	console.log("No return")

})*/
