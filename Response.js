module.exports = function(event) { 
	return new Response(event); 
}

function Response(event) {
	self = this;

	self.version = "1.0";
	if(event) {
		self.session = event.session;
	}
	self.response_text = "";
	self.card_text = "";
	self.reprompt_text = "";
	self.should_end_session = false;

	self.text = append_text_response;
	self.ssml = append_ssml_response;
	self.card = {
		simple : simple_card,
		link_account : link_account_card
	};
	self.reprompt = {
		text : reprompt_text,
		ssml : reprompt_ssml
	};
	self.end_session = end_session;
	self.session = set_session;
	self.render = render;

	return self;

	function append_text_response(message) {
		if(self.response_type && self.response_type != "PlainText") {
			throw { message: "cannot append text to existing response of different type" };
		}
		self.response_type = "PlainText"; if(self.response_text) {
			self.response_text += "\n";
		}
		self.response_text += message;
		return self;
	}

	function append_ssml_response(message) {
		if(self.response_type && self.response_type != "SSML") {
			throw { message: "cannot append ssml to existing response of different type" };
		}
		if(self.response_text) {
			self.response_text += "\n";
		}
		self.response_type = "SSML";
		self.response_text += message;
		return self;
	}

	function simple_card(content, title) {
		if(self.card_type && self.card_type != "Simple") {
			throw { message: "cannot set simple card with existing card of different type" };
		}
		if(self.card_text) {
			self.card_text += "\n";
		}
		self.card_type = "Simple";
		self.card_text += content;
		if(title) {
			self.card_title = title;
		}
		return self;
	}

	function link_account_card() {
		if(self.card_type && self.card_type != "LinkAccount") {
			throw { message: "cannot set linkaccount card with existing card of different type" };
		}
		self.card_type = "LinkAccount";
		return self;
	}

	function reprompt_text(message) {
		if(self.reprompt_type && self.reprompt_type != "PlainText") {
			throw { message: "cannot set reprompt with existing reprompt of different type" };
		}
		self.reprompt_type = "PlainText";
		if(self.reprompt_text) {
			self.reprompt_text += "\n";
		}
		self.reprompt_text += message;
		return self;
	}

	function reprompt_ssml(message) {
		if(self.reprompt_type && self.reprompt_type != "SSML") {
			throw { message: "cannot set reprompt with existing reprompt of different type" };
		}
		self.reprompt_type = "SSML";
		if(self.reprompt_text) {
			self.reprompt_text += "\n";
		}
		self.reprompt_text += message;
		return self;
	}

	function end_session(end_session) {
		if(typeof end_session === "undefined") {
			end_session = true;
		}
		self.should_end_session = end_session;
		return self;
	}

	function set_session(session) {
		if(session.attributes) {
			self.session = session;
		}
		else {
			self.session = { attributes: session };
		}
		return self;
	}

	function render() {
		var result = {
			version: self.version,
		};

		if(self.session && self.session.attributes) {
			result.sessionAttributes = self.session.attributes;
		}

		result.response = output_speech(self.response_type, self.response_text);

		if(self.card_type) {
			result.response.card = {
				type: self.card_type,
				title: self.card_title,
				content: self.card_text
			}
		}

		if(self.reprompt_type) {
			result.response.reprompt = output_speech(self.reprompt_type, self.reprompt_text);
		}

		result.response.shouldEndSession = self.should_end_session;

		return result;
	}

	function output_speech(type, text) {
		var result = {
			outputSpeech: {
				type: type
			}
		};
		if(type === "PlainText") {
			result.outputSpeech.text = text;
		}
		else if(type === "SSML") {
			result.outputSpeech.ssml = text;
		}
		else {
			console.log("Unexpected type - " + type);
			throw { message: "Unexpected value for speech_type - ", type: type };
		}
		return result;
	}
}
