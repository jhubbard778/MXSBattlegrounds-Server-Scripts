/*
############################################################
"colormsg" command
broadcast a color message
use [red] [green] etc to add color codes to message
requires marshal privilege
example: colormsg [red]RED ALERT!
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
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m"
};

var admins;
var mods;
var hosts;
var streamers;
var champions;
var sponsors;
var suspendedUsers;

function read_roles() {
	// reads roles from file, splits into array, and maps all strings into numbers as long as they're greater than 0
	admins = mxserver.file_to_string("../roles/admins.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
	mods = mxserver.file_to_string("../roles/mods.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
	hosts = mxserver.file_to_string("../roles/hosts.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
	streamers = mxserver.file_to_string("../roles/streamers.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
	champions = mxserver.file_to_string("../roles/champions.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
	sponsors = mxserver.file_to_string("../roles/sponsors.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
	suspendedUsers = mxserver.file_to_string("../roles/suspended.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
}

var read_roles_prev = mxserver.start_handler;
mxserver.start_handler = read_roles;

function add_role_to_file(sender, role, sent_uid) {
	var already_in_role = true;
	var insufficient_perms = false;
	var successString = colors.green + "Successfully added uid " + sent_uid + " to " + role + " role!" + colors.normal;
	senderRank = mxserver.get_rank(sender);
	switch (role)
	{
		// Search to make sure uids aren't already in list
		case "admin":
			if (senderRank != "Admin") {
				mxserver.send(sender, colors.red + "You do not have permission to add administrators." + colors.normal);
				return;
			}

			// if not already in admin
			if (admins.indexOf(sent_uid) === -1) {
				admins[admins.length] = sent_uid;
				mxserver.string_to_file("../roles/admins.txt",admins.toString());
				// if uid was a mod or host, remove them from the mod/hosts file
				if (mods.indexOf(sent_uid) > -1)
					remove_roles_from_file(sender, "mod", sent_uid);

				if (hosts.indexOf(sent_uid) > -1)
					remove_roles_from_file(sender, "host", sent_uid);
				already_in_role = false;
			}
			break;
		// If person is already admin, do not add to mod list
		case "mod":
			if (admins.indexOf(sent_uid) > -1) {
				if (senderRank == "Admin")
					remove_roles_from_file(sender, "admin", sent_uid);
				else
					insufficient_perms = true;
			}

			if (!insufficient_perms) {
				if (mods.indexOf(sent_uid) === -1) {
					mods[mods.length] = sent_uid;
					mxserver.string_to_file("../roles/mods.txt",mods.toString());
					// if uid was a host, remove them from the hosts file
					if (hosts.indexOf(sent_uid) > -1)
						remove_roles_from_file(sender, "host", sent_uid);
					already_in_role = false;
				}
			}
			break;
		// If person is already admin or mod, do not add to host list
		case "host":

			if (admins.indexOf(sent_uid) > -1) {
				if (senderRank == "Admin")
					remove_roles_from_file(sender, "admin", sent_uid);
				else
					insufficient_perms = true;
			}

			if (!insufficient_perms) {
				if (mods.indexOf(sent_uid) > -1)
					remove_roles_from_file(sender, "mod", sent_uid);
				if (hosts.indexOf(sent_uid) === -1) {
					hosts[hosts.length] = sent_uid;
					mxserver.string_to_file("../roles/hosts.txt",hosts.toString());
					already_in_role = false;
				}
			}
			break;
		case "champion":
			if (champions.indexOf(sent_uid) === -1) {
				champions[champions.length] = sent_uid;
				mxserver.string_to_file("../roles/champions.txt",champions.toString());
				already_in_role = false;
			}
			break;
		case "sponsor":
			if (sponsors.indexOf(sent_uid) === -1) {
				sponsors[sponsors.length] = sent_uid;
				mxserver.string_to_file("../roles/sponsors.txt",sponsors.toString());
				already_in_role = false;
			}
			break;
		case "suspended":
			if (suspendedUsers.indexOf(sent_uid) === -1) {
				suspendedUsers[suspendedUsers.length] = sent_uid;
				mxserver.string_to_file("../roles/suspended.txt",suspendedUsers.toString());
				already_in_role = false;
			}
			break;
		case "streamer":
			if (streamers.indexOf(sent_uid) === -1) {
				streamers[streamers.length] = sent_uid;
				mxserver.string_to_file("../roles/streamers.txt",streamers.toString());
				already_in_role = false;
			}
			break;
		default:
			mxserver.send(sender, colors.red + "Error: role doesn't exist!"  + colors.normal);
			mxserver.send(sender, "Use " + colors.yellow + "'server, listrolesavail'" + colors.normal + " to see all roles");
			return;
	}

	if (already_in_role) {
		mxserver.send(sender, colors.red + "Error: UID " + sent_uid.toString() + " already in " + role.toString() + " role!" + colors.normal);
		mxserver.send(sender, "Use " + colors.red + "'server, listroles'" + colors.normal + " to see all uids that have roles");
		return;
	}
	if (insufficient_perms) {
		mxserver.send(sender, colors.red + "Error: Cannot demote user! Insufficient Permissions!" + colors.normal);
		return;
	}
	mxserver.send(sender, successString);
	return;

}

function is_marshal(slot) {
	var rank;

	rank = mxserver.get_string("rank", slot);

	return (rank == "Marshal" || rank == "Admin")
}

function convert_to_ansi(s) {
	return s.replace(/\[([^\]]+)\]/g, function (full, sub1) { if (sub1 in colors) return colors[sub1]; return full });
}

function broadcast_color_message(slot, msg) {
	if (!is_marshal(slot)) {
		mxserver.send(slot, "Permission denied");
		return;
	}
	mxserver.broadcast(convert_to_ansi(msg) + convert_to_ansi("[normal]"));
}

function colormsg(slot, cmdline) {
	var m;

	if (cmdline.match(/^\s*colormsg\b/) == null)
		return colormsg_prev(slot, cmdline);

	m = cmdline.match(/^\s*colormsg\s*(.*)/);

	broadcast_color_message(slot, m[1]);

	return 1;
}

var colormsg_prev = mxserver.command_handler;
mxserver.command_handler = colormsg;

function admin_mod_chat_messages(slot, msg) {
	var assigned_role = false;
	var output_rank = "(";
	var rider_info = mxserver.get_slot_info(slot);

	if (suspendedUsers.indexOf(rider_info.uid) > -1) {
		output_rank = "(" + colors.black + "Suspended" + colors.normal;
		assigned_role = true;
	}

	if (admins.indexOf(rider_info.uid) > -1) {
		if (assigned_role)
			output_rank += "/" + colors.red + "Admin" + colors.normal;
		else {
			output_rank = "(" + colors.red + "Admin" + colors.normal;
			assigned_role = true;
		}
	}

	if (mods.indexOf(rider_info.uid) > -1) {
		if (assigned_role)
			output_rank += "/" + colors.blue + "Mod" + colors.normal;
		else {
			output_rank = "(" + colors.blue + "Mod" + colors.normal;
			assigned_role = true;
		}
	}

	if (hosts.indexOf(rider_info.uid) > -1) {
		if (assigned_role)
			output_rank += "/" + colors.magenta + "Host" + colors.normal;
		else {
			output_rank = "(" + colors.magenta + "Host" + colors.normal;
			assigned_role = true;
		}
	}

	if (streamers.indexOf(rider_info.uid) > -1) {
		if (assigned_role)
			output_rank += "/" + colors.cyan + "Streamer" + colors.normal;
		else {
			output_rank = "(" + colors.cyan + "Streamer" + colors.normal;
			mxserver.log(output_rank + '\n');
			assigned_role = true;
		}
	}

	if (champions.indexOf(rider_info.uid) > -1) {
		if (assigned_role)
			output_rank += "/" + colors.yellow + "Champion" + colors.normal;
		else {
			output_rank = "(" + colors.yellow + "Champion" + colors.normal;
			assigned_role = true;
		}
	}

	if (sponsors.indexOf(rider_info.uid) > -1) {
		if (assigned_role)
			output_rank += "/" + colors.green + "Sponsor" + colors.normal;
		else {
			output_rank = "(" + colors.green + "Sponsor" + colors.normal;
			assigned_role = true;
		}
	}

	if (assigned_role) {
		output_rank += ") ";
		var completeMsg = output_rank + rider_info.name + ": " + msg;

		// only send the message to people who have no ignore setting
		for (i = 0; i < mxserver.max_slots; i++) {
			var status = mxserver.get_status(i);
			if (status == "Player") {
				var ignore = mxserver.get_string("ignore", i);
				if (ignore == "ALL" || (ignore == "SPECS" && rider_info.status != "Player"))
					continue;
			}
			mxserver.send(i, completeMsg);
		}
		mxserver.write_demo_message(completeMsg);
		return 1;
	}
}

var admin_mod_chat_messages_prev = mxserver.chat_handler;
mxserver.chat_handler = admin_mod_chat_messages;

function add_roles(slot, cmdline) {
	
	if (cmdline.match(/^\s*addrole\b/) == null)
		return add_roles_prev(slot, cmdline);

	var sender_slot_info = mxserver.get_slot_info(slot);

	if (sender_slot_info.rank != "Admin" && admins.indexOf(sender_slot_info.uid) === -1) {
		mxserver.send(slot, "Permission Denied");
		return 1;
	}
	
	var m = cmdline.match(/^\s*addrole\s*(.*)\s([0-9]+|[0-9])/);

	if (m == null) {
		mxserver.send(slot, "Usage: addrole <role> <UID>");
		mxserver.send(slot, "For list of roles available: server, listrolesavail");
		return 1;
	}

	// parse uid into number
	var uid = parseInt(m[2]);
	if (uid < 1 || uid > 100000) {
		mxserver.send(slot, colors.red + "Please Choose a Valid UID" + colors.normal);
		return 1;
	}

	add_role_to_file(slot, m[1], uid);
	return 1;
}

var add_roles_prev = mxserver.command_handler;
mxserver.command_handler = add_roles;

function remove_roles(slot, cmdline) {
	if (cmdline.match(/^\s*removerole\b/) == null)
		return remove_roles_prev(slot, cmdline);

	var sender_slot_info = mxserver.get_slot_info(slot);
	if (sender_slot_info.rank != "Admin" && admins.indexOf(sender_slot_info.uid) === -1) {
		mxserver.send(slot, "Permission Denied");
		return 1;
	}

	m = cmdline.match(/^\s*removerole\s*(.*)\s([0-9]+|[0-9])/);

	if (m == null) {
		mxserver.send(slot, "Usage: removerole <role> <UID>");
		mxserver.send(slot, "For list of roles available: server, listrolesavail");
		return 1;
	}

	// parse uid into number
	var uid = parseInt(m[2]);
	if (uid < 1 || uid > 100000) {
		mxserver.send(sender, colors.red + "Please Choose a Valid UID" + colors.normal);
		return 1;
	}

	remove_roles_from_file(slot, m[1], uid);
	return 1;
}
var remove_roles_prev = mxserver.command_handler;
mxserver.command_handler = remove_roles;

function remove_roles_from_file(sender, role, sent_uid) {
	var senderRank = mxserver.get_rank(sender);
	var rider_not_found = true;
	var uid_index;
	var error_not_found_message = colors.red + "Error. UID Not Found In List. To see uids in ranks, do 'server, listroles'" + colors.normal;
	var successString = colors.green + "Successfully removed uid " + sent_uid + " from " + role + " role!" + colors.normal;

	switch (role)
	{
		case "admin":
			if (senderRank != "Admin") {
				mxserver.send(sender, colors.red + "You do not have permissions to remove administrator roles." + colors.normal);
				return;
			}

			uid_index = admins.indexOf(sent_uid);
			if (uid_index > -1) {
				// removes item from array
				admins.splice(uid_index, 1);
				// writes out file
				mxserver.string_to_file("../roles/admins.txt", admins.toString());
				rider_not_found = false;
			}
			break;
		case "mod":
			uid_index = mods.indexOf(sent_uid);
			if (uid_index > -1) {
				mods.splice(uid_index, 1);
				mxserver.string_to_file("../roles/mods.txt", mods.toString());
				rider_not_found = false;
			}
			break;
		case "host":
			uid_index = hosts.indexOf(sent_uid);
			if (uid_index > -1) {
				hosts.splice(uid_index, 1);
				mxserver.string_to_file("../roles/hosts.txt", hosts.toString());
				rider_not_found = false;
			}
			break;
		case "champion":
			uid_index = champions.indexOf(sent_uid);
			if (uid_index > -1) {
				champions.splice(uid_index, 1);
				mxserver.string_to_file("../roles/champions.txt", champions.toString());
				rider_not_found = false;
			}
			break;
		case "sponsor":
			uid_index = sponsors.indexOf(sent_uid);
			if (uid_index > -1) {
				sponsors.splice(uid_index, 1);
				mxserver.string_to_file("../roles/sponsors.txt", sponsors.toString());
				rider_not_found = false;
			}
			break;
		case "suspended":
			uid_index = suspendedUsers.indexOf(sent_uid);
			if (uid_index > -1) {
				suspendedUsers.splice(uid_index, 1);
				mxserver.string_to_file("../roles/suspended.txt", suspendedUsers.toString());
				rider_not_found = false;
			}
			break;
		case "streamer":
			uid_index = streamers.indexOf(sent_uid);
			if (uid_index > -1) {
				streamers.splice(uid_index, 1);
				mxserver.string_to_file("../roles/streamers.txt", streamers.toString());
				rider_not_found = false;
			}
			break;
		case "all":
			if (senderRank != "Admin") {
				mxserver.send(sender, "Permission Denied.");
				return;
			}
		
			uid_index = admins.indexOf(sent_uid);
			if (uid_index > -1) {
				admins.splice(uid_index, 1);
				mxserver.string_to_file("../roles/admins.txt", admins.toString());
				rider_not_found = false;
			}

			uid_index = mods.indexOf(sent_uid);
			if (uid_index > -1) {
				mods.splice(uid_index, 1);
				mxserver.string_to_file("../roles/mods.txt", mods.toString());
				rider_not_found = false;
			}

			uid_index = hosts.indexOf(sent_uid);
			if (uid_index > -1) {
				hosts.splice(uid_index, 1);
				mxserver.string_to_file("../roles/hosts.txt", hosts.toString());
				rider_not_found = false;
			}

			uid_index = streamers.indexOf(sent_uid);
			if (uid_index > -1) {
				streamers.splice(uid_index, 1);
				mxserver.string_to_file("../roles/streamers.txt", streamers.toString());
				rider_not_found = false;
			}

			uid_index = champions.indexOf(sent_uid);
			if (uid_index > -1) {
				champions.splice(uid_index, 1);
				mxserver.string_to_file("../roles/champions.txt", champions.toString());
				rider_not_found = false;
			}

			uid_index = sponsors.indexOf(sent_uid);
			if (uid_index > -1) {
				sponsors.splice(uid_index, 1);
				mxserver.string_to_file("../roles/sponsors.txt", sponsors.toString());
				rider_not_found = false;
			}

			uid_index = suspendedUsers.indexOf(sent_uid);
			if (uid_index > -1) {
				suspendedUsers.splice(uid_index, 1);
				mxserver.string_to_file("../roles/suspended.txt", suspendedUsers.toString());
				rider_not_found = false;
			}
			
			if (!rider_not_found) {
				mxserver.send(sender, colors.green + "Succesfully removed all roles for UID " + sent_uid + "." + colors.normal);
			}
			break;
		default:
			mxserver.send(sender, colors.red + "Error: role doesn't exist!"  + colors.normal);
			mxserver.send(sender, "Use " + colors.yellow + "'server, listrolesavail'" + colors.normal + " to see all roles");
			return;
	}

	if (rider_not_found) {
		mxserver.send(sender, error_not_found_message);
		return;
	}
	if (role != "all")
		mxserver.send(sender, successString);
	
	return;
}

function list_roles(slot, cmdline) {
	var sender_slot_info = mxserver.get_slot_info(slot);

	if (cmdline.match(/^\s*listroles\b/) == null)
		return list_roles_prev(slot, cmdline);

	if (sender_slot_info.rank != "Admin" && admins.indexOf(sender_slot_info.uid) === -1)
	{
		mxserver.send(slot, "Permission Denied");
		return 1;
	}

	mxserver.send(slot, "List of all roles with corresponding UIDS:" + colors.normal);
	mxserver.send(slot, colors.red + "Admins: " + admins.toString() + colors.normal);
	mxserver.send(slot, colors.blue + "Mods: " + mods.toString() + colors.normal);
	mxserver.send(slot, colors.magenta + "Hosts: " + hosts.toString() + colors.normal);
	mxserver.send(slot, colors.cyan + "Streamers: " + streamers.toString() + colors.normal);
	mxserver.send(slot, colors.yellow + "Champions: " + champions.toString() + colors.normal);
	mxserver.send(slot, colors.green + "Sponsors: " + sponsors.toString() + colors.normal);
	mxserver.send(slot, colors.black + "Suspended: " + suspendedUsers.toString() + colors.normal);

	return 1;
}
var list_roles_prev = mxserver.command_handler;
mxserver.command_handler = list_roles;

function list_roles_avail(slot, cmdline) {
	// if cmdline doesn't have at least 'listrolesavail' return command not handled
	if (cmdline.match(/^\s*listrolesavail\b/) == null)
		return list_roles_avail_prev(slot, cmdline);

	var sender_slot_info = mxserver.get_slot_info(slot);

	if (sender_slot_info.rank != "Admin" && admins.indexOf(sender_slot_info.uid) === -1) {
		mxserver.send(slot, "Permission Denied");
		return 1;
	}

	var out_str = "List of roles available: " +
	colors.red + "admin" + colors.normal +
	", " + colors.blue + "mod" + colors.normal + 
	", " + colors.magenta + "host" + colors.normal +
	", " + colors.cyan + "streamer" + colors.normal +
	", " + colors.yellow + "champion" + colors.normal +
	", " + colors.green + "sponsor" + colors.normal + 
	", " + colors.black + "suspended" + colors.normal;
	mxserver.send(slot, out_str);
	mxserver.send(slot, "Use " + colors.green + "'server, addrole'" + colors.normal + " to add someone to a role or " + colors.red + "'server, removerole'" + colors.normal + " to remove someone");
	mxserver.send(slot, "Use 'server, listroles' to see all roles for each uid");
	return 1;
}
var list_roles_avail_prev = mxserver.command_handler;
mxserver.command_handler = list_roles_avail;