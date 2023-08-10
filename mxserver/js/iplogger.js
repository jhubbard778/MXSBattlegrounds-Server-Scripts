function logIPs(slot) {

    // get uid associated with slot
    var slotuid = mxserver.get_uid(slot);
    if (slotuid <= 0) {
      return logIPsPrev(slot);
    }

    var slotinfo = mxserver.get_slot_info(slot);
    var slotName = slotinfo.name;

    // read stderr log into variable
    var stderr = mxserver.file_to_string("files/logs/stderr.log");
  
    // get all ip lines associated with this slot number
    var regex = new RegExp("AF_INET [0-9.]+:[0-9]+ Sending session id [0-9a-f]+ to slot " + slot);
    var lines = stderr.split(/\r?\n/).filter(function(line){return regex.test(line)});
    
    // if it didn't find anything exit
    if (lines.length == 0) {
      return logIPsPrev(slot);
    }

    // extract the last ip found associated with this slot
    var line = lines[lines.length - 1];
    var fullip = line.match(/([0-9.]+):\d+/);
    if (!fullip || fullip.length < 2) {
      return logIPsPrev(slot);
    }
  
    var ip = fullip[1];
  
    var ipsLogged = mxserver.file_to_string("../logs/iplogger.log");
    if (ipsLogged === "") {
      ipsLogged = "[]";
    }

    // parse to json
    ipsLogged = JSON.parse(ipsLogged);
    var index = binarySearchUID(ipsLogged, slotuid, false);
    
    // check if their name is set if we found a rider
    if (index !== -1) {
      // if it's different or not set set it
      if (ipsLogged[index].name !== slotName) {
        ipsLogged[index].name = slotName;
      }
    }

    // if we found a uid logged and the ip doesnt match the last ip logged or first time logging
    if ((index !== -1 && ip !== ipsLogged[index].ip) || index === -1) {
      
      var matchingIPs = [];
      // search for a matching ip and mismatched uid
      for (var i = 0; i < ipsLogged.length; i++) {
        if (ipsLogged[i].ip == ip && ipsLogged[i].uid != slotuid) {
          var matchedRiderName = ipsLogged[i].name;
          if (matchedRiderName === undefined) {
            matchedRiderName = "Unknown Rider";
          }
          matchingIPs.push({'uid': ipsLogged[i].uid, 'name': matchedRiderName});
        }
      }

      if (index !== -1) {
        // get the previous ip
        var previousIP = ipsLogged[index].ip;
        // set the new ip
        ipsLogged[index].ip = ip;
        var invalidIPString = ' Name: ' + slotName + ' | UID: ' + slotuid.toString() + ' | Previous IP: ' + previousIP + ' | Connected IP: ' + ip;
      }

      var matchedIPsString = "IP matched last logged IP of riders(s): ";

      // Send message to admins/mods about this mismatched ip
      for (var i = 0; i < mxserver.max_slots; i++) {
        var uid = mxserver.get_uid(i);
        var rank = mxserver.get_rank(i);
        
        if (uid != 0 && (rank == "Admin" || rank == "Marshal" || admins.indexOf(uid) !== -1 || mods.indexOf(uid) !== -1 || hosts.indexOf(uid) !== -1)) {
          
          var status = mxserver.get_status(i);
          if (status == "Player") {
            var ignore = mxserver.get_string("ignore", i);
            if (ignore == "ALL" || (ignore == "SPECS" && slotinfo.status != "Player"))
              continue;
          }

          // if the uid was logged before
          if (index !== -1) {
            // notify the mismatch
            mxserver.send(i, colors.red + 'Mismatched IP Found |' +  invalidIPString + colors.normal);
          }

          if (matchingIPs.length > 0) {
            if (index === -1) {
              mxserver.send(i, colors.red + 'New Matched IP Found For: ' + slotName + ' | UID: ' + slotuid.toString() + ' | Connected IP: ' + ip + colors.normal)
            }
            // notify if the ip matched another rider
            mxserver.send(i, colors.green + matchedIPsString + colors.normal);
            for (var j = 0; j < matchingIPs.length; j++) {
              mxserver.send(i, colors.green + "Name: " + matchingIPs[j].name + " | UID: " + matchingIPs[j].uid + colors.normal);
            }
          }
        }
      }

      var logDate = getDateLogFormat();
      var logString = logDate + invalidIPString + '\n';
      if (matchingIPs.length > 0) {
        logString += logDate + ' ' + matchedIPsString + '\n'; 
        for (var i = 0; i < matchingIPs.length; i++) {
          logString += logDate + ' ' + "Name: " + matchingIPs[i].name + " | UID: " + matchingIPs[i].uid + '\n';
        }
      }
      mxserver.append_string_to_file("../logs/invalidips.log", logString);
    }
    
    if (index === -1) {
      var indexToInsert = binarySearchUID(ipsLogged, slotuid, true);
      ipsLogged.splice(indexToInsert, 0, {'uid': slotuid, 'ip': ip, 'name': slotName});
    }

    mxserver.string_to_file("../logs/iplogger.log", JSON.stringify(ipsLogged, null, " "));
    logIPsPrev(slot);
}
  
var logIPsPrev = mxserver.connect_handler;
mxserver.connect_handler = logIPs;
  
function binarySearchUID(arr, targetUID, insertSearch) {

  if (arr.length == 0) return (insertSearch == true) ? 0 : -1;

  var low = 0;
  var high = arr.length - 1;

  while (low <= high) {
    var mid = Math.floor((low + high) / 2);
    var midUID = arr[mid].uid;

    if (midUID === targetUID) {
      return mid;
    }

    (midUID < targetUID) ? low = mid + 1 : high = mid - 1;
  }

  return (insertSearch == true) ? low : -1;
}

function getDateLogFormat() {
    // Get the current date
    var currentDate = new Date();

    // Format the date components
    var year = currentDate.getFullYear();
    var month = addLeadingZero(currentDate.getMonth() + 1);
    var day = addLeadingZero(currentDate.getDate());
    var hours = addLeadingZero(currentDate.getHours());
    var minutes = addLeadingZero(currentDate.getMinutes());
    var seconds = addLeadingZero(currentDate.getSeconds());

    // Create the formatted date string
    return '[' + year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds + ']';
}

// Function to add leading zeros to single-digit numbers
function addLeadingZero(number) {
    return (number < 10 ? '0' : '') + number;
}