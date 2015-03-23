var Example_events = [
"another round of Payday",
"a game of Cards Against Humanity",
"D&D",
"Team Fortress",
"Pair Programming"
]

function setRandomEvent() {
	Session.set("example_event",_.sample(Example_events))
}

Session.setDefault("example_event","an event")
Meteor.setInterval(setRandomEvent,4000)