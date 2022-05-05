/*
############################################################
"myinfo" command
send client's info to himself
############################################################
*/
function send_info(slot) {
	var k, info;

	info = mxserver.get_slot_info(parseInt(slot));

	for (k in info)
		mxserver.send(slot, k + ": " + info[k]);
}

function myinfo(slot, cmdline) {
	var m;

	if (cmdline.match(/^\s*myinfo\b/) == null)
		return myinfo_prev(slot, cmdline);

	m = cmdline.match(/^\s*myinfo\s*(.*)/);

	if (m[1].length > 0) {
		/* complain if there was extra junk after 'myinfo' */
		mxserver.send(slot, "extra junk after 'myinfo' command");
		return 1;
	}

	send_info(slot);

	return 1;
}

var myinfo_prev = mxserver.command_handler;
mxserver.command_handler = myinfo;
