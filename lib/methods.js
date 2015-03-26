Meteor.methods({
	/*Creates a new room, takes:
		args.title		Room title
		args.roomId 		Room ID
		All required
	*/
	roomCreate : function(args) { //Err, still uses old argument style
		check(args,{
			title : String,
			roomId : String
		})
		
		var title = args.title 
		
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
		//Meteor.users.update(this.userId,{$set:{roomId:args.roomId}}) //Users will nicely add themselves now
	},
	
	//Adds logged in user to given room
	roomAddUser : function(roomId) {
		check(roomId,String)
		var userId = this.userId
		if(Utils.roomContainsUser(roomId,userId)) {return false}
		
		console.log("Adding user "+this.userId+" to room "+roomId)
		
		//Add room to user room array
		Meteor.users.update({
			_id : userId,
			"rooms.roomId" : {$ne : roomId} //Prevents duplicates
		},{
			$push: { 
				rooms : {
					roomId: roomId,
					intent : "YEP",
					date_joined : new Date()
				}
			},
			$set : {
				date_last_activity : new Date(),
			}
		})
		
		//Update room activity date
		Rooms.update(roomId,{
			$set : {
				date_last_activity : new Date()
			}
		})
		
		return true
	},
	
	roomChangeTitle : function(roomId,title) {
		check(roomId,String)
		check(title,String)
		
		var owner = Rooms.findOne(roomId).owner
		if(owner != this.userId) {throw new Meteor.error("security_invalid_room_owner","Somebody who is not the room owner tried to change the room title","userId: "+this.userId+" roomId: "+roomId+" new title: "+title)}
		
		//Update actual room title and activity
		Rooms.update(roomId,{
			$set: {
				title: title,
				date_last_activity: new Date()
			}
		})
		
		//And update user activity
		Meteor.users.update(this.userId,{
			$set : {
				date_last_activity : new Date()
			}
		})
		
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
				"rooms.$.intent" : intent,
				date_last_activity : new Date()
			}
		})
		
	},
	
	//Change username of currently logged in user, reset if false-ish
	userChangeName : function(newname) {
		check(newname,String)
		Meteor.users.update(this.userId,{
			$set : {
				"profile.username": (!!newname && newname),
				date_last_activity : new Date()
			}
		})
	}
	
});