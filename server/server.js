Meteor.publish("room_single",function(id){
	return Rooms.find(id);
})

Meteor.publish("room_userdata",function(roomId){
	var room = Rooms.findOne(roomId)
	if (room && room.users) {
		
		var orQuery = [] //naming \o/
		
		for(var i=0;i<room.users.length;i++) {
			orQuery.push({_id : room.users[i].userId})
		}
	}
	
	var findQuery = {}
	findQuery.$or = orQuery || {}
	return Meteor.users.find(findQuery,{
		fields : {
			profile : 1,
			username : 1,
			_id : 1
		}
	})

})