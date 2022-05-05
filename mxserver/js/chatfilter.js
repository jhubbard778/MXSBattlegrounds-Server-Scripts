/*
############################################################
Chat filter
############################################################
*/

var blacklist = [
	// Enter Words to filter out
];

function chat_filter(slot, msg) {
	for (var i = 0; i < blacklist.length; i++) {
		messageSent = msg.toLowerCase();
		if (messageSent.includes(blacklist[i])) {
			mxserver.send(slot, "\x1b[31mMessage Declined.  You said: " + msg.toString() + "\x1b[0m");
			return 1;
		}
	}
	return chat_filter_prev(slot, msg);
}
var chat_filter_prev = mxserver.chat_handler;
mxserver.chat_handler = chat_filter;
