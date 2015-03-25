var Example_events = [
"Payday",
"Cards Against Humanity",
"D&D",
"Team Fortress",
"Pair Programming",
"Tabletop Simulator",
"Dota",
"Counter Strike",
"raiding"
]

function setRandomEvent() {
	Session.set("example_event",_.sample(Example_events))
}

Session.setDefault("example_event","an event")
Meteor.setInterval(setRandomEvent,4000)