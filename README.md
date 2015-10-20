Wavelength is a framework that simplifies working with the Alexa SDK
when using Amazon Lambda services on the back-end. 

The Alexa Skills Kit is the programming interface to create skills for
Amazon Echo devices and other Alexa enabled services.

Amazon Lambda is a computing mechanism where you can write a "cloud function"
that can be hosted and executed on demand. Instead of running a server
24/7, AWS takes care of making your function available (and scaling
to handle request capacity). AWS has a rather generous free-tier so
you should be able to host quite a few lambda functions before incurring any 
charges.

For information on how to develop skills using the Alexa Skills Kit,
go to: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit

And for information about using AWS Lambda, see:
http://docs.aws.amazon.com/lambda/latest/dg/welcome.html

Amazon makes it very straight-forward to trigger your lambda function 
from the Alexa Skill.

The project name of wavelength is because lambda is the symbol for 
wavelength in physics equations and an echo is the reflection of a sound wave.

# Example
```
var wavelength = require("wavelength");

var router = wavelength.Router();
module.exports = router;

router.launch(function(event) {
	return wavelength.Response()
		.text("Tough decision to make? I'll help you pick. For example, you can ask: 'Should I choose chocolate, or vanilla?'")
		.reprompt.text("Go ahead, ask me something like: red, or blue");
});

router.intent("ChooseIntent", function(params, event) {
	console.log("Params - " + JSON.stringify(params));
	if(!params.first || !params.second) {
		return wavelength.Response()
			.text("I didn't understand your choices, please say something like: 'should I choose the red shoes or the black ones'")
			.reprompt.text("Go ahead, don't be shy.");
	}
	var chosen = (Math.random()<0.5) ? params.first : params.second;
	console.log("Choice was " + chosen);
	return wavelength.Response()
		.text("Between " + params.first + " and " + params.second + " I would choose " + chosen)
		.end_session(event.session.new)
		.reprompt.text("Can I help you with any other decisions?");
});

router.intent("Goodbye", function(params, event) {
	return wavelength.Response()
		.text("Good luck. Let me know how it goes!")
		.end_session(true);
});
```

# Router/Response Features
1. Router class to handle intent/launch mapping
2. session_started and session_ended events
3. Optional application-id validation on requests
4. Synchronous or Asynchronous handler definitions
5. Simplified access to slot parameters and full access to the event data
6. Session attribute management
7. Build responses with text/ssml, including reprompts, cards, and options.

```
// Usage:
var wl = require("wavelength");
var router = wl.Router();

router.launch(function(event) { // Synchronous launch
   return wl.Response(event).text("response");
});

router.launch(function(event, callback) { // Asynchronous launch
    callback(wl.Response(event).text("response"));
});

router.intent("intent_name", function(params, event) { // Synchronous intent
    return wl.Response(event).text("response");
});

router.intent("intent_name", function(params, event, callback) { // Asynchronous intent
   callback(wl.Response(event).text("response"))
});

router.session_started(function(event, context, callback) { // session_started hook
  callback();
});

router.session_ended(function(event, context, callback) { // session_ended hook
  callback();
});

// Set router.applicationId to your application's ID if you want to verify the applicationId on each request.
```
