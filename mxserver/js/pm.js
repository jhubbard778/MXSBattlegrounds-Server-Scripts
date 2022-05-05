/*
############################################################
"pm" command
send a private message
first arg is UID or slot number as "s##"
example: pm 176 Hello wheels!
############################################################
*/
function send_private_message(slot, to, message) {
	var i;
	var normal = "\x1b[0m"; /* use ANSI codes to make the PM stand out */
	var bright = "\x1b[1m ";
	var magenta = "\x1b[35m";

	msg = bright + magenta + mxserver.get_slot_info(slot).name + " whispers to you: " + message + normal;
	if (to[0] == "s") {
		mxserver.send(parseInt(to.substring(1)), msg);
		return;
	}

	to = parseInt(to);

	for (i = 0; i < mxserver.max_slots; i++)
		if (to == mxserver.get_uid(i))
			mxserver.send(i, msg);
}

function private_message(slot, cmdline) {
	var m;

	if (cmdline.match(/^\s*pm\b/) == null)
		return private_message_prev(slot, cmdline);

	m = cmdline.match(/^\s*pm\s+(s[0-9]+|[0-9]+)\s*(.*)/);

	if (m == null) {
		mxserver.send(slot, "Usage: pm <UID> <message>");
		return 1;
	}

	send_private_message(slot, m[1], m[2]);
	return 1;
}

var private_message_prev = mxserver.command_handler;
mxserver.command_handler = private_message;
