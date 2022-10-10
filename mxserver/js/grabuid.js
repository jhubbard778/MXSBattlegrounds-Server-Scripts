/*
############################################################
"grabuids" command
grabs list of all uids in the server
############################################################
*/
var admins;
var hosts;
function read_roles() {
    admins = mxserver.file_to_string("../roles/admins.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
    hosts = mxserver.file_to_string("../roles/hosts.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
}
var read_roles_prev = mxserver.start_handler;
mxserver.start_handler = read_roles;

var url = "https://mxsbattlegrounds.com/servers/na-mxsbattlegrounds-com19800/json/";
var outfile = "files/signedriders.txt";

function fetch_signed_up_riders() {
    mxserver.log("fetching signed up riders\n"); 
    mxserver.system("curl " + url + " > " + outfile);
    var file = mxserver.file_to_string(outfile);
    return JSON.parse(file).riders;
}

function grab_uid(slot, cmdline) {

	if (cmdline.match(/^\s*grabuid\b/) == null)
		return grab_uid_prev(slot, cmdline);

    var uid = mxserver.get_uid(slot);
    var rank = mxserver.get_rank(slot);

    // uid > 0 allows schedule command to execute whilst denying players
	if (rank != "Admin" && admins.indexOf(uid) === -1 && hosts.indexOf(uid) === -1 && uid > 0) {
        mxserver.send(slot, "Permission Denied");
        return 1;
	}

    // I couldn't figure out regex, I'm retarded
    var m = cmdline.split(' ').filter(function(cmd){return cmd.length > 0;});

    if (m[1] == "schedule" && !m[3]) {
        var min_til_uid;
        if (!(min_til_uid = Math.ceil(parseInt(m[2])))) {
            mxserver.send(slot, "Error: time not valid");
            mxserver.send(slot, "Usage: 'server, grabuid schedule <time in min>'");
            return 1;
        }
        var min_til_uid_holder = min_til_uid;
        var sec_1_min_remain = (min_til_uid - 1) * 60;
        var time_to_execute = sec_1_min_remain;
        mxserver.broadcast("\x1b[36mUID Grab in " + min_til_uid + " min\x1b[0m");
        while (min_til_uid > 1) {
            // Start displaying minutes til uid at 1 hour, then increment by half every time.  Min time to start at even half is at 30 minutes.
            if (min_til_uid > Math.ceil(min_til_uid / 60) * 60 || min_til_uid > 120) {
                min_til_uid--;
                continue;
            }
            min_til_uid = Math.floor(min_til_uid / 2);
            // Get difference from execution of grabuid command vs execution of broadcast command in seconds
            var diff_sec = (min_til_uid_holder - min_til_uid) * 60;
            mxserver.schedule_command("at +" + diff_sec + " broadcast \x1b[36mUID Grab in " + min_til_uid + " min\x1b[0m");
        }
        time_to_execute += 30;
        mxserver.schedule_command("at +" + time_to_execute + " broadcast \x1b[33m!UID Grab in 30s, Do not disconnect...!\x1b[0m");
        time_to_execute += 20;
        // countdown every second
        for (var i = 0; i < 10; i++) {
            mxserver.schedule_command("at +" + time_to_execute + " broadcast \x1b[31m!!UID Grab in " + (10 - i) + "s, Do not disconnect...!!\x1b[0m");
            time_to_execute++;
        }
        mxserver.schedule_command("at +" + time_to_execute + " forcespec all");
        mxserver.schedule_command("at +" + time_to_execute + " forceplay " + uid);
        mxserver.schedule_command("at +" + time_to_execute + " lock");
        mxserver.schedule_command("at +" + time_to_execute + " restart");
        time_to_execute += 15;
        mxserver.schedule_command("at +" + time_to_execute + " grabuid confirm");
    }
    else if (m[1] == "confirm" && !m[2]) {
        write_uids_to_file(slot);
        return 1;
    }
    else {
        mxserver.send(slot, "Usage: 'server, grabuid schedule <time in min>' OR 'server, grabuid confirm'");
        return 1;
    }

	return 1;
}
var grab_uid_prev = mxserver.command_handler;
mxserver.command_handler = grab_uid;

function write_uids_to_file(sender) {
    // reads signed riders into array
    var signed_uids = fetch_signed_up_riders();
    mxserver.log('signed riders: ' + signed_uids.toString() + '\n');
    if (!signed_uids || signed_uids.length == 0) {
        mxserver.broadcast("\x1b[31mError: No UIDS to grab!\x1b[0m");
        return;
    }
    var uids = [];
    var names = [];
    var uid_index = 0;
    for (var slot = 0; slot < mxserver.max_slots; slot++) {
        var slot_info = mxserver.get_slot_info(slot);
        if (slot_info.uid != 0) {
            uids[uid_index] = slot_info.uid;
            names[uid_index] = slot_info.name;
            uid_index++;
        }
    }

    //1) combine the arrays:
    var list = [];
    for (var j = 0; j < uids.length; j++) 
        list.push({'uid': uids[j], 'name': names[j]});

    //2) sort:
    list.sort(function(a, b) {return ((a.name < b.name) ? -1 : (a.name == b.name) ? (a.uid < b.uid) ? -1 : 0 : 1);});
    /* Equivalent code
    if (a.name < b.name) return -1;
    if (a.name == b.name) {
        if (a.uid < b.uid) return -1;
        return 0;
    }
    return 1;*/

    //3) separate them back out:
    for (var k = 0; k < list.length; k++) {
        names[k] = list[k].name;
        uids[k] = list[k].uid;
    }

    mxserver.log('uids: ' + uids.toString() + '\n');
    if (uids.length > 0) {
        mxserver.string_to_file("files/uidgrab/uids.txt",uids.toString());
        mxserver.string_to_file("files/uidgrab/names.txt",names.toString());
    }
    else {
        mxserver.broadcast("\x1b[31mError: No UIDS to grab!\x1b[0m");
        return;
    }
    mxserver.send(sender, "\x1b[32mSuccesfully grabbed and saved UIDS to 'files/uidgrab/uids.txt'!\x1b[0m")
    read_uids(sender);
    return;
}

function read_uids(sender) {
    var uids = mxserver.file_to_string("files/uidgrab/uids.txt").split(',').map(Number).filter(function(uid){return uid > 0;});
    var names = mxserver.file_to_string("files/uidgrab/names.txt").split(',').filter(function(name){return name.length > 0;});

    if (uids.length != names.length) {
        mxserver.send(sender, "\x1b[41mError getting UIDS/names\x1b[0m");
        return;
    }

    var racers = "Racers";
    if (uids.length == 1) racers = "Racer";

    mxserver.broadcast("\x1b[31m##################################\x1b[0m");
    mxserver.broadcast("\x1b[31m          Grabbed UIDS - " + uids.length + " " + racers + "\x1b[0m");
    mxserver.broadcast("\x1b[31m##################################\x1b[0m");

    for (var i = 0; i < uids.length; i++) {
        mxserver.broadcast((i + 1) + ') ' + uids[i] + ' - ' + names[i]);
        for (var slot = 0; slot < mxserver.max_slots; slot++) {
            var rider_uid = mxserver.get_uid(slot);
            if (rider_uid == uids[i]) {
                mxserver.send(slot, "\x1b[36mYour UID Has Been Grabbed\x1b[0m"); 
                break;
            }
        }
    }
    return;
}