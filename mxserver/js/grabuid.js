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

var url = "https://battlegrounds.jhubbard.me/servers/bgservers-jhubbard-me19800/json/";
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
	if (uid > 0 && rank != "Admin" && admins.indexOf(uid) === -1 && hosts.indexOf(uid) === -1) {
        mxserver.send(slot, "Permission Denied");
        return 1;
	}

    // I couldn't figure out regex, I'm retarded
    var m = cmdline.split(' ').filter(function(cmd){return cmd.length > 0;});

    if (m[1] != "schedule" && m[1] != "confirm") {
        mxserver.send(slot, "Usage: 'server, grabuid schedule <time in min> [list of files]' OR 'server, grabuid confirm [list of files]'");
        return 1;
    }
    

    var files = [];
    if ((m.length > 3 && m[1] == "schedule") || (m.length > 2 && m[1] == "confirm")) {
        var invalidFiles = [];
        var startIndex = 2;
        if (m[1] == "schedule") {
            startIndex = 3;
        }
        for (var i = startIndex; i < m.length; i++) {
            if (!checkForValidFileSignupFile(m[i])) {
                invalidFiles.push(m[i]);
            }
        }
        if (invalidFiles.length > 0) {
            mxserver.send(slot, "Error: Invalid Signup Files - " + invalidFiles.toString());
            mxserver.log("Error: Invalid Signup Files - " + invalidFiles.toString() + "\n");
            return 1;
        }
        files = m.slice(startIndex);
    }

    if (m[1] == "schedule") {
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
        mxserver.schedule_command("at +" + time_to_execute + " broadcast \x1b[31m!!UID Grab in 10s, Do not disconnect...!!\x1b[0m");
        time_to_execute += 5;
        // countdown every second
        for (var i = 0; i < 5; i++) {
            mxserver.schedule_command("at +" + time_to_execute + " broadcast \x1b[31m!!UID Grab in " + (5 - i) + "s, Do not disconnect...!!\x1b[0m");
            time_to_execute++;
        }
        mxserver.schedule_command("at +" + time_to_execute + " forcespec all");
        mxserver.schedule_command("at +" + time_to_execute + " forceplay " + uid);
        mxserver.schedule_command("at +" + time_to_execute + " lock");
        mxserver.schedule_command("at +" + time_to_execute + " restart");
        time_to_execute += 25;
        var grabuidCommand = "at +" + time_to_execute + " grabuid confirm";
        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                grabuidCommand += " " + files[i];
            }
        }
        mxserver.log(grabuidCommand + "\n");
        mxserver.schedule_command(grabuidCommand);
    }
    else if (m[1] == "confirm") {
        write_uids_to_file(slot, files);
        return 1;
    }

	return 1;
}
var grab_uid_prev = mxserver.command_handler;
mxserver.command_handler = grab_uid;

function checkForValidFileSignupFile(filename) {
    var fileString = mxserver.file_to_string("files/uidgrab/signupfiles/" + filename);
    if (fileString === "") {
        return false;
    }

    var uids = fileString.split(/\r?\n/).filter(function(uid){return uid.length > 0});
    for (var i = 0; i < uids.length; i++) {
        // check if the has only digits
        if (uids[i].match(/^\d+$/) == null) {
            mxserver.log("Invalid UID - " + uids[i] + "\n");
            return false;
        }
    }
    return true;
}

