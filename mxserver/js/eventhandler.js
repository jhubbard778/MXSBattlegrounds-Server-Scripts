/*
############################################################
Event Handler

This will handle the creation and running of 
events/races on the server
############################################################
*/
var colors = {
	normal: "\x1b[0m",
	bright: "\x1b[1m",
	black: "\x1b[30m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
	white: "\x1b[37m",
	bgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m"
};

var admins;
var hosts;
function read_roles() {
    admins = mxserver.file_to_string("../roles/admins.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
    hosts = mxserver.file_to_string("../roles/hosts.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
}
var read_roles_prev = mxserver.start_handler;
mxserver.start_handler = read_roles;

function list_avail_events(slot, cmdline)
{
	var uid = mxserver.get_uid(slot);
	var rank = mxserver.get_rank(slot);

	if (cmdline.match(/^\s*listevents\b/) == null)
		return list_avail_events_prev(slot, cmdline);

	if (rank != "Admin" && admins.indexOf(uid) === -1 && hosts.indexOf(uid) === -1) {
		mxserver.send(slot, "Permission Denied");
		return 1;
	}

	mxserver.send(slot, colors.BgYellow + "List of events to choose from:" + colors.normal);
	mxserver.send(slot, colors.BgYellow + "national" + colors.normal);
	mxserver.send(slot, colors.BgYellow + "sx" + colors.normal);
	mxserver.send(slot, colors.BgYellow + "ax" + colors.normal);
	mxserver.send(slot, colors.BgYellow + "triplecrown" + colors.normal);
	mxserver.send(slot, colors.BgYellow + "shootout" + colors.normal);
	mxserver.send(slot, colors.BgYellow + "straightrhythm" + colors.normal);
	return 1;
}
var list_avail_events_prev = mxserver.command_handler;
mxserver.command_handler = list_avail_events;