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
		
		var title = args.title || 'Unnamed room'
		
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
		
		Meteor.users.update(userId,{
			$addToSet: { //$addtoSet prevents duplicates, unlike $push
				rooms : {
					roomId: roomId,
					intent : "YEP"
				}
			}
		})
		
		return true
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
				"rooms.$.intent" : intent
			}
		})
		
	},
	
	//Change username of currently logged in user, reset if false-ish
	userChangeName : function(newname) {
		check(newname,String)
		Meteor.users.update(this.userId,{
			$set : {
				"profile.username": (!!newname && newname),
			}
		})
	}
	
});