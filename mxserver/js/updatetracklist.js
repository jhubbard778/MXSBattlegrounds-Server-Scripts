function updateTrackList(slot, cmdline) {

    var slotInfo = mxserver.get_slot_info(slot);

    var command;
    if (cmdline.includes("server,")) {
        var cmdSplit = cmdline.split(",");
        command = cmdSplit[1].trim();
    } else {
        command = cmdline;
    }

    var arguments = command.split(" ");
    var method = arguments[0];
    if (method != "updatetracklist" || (method == "updatetracklist" && arguments.length > 1)) {
        return updateTrackListPrev(slot, cmdline);
    } 

    if (slotInfo.uid > 0 && slotInfo.rank != "Admin") {
        mxserver.send(slot, "Permission Denied.");
        return 1;
    }

    var filecontent = "trackinfo,minutes,laps,interval";
    for (var i = 0; track = mxserver.get_string("track_list", i); i++) {
        var minutes = (mxserver.get_number("finish_time_list", i) / 7680);
        var laps = mxserver.get_number("finish_laps_list", i);
        filecontent += "\n" + track + "," + minutes + "," + laps + ",-1";
    }

    mxserver.string_to_file("files/tracklist.csv", filecontent);
    return 1;
}

var updateTrackListPrev = mxserver.command_handler;
mxserver.command_handler = updateTrackList;