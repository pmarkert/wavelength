module.exports = function(event, context) {
	return new Router(event, context);
}

function Router(event, context) {
	var self = this;	
	self.intents = {};
	self.applicationId = null;
	self.intent = function(intent_name, callback) {
		self.intents[intent_name] = callback;
	};
	self.launch = function(callback) {
		self.launch_handler = callback;
	};
	self.handler = handler;

	function handler(event, context) {
		try {
			if(self.applicationId && !validateApplicationId(event.session.application.applicationId)) {
				console.log("ApplicationId validation failure - from event.session.application.applicationId=" + JSON.stringify(event.session.application.applicationId));
				return context.fail("Invalid Application ID");
			}
			console.log("Request event: " + JSON.stringify(event));

			if (event.session.new) {
				console.log("session_started requestId=" + event.request.requestId + ", sessionId=" + event.session.sessionId);
				if(self.session_started) {
					return self.session_started(event, context, function() {
						handle_request(event, context);
					});
				}
			}
			if (event.request.type === "SessionEndedRequest") {
				console.log("session_ended requestId=" + event.request.requestId + ", sessionId=" + event.session.sessionId);
				if(self.session_ended) {
					return session_ended(event, context, function() {
						context.done();
					});
				}
				return context.succeed();
			}
			handle_request(event, context);
		} 
		catch (e) {
			if(e.stack) {
				console.log("Caught unhandled stack-trace error: " + e.stack);
			}
			else {
				console.log("Caught unhandled error: " + JSON.stringify(e));
			}
			context.fail("An error occurred.");
		}
	}

	function handle_request(event, context) {
		var handler;
		var params = {};
		if (event.request.type === "LaunchRequest") {
			console.log("LaunchRequest.");
			if(!self.launch_handler) {
				console.log("ERROR: No Launch handler defined!");
				return context.fail("Launch Request not registered.");
			}
			if(self.launch_handler.length === 2) {
				return handler(event, function(response) {
					context.succeed(response.render());
				});
			}
			else {
				return context.succeed(self.launch_handler(event).render());
			}
		}
		else if (event.request.type === "IntentRequest") {
			console.log("IntentRequest - " + event.request.intent.name);
			for(var key in event.request.intent.slots) {
				params[key] = event.request.intent.slots[key].value;
			}
			handler = self.intents[event.request.intent.name];
			if(!handler) {
				console.log("Intent - " + event.request.intent.name + " not registered.");
				return context.fail("Invalid Intent");
			}
			if(handler.length === 3) {
				return handler(params, event, function(response) {
					context.succeed(response.render());
				});
			}
			else {
				return context.succeed(handler(params, event).render());
			}
		}
	};

	function validateApplicationId(applicationId) {
		var requestingApplicationId = applicationId.replace("^amzn1.echo-sdk-ams.app.","");
		if(Array.isArray(self.applicationId)) {
			if(self.applicationId.indexOf(requestingApplicationId)==-1) {
				return false;
			}
		}
		else if(typeof self.applicationId === "string") {
			if(requestingApplicationId !== self.applicationId) {
				return false;
			}
		}
		return true;
	}
}