function write_uids_to_file(sender, files) {

    var uidsInServer = [];
    var uidsAndNamesInServer = [];
    var uidsGrabbed = [];
    var namesGrabbed = [];

    for (var slot = 0; slot < mxserver.max_slots; slot++) {
        var slot_info = mxserver.get_slot_info(slot);
        if (slot_info.uid != 0) {
            uidsInServer.push(slot_info.uid);
            uidsAndNamesInServer.push({'uid': slot_info.uid, 'name': slot_info.name});
        }
    }

    if (files.length == 0) {
        // reads signed riders into array
        var signed_uids = fetch_signed_up_riders();
        mxserver.log(signed_uids.toString() + "\n");
        if (!signed_uids || signed_uids.length == 0) {
            mxserver.broadcast("\x1b[31mError: No UIDS to grab!\x1b[0m");
            return;
        }
        
        for (var i = 0; i < signed_uids.length; i++) {
            var index = uidsInServer.indexOf(parseInt(signed_uids[i]));
            if (index !== -1) {
                uidsGrabbed.push(uidsInServer[index]);
                namesGrabbed.push(uidsAndNamesInServer[index]);
            }
        }

        if (uidsGrabbed.length > 0) {
            mxserver.string_to_file("files/uidgrab/uids.txt", uidsGrabbed.toString());
            mxserver.string_to_file("files/uidgrab/names.txt", JSON.stringify(namesGrabbed));
        }
        else {
            mxserver.broadcast("\x1b[31mError: No UIDS to grab!\x1b[0m");
            return;
        }
        mxserver.send(sender, "\x1b[32mSuccesfully grabbed and saved UIDS to 'files/uidgrab/uids.txt'!\x1b[0m");
    }

    var filenames = [];
    for (var i = 0; i < files.length; i++) {
        uidsGrabbed = [];
        namesGrabbed = [];
        
        var fileString = mxserver.file_to_string("files/uidgrab/signupfiles/" + files[i]);
        var uidsInFile = fileString.split(/\r?\n/).filter(function(uid){return uid.length > 0});

        for (var j = 0; j < uidsInFile.length; j++) {
            var index = uidsInServer.indexOf(parseInt(uidsInFile[j]));
            if (index !== -1) {
                namesGrabbed.push(uidsAndNamesInServer[index]);
            }
        }

        var reformattedFilename = files[i].split(".")[0];
        
        var d = new Date();
        var dateIsoString = d.toISOString().replace(/:/g, "-");
        var outputUIDFilename = "files/uidgrab/signupfiles/uidfiles/" + reformattedFilename + "_UID-" + dateIsoString + ".txt";
        filenames.push(outputUIDFilename);

        if (namesGrabbed.length > 0) {
            mxserver.string_to_file(outputUIDFilename, JSON.stringify(namesGrabbed));
        }

        mxserver.send(sender, "\x1b[32mSuccesfully grabbed and saved UIDS from" + files[i] +" to '" + outputUIDFilename + "'!\x1b[0m");
    }
    
    read_uids(filenames);
    return;
}

function read_uids(filenames) {

    var racers = [];
    if (filenames.length == 0) {
        try {
            racers = JSON.parse(mxserver.file_to_string("files/uidgrab/names.txt"));
        } catch (e) {
            mxserver.log("error: " + e);
        }
    }

    for (var i = 0; i < filenames.length; i++) {
        var fileString = mxserver.file_to_string(filenames[i]);
        if (fileString === "") continue;

        var racersInFile = JSON.parse(fileString);
        racers = racers.concat(racersInFile);
    }

    var uniqueRacers = [];
    var uniqueUIDS = [];
    for (var i = 0; i < racers.length; i++) {
        if (uniqueUIDS.indexOf(racers[i].uid) !== -1) continue;
        uniqueRacers.push(racers[i]);
        uniqueUIDS.push(racers[i].uid);
    }
    racers = uniqueRacers;

    // Sort the racers alphabetically
    racers.sort(function(a, b) {return ((a.name < b.name) ? -1 : (a.name == b.name) ? (a.uid < b.uid) ? -1 : 0 : 1);});

    var racersText = "Racers";
    if (racers.length == 1) racersText = "Racer";

    mxserver.broadcast("\x1b[31m##################################\x1b[0m");
    mxserver.broadcast("\x1b[31m          Grabbed UIDS - " + racers.length + " " + racersText + "\x1b[0m");
    mxserver.broadcast("\x1b[31m##################################\x1b[0m");
    
    var riderUIDSInSlot = [];
    for (var slot = 0; slot < mxserver.max_slots; slot++) {
        var rider_uid = mxserver.get_uid(slot);
        if (rider_uid != 0) {
            riderUIDSInSlot[slot] = rider_uid;
        }
    }

    for (var i = 0; i < racers.length; i++) {
        mxserver.broadcast((i + 1) + ') ' + racers[i].name + ' - ' + racers[i].uid);

        var slotNumber = riderUIDSInSlot.indexOf(racers[i].uid);
        mxserver.send(slotNumber, "\x1b[36mYour UID Has Been Grabbed\x1b[0m");
    }
    return;
}