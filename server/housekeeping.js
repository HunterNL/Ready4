(function() { //Module pattern

function getCutoffDate() {
	var date_7_days_ago = Date.now() - (7 * 24 * 60 * 60 * 1000) //7 days
	var date_7_days_ago = new Date(date_7_days_ago) //Convert to date object
	return new Date(date_7_days_ago)
}

function clearOldUsers() {

	var users_removed_count = Meteor.users.remove({
		date_last_activity : {$lt: getCutoffDate()}
	})
	
	console.log("Removed "+users_removed_count+ " inactive users")
}

function clearOldRooms() {
	var room_removed_count = Rooms.remove({
		date_last_activity : {$lt: getCutoffDate()}
	})
	console.log("Removed "+room_removed_count+ " inactive rooms")
}

Meteor.startup(function(){
	clearOldUsers()
	clearOldRooms()
	Meteor.setInterval(clearOldUsers,60*60*1000) //1 hour
	Meteor.setInterval(clearOldRooms,60*60*1000) //1 hour
})

}())//Module pattern end

