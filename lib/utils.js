Utils = (function(){ //module pattern

//Naming \o/ 
//Check of objects in array have property that matches value, if so, returns the entire object
this.arrayElementsPropertyMatches = function(array,property,value) { 
	for(var i=0;i<array.length;i++) {
		if(array[i][property]==value) {
			return array[i]
		}
	}
	return false
}

this.roomContainsUser = function(roomId,user) {
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
	return user.rooms && this.arrayElementsPropertyMatches(user.rooms,"roomId",roomId) 
}

return this	
})() //end of module
	

/*
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
*/

/*
//Helper
function roomContainsUser(roomId,user) {
	
	//IndexOf won't work AFAIK since we need to know the exacty object, including the intent field
	//So lets use an helper function instead
	//TODO: Make generic version and move to utils lib
	
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
	return user.rooms && Utils.arrayElementsPropertyMatches(user.rooms,"roomId",roomId) 
}*/