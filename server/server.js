Meteor.publish("room_single",function(id){
	return Rooms.find(id);
})

Meteor.publish("room_userdata",function(roomId){
	return nil //TODO: Publish info about roommates
})