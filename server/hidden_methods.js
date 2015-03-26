//Dangerous methods we don't want the client to know about
//TODO: Remove these when doing an actual release, like, really
Meteor.methods({
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
})