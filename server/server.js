Meteor.publish("room_single",function(id){
	return Rooms.find(id);
})

Meteor.publish("room_userdata",function(roomId) {
	return Meteor.users.find(
	{roomId:roomId},
	{fields: {
		username:1,
		profile:1,
		_id:1,
		roomId:1,
		intent:1,
		changedUserName:1
		
		}}
	)
})
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
