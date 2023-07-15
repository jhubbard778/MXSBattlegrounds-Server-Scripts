// Justin Baker/Jakob Hubbard 2022
// MXS Battlegrounds!

var url = "https://battlegrounds.jhubbard.me/servers/bgservers-jhubbard-me19800/json/";
var outfile = "files/signedriders.txt";

var race_server = value_in_file("raceserver");

function is_special_user(slot_info) {

  if (slot_info.rank == "Admin" || slot_info.rank == "Marshal")
    return true;

  // split into array and then set them to numbers.
  var admins = mxserver.file_to_string("../roles/admins.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
  var mods = mxserver.file_to_string("../roles/mods.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
  var hosts = mxserver.file_to_string("../roles/hosts.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
  var streamers = mxserver.file_to_string("../roles/streamers.txt").split(',').map(Number).filter(function(uid){return uid > 0;});

  return (admins.indexOf(slot_info.uid) > -1 || mods.indexOf(slot_info.uid) > -1 || hosts.indexOf(slot_info.uid) > -1 || streamers.indexOf(slot_info.uid) > -1);
}

function fetch_signed_up_riders() {
  mxserver.log("fetching signed up riders\n"); 
  mxserver.system("curl " + url + " > " + outfile);
  var file = mxserver.file_to_string(outfile);
  return JSON.parse(file).riders;
}

function kick_rider(slot) { 
  mxserver.send(slot, "\x1b[31mYou're not signed up for the race.");
  mxserver.schedule_command("at 0 kick " + slot);
}

function forcespec(uid, slot) { 
  mxserver.send(slot, "\x1b[33m!! You will be in warmup, since you're not signed up for the race !!");
  mxserver.schedule_command("at 0 forcespec " + uid);
}

function change_sign_ups_or_race_server(slot, cmdline) {
  if (cmdline.match(/^\s*signupsneeded\b/) == null && cmdline.match(/^\s*raceserver\b/) == null)
		return change_sign_ups_or_race_server_prev(slot, cmdline);
  
  var uid = mxserver.get_uid(slot);
  var rank = mxserver.get_rank(slot);

	if (uid > 0 && rank != "Admin" && admins.indexOf(uid) === -1 && hosts.indexOf(uid) === -1) {
    mxserver.send(slot, "Permission Denied");
    return 1;
	}

  var m = cmdline.split(' ').filter(function(cmd){return cmd.length > 0;});
  var out_file = m[0];
  if (m[0] === 'signupsneeded')
    out_file = 'signup_necessary';

  if ((m[1] !== 'true' && m[1] !== 'false') || m[2]) {
    if (m[0] === 'signupsneeded')
      mxserver.send(slot, "Usage: server, signupsneeded <true or false>");
    else
      mxserver.send(slot, "Usage: server, raceserver <true or false>");
    return 1;
  }

  var val_set = value_in_file(out_file);
  if ((m[1] === 'true' && val_set) || (m[1] === 'false' && !val_set)) {
    mxserver.send(slot, "Error: Setting already " + m[1].toString());
    return 1;
  }

  mxserver.string_to_file("files/" + out_file + ".txt", m[1].toLowerCase());

  if (m[0] === 'signupsneeded') {
    if (m[1] === 'true')
      kick_all_unsigned_riders();
    else
      mxserver.broadcast("\x1b[32mUnsigned riders now allowed in server...\x1b[0m");
  }
  else
    mxserver.send(slot, "\x1b[32mSuccessfully changed raceserver value to: " + value_in_file(out_file).toString());
    
  return 1;
}
var change_sign_ups_or_race_server_prev = mxserver.command_handler;
mxserver.command_handler = change_sign_ups_or_race_server;

function kick_all_unsigned_riders() {
  mxserver.broadcast("\x1b[31mKicking all unsigned riders...\x1b[32m");
  var riders = fetch_signed_up_riders();

  for (var slot = 0; slot < mxserver.max_slots; slot++) {
    var slot_info = mxserver.get_slot_info(slot);
    if (slot_info.uid == 0) continue;
    var special_usr = is_special_user(slot_info);

    if (riders.indexOf(slot_info.uid) === -1) {
      if (!race_server || (race_server && !special_usr))
        kick_rider(slot);
    }
      
  }
}

function value_in_file(filename) {
  var file;
  if (file = mxserver.file_to_string("files/" + filename + ".txt").toLowerCase())
    return (file === 'true');
  mxserver.string_to_file("files/" + filename + ".txt", "false");
  return false;
}

function determine_kick_or_spec(slot) {
  var disconnect_racers = value_in_file("signup_necessary");
  if (!disconnect_racers) return;
  var riders = fetch_signed_up_riders();
  var slot_info = mxserver.get_slot_info(slot);
 	if (riders.indexOf(slot_info.uid) === -1) {
    var special_usr = is_special_user(slot_info);
    if (race_server && !special_usr) {
      kick_rider(slot);
    }
    else if (!race_server) {
      forcespec(slot_info.uid, slot);
    }
	}
	determine_kick_or_spec_prev(slot);
}
var determine_kick_or_spec_prev = mxserver.connect_handler;
mxserver.connect_handler = determine_kick_or_spec;