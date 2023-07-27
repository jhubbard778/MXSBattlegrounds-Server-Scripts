function logIPs(slot) {

    // get uid associated with slot
    var uid = mxserver.get_uid(slot);
    if (uid <= 0) {
      return logIPsPrev(slot);
    }

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
    var index = binarySearchUID(ipsLogged, uid, false);
    if (index !== -1 && ip !== ipsLogged[index].ip) {
      var matchingIPs = [];
      // search for a matching ip
      for (var i = 0; i < ipsLogged.length; i++) {
        if (ipsLogged[i].ip == ip) {
          matchingIPs.push(ipsLogged[i].uid);
        }
      }
      var matchedIPsString = "IP matched last logged IP of uid(s): " + matchingIPs.toString();
      var previousIP = ipsLogged[index].ip;
      ipsLogged[index].ip = ip;
      var invalidIPString = ' Name: ' + mxserver.get_slot_info(slot).name + ' | UID: ' + uid.toString() + ' | Previous IP: ' + previousIP + ' | Connected IP: ' + ip;
      // Send message to admins/mods about this mismatched ip
      for (var slot = 0; slot < mxserver.max_slots; slot++) {
          var uid = mxserver.get_uid(slot);
          var rank = mxserver.get_rank(slot)
          if (uid != 0 && (rank == "Admin" || rank == "Marshal" || admins.indexOf(uid) !== -1 || mods.indexOf(uid) !== -1 || hosts.indexOf(uid) !== -1)) {
              mxserver.send(slot, colors.red + 'Mismatched IP Found |' +  invalidIPString + colors.normal);
              if (matchingIPs.length > 0) {
                mxserver.send(slot, colors.green + matchedIPsString + colors.normal);
              }
          }
      }

      var logDate = getDateLogFormat();
      var logString = logDate + invalidIPString + '\n';
      if (matchingIPs.length > 0) {
        logString += logDate + ' ' + matchedIPsString + '\n';
      }
      mxserver.append_string_to_file("../logs/invalidips.log", logString);
    } else if (index === -1) {
      var indexToInsert = binarySearchUID(ipsLogged, uid, true);
      ipsLogged.splice(indexToInsert, 0, {'uid': uid, 'ip': ip});
    }

    mxserver.string_to_file("../logs/iplogger.log", JSON.stringify(ipsLogged));
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