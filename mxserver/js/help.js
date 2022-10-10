/*
############################################################
Help for unprivileged commands
############################################################
*/
var slob_cmds_help = {
ignore: [
"server,ignore <none|specs|all>",
"Ignores chat messages from the specified group when you're racing.",
],

info: [
"server,info",
"Shows info about the current race.  (Track, laps, etc.)",
],

gate: [
"server,gate <gate number>",
"Sets the current client's gate preference.",
],

listplayers: [
"server,listplayers [search string]",
"Lists all the clients on the server.  If search string is given, only",
"list players whose name or number matches the string.",
],

listtracks: [
"server,listtracks",
"Lists the tracks available on the server.",
],

play: [
"server,play",
"Puts current client in player mode for further races.",
],

spec: [
"server,spec",
"Puts current client in spectator mode for further races.",
],

restart: [
"server,restart",
"Votes to restart the race.",
],

norestart: [
"server,norestart",
"Withdraws vote to restart the race.",
],
};

/*
############################################################
Help for marshal commands
############################################################
*/
var marshal_cmds_help = {

allignore: [
"server,allignore <none|specs|all>",
"Change the ignore setting for every client on the server.",
],

ban: [
"server,ban <UID> [minutes] [reason]",
"Bans the specified client.  If minutes is not specified or 0 the ban",
"is permanent.  This only affects the internal ban list.  It does not",
"change the ban file.",
],

broadcast: [
"server,broadcast <message>",
"Echoes a message to all clients.",
],

broadcastto: [
"server,broadcastto <slot or UID> <message>",
"Echoes a message to a specific client.  Use either a UID or a slot",
"number prefixed by \"s\", e.g. \"server,broadcastto s15 hello\".",
],

clearclass: [
"server,clearclass",
"Clears the approved bikes list.  This will allow any bike in.",
],

erode: [
"server,erode <amount>",
"Sets the track erosion amount.",
],

forcegate: [
"server,forcegate <UID> <gate number>",
"Forces the specified client's gate choice.",
],

forceplay: [
"server,forceplay <UID or ALL>",
"Forces the specified client into player mode for further races.",
],

forcespec: [
"server,forcespec <UID or ALL>",
"Forces the specified client into spectator mode for further races.",
],

homologate: [
"server,homologate <bike>",
"Adds a bike to the approved bikes list.  If a rider is on a bike that",
"isn't in the list, he will be put on the first bike in the list.",
],

kick: [
"server,kick <slot number>",
"Kicks a player off the server.",
],

knockout: [
"server,knockout <1st remount delay> <2nd delay> <nth delay>",
"Sets the \"knockout\" delays.  The delays are in 1/128 second units.",
"When the delay is non-zero, the rider will take that much longer to",
"remount after he falls off.  Currently up to 16 delays are supported.",
"Requires client version 17.",
],

listbans: [
"server,listbans",
"Lists the internal bans.  The bans from the ban file will not be in",
"this list.",
],

lock: [
"server,lock",
"server,unlock",
"Locks/unlocks the server.  When the server is locked players start out",
"in spec mode and cannot switch from spec to play mode and vice versa.",
],

lockgate: [
"server,lockgate",
"server,unlockgate",
"Locks/unlocks the gate.  When the gate is locked players can't change",
"their gate pick.",
],

mute: [
"server,mute <UID> [minutes]",
"Prevents a player from chatting.",
],

nexttrack: [
"server,nexttrack",
"Selects the next track in the list.",
],

settrack: [
"server,settrack <track number>",
"Jumps to a specific track in the list.",
],

};

