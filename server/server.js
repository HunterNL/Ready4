Meteor.publish("room_single",function(id){
	return Rooms.find(id);
})