Template.edit_field.events({
	"submit" : function(e,tmp) {
		Session.set("editing_"+Template.currentData().name,false);
		e.preventDefault();
	},

	'click [data-action]' : function(e,tmp) {
		Session.set("editing_"+Template.currentData().name,false);
	},
});

Template.edit_field.onRendered(function(){
	if(Template.currentData().autofocus) {
		Template.instance().find("input").focus();
	}
});

Template.edit_field.helpers({
	"id" : function() {
		return "edit_field_"+Template.currentData().name;
	}
});