/*
############################################################
Help for admin commands
############################################################
*/
var admin_cmds_help = {

addmarshal: [
"server,addmarshal <uid>",
"Adds a track marshal.",
],

addrole: [
"server, addrole <role> <uid>",
"Adds a specified role to a players name"
],

addtrack: [
"server,addtrack <time> <laps> <change interval> <trackinfo>",
"Adds a new track with the given time, laps and track change interval.",
"The times are in minutes.",
],

at: [
"server,at <time> <command>",
"Runs command at specified time.  Time can be either a UNIX timestamp",
"or a relative time consisting of the number of seconds with a plus",
"sign prefix.  E.g. \"server, at +60 broadcast 1 minute has passed\".",
],

clearmarshals: [
"server,clearmarshals",
"Removes all track marshals",
],

clearschedule: [
"server,clearschedule",
"Forgets all commands scheduled with \"server,at\".",
],

exec: [
"server,exec <script>",
"Executes a script stored on the server.  Scripts must begin with a",
"line that reads \"#mxserverscript\", followed by a series of server",
"commands (without the server, prefix).",
],

listmarshals: [
"server,listmarshals",
"Lists the current track marshals.",
],

listroles: [
"USAGE: server, listranks",
"Lists all uids and which roles they are tied to"
],

listrolesavail: [
"USAGE: server, listrolesavail",
"Lists all available roles that can be assigned to players"
],

listschedule: [
"server,listschedule",
"Lists all commands scheduled with \"server,at\".",
],

maxclients: [
"server,maxclients <max> [reserved]",
"Sets the maximum number clients and optionally the number of slots set",
"aside for reserved UIDs.",
],

maxplayers: [
"server,maxplayers <max>",
"Sets the maximum number of players.",
],

raceserver: [
"server, raceserver <true or false>",
"Sets the race server value to either true or false for races"
],

removemarshal: [
"server,removemarshal <uid>",
"Removes a track marshal.",
],

removerole: [
"server, removerole <role or all> <uid>",
"Removes a specified role or all roles from a players name with uid 'uid'"
],

removetrack: [
"server,removetrack <track number>",
"Removes the specified track.",
],

reserve: [
"server,reserve <UID or ALL>",
"Adds a UID to the reserved list.  If ALL, it will reserve the UIDs of",
"all currently connected clients.",
],

serverrate: [
"server,serverrate <bytes per second>",
"Sets the server's outgoing byte rate in bytes per second.",
],

shutdown: [
"server,shutdown",
"Shuts down the server.",
],

signupsneeded: [
"server, signupsneeded <true or false>",
"Sets requirement whether riders need to be signed up to be in the server or not."
],

unreserve: [
"server,unreserve <UID or ALL>",
"Removes a UID from the reserved list.  If ALL, it will clear the",
"reserved list.",
],

updatetracklist: [
	"server, updatetracklist",
	"Adds all tracks in current track list to a file called tracklist.csv"
],

};

function add_cmds_wrap(r, obj) {
	var i, s;

	s = ""
	for (i in obj) {
		if (s.length + 1 + i.length > 80) {
			r.push(s);
			s = "";
		}
		s = s + " " + i;
	}
	r.push(s);
}

function help(slot, cmdline) {
	var m, r, i;

	if (cmdline.match(/^\s*help\b/) == null)
		return help_prev(slot, cmdline);

	m = cmdline.match(/^\s*help\s*(.*)/);

	if (m[1] == "") {
		r = [ "Type \"server,help [command]\" for help on a specific command" ];
		r.push("For example, \"server,help listplayers\" for help on \"listplayers\"");
		r.push("<Angle brackets> denote required parameters");
		r.push("[Square brackets] denote optional parameters");
		r.push("Available commands for all clients:");
		add_cmds_wrap(r, slob_cmds_help);
		r.push("Available commands for marshals:");
		add_cmds_wrap(r, marshal_cmds_help);
		r.push("Available commands for admins:");
		add_cmds_wrap(r, admin_cmds_help);
	} else if (m[1] in slob_cmds_help)
		r = slob_cmds_help[m[1]];
	else if (m[1] in marshal_cmds_help)
		r = marshal_cmds_help[m[1]];
	else if (m[1] in admin_cmds_help)
		r = admin_cmds_help[m[1]];
	else
		r = [ "Sorry, there is no help for that subject" ];

	for (i in r)
		mxserver.send(slot, r[i]);

	return 1;
}

var help_prev = mxserver.command_handler;
mxserver.command_handler = help;


function help_greeting(slot) {
	help_greeting_prev(slot);
}
var help_greeting_prev = mxserver.connect_handler;
mxserver.connect_handler = help_greeting;
