To use the examples in this directory, just add them to your command
line options.  E.g. "--javascript js/help.js --javascript js/pm.js".
They're all self contained and can be used in any combination.

Here's the mxserver javascript API:

mxserver.max_slots
This is the maximum number of slots compiled into the server.

mxserver.get_uid(slotnumber)
Returns the UID for the given slot number as a number.

mxserver.get_rank(slotnumber)
Returns the rank for the given slot as a string.
Possible ranks are "Nobody", "Marshal" and "Admin".

mxserver.get_status(slotnumber)
Returns the status for the given slot as a string.
Possible values are "Empty", "Reserved", "Spectator", "Player" and
"Zombie",

mxserver.get_slot_info(slotnumber)
Returns information about "slotnumber" as an object with the following
properties:
- bike - bike as a string
- riderskin - rider skin as a string
- bikeskin - bike skin as a string
- wheelskin - wheel skin as a string
- helmetskin - helmet skin as a string
- uid - UID as a number
- name - returns rider name
- status - status as a string
- rank - rank as a string
- ping - ping time in seconds

mxserver.file_to_string(filename)
Returns a string containing the specified file.

mxserver.string_to_file(filename, string)
Writes the string to a file.

mxserver.append_string_to_file(filename, string)
Appends the string to a file.

mxserver.system(string)
Runs "string" as a shell command.

mxserver.schedule_command(commandline)
This runs an "at" command.
E.g. mxserver.schdedule_command("at +10 broadcast Hello, world!")

mxserver.broadcast(message)
Broadcasts a message on the server.

mxserver.send(slotnumber, message)
Sends "message" to the client in "slotnumber".

mxserver.send_script_message(slotnumber, message)
Sends script message "message" to the client in "slotnumber".

mxserver.write_demo_message(message)
Writes "message" into the server demo.

mxserver.write_demo_script_message(message)
Writes script message "message" into the server demo.

mxserver.log(message)
Writes "message" to stderr.

mxserver.get_number(name, index)
Returns the number associated with "name" with optional array index
"index".  Possible names are:
- "drop_time"
erode value returned is 1024 times the value inputted
- "erode"
- "finish_laps"
- "finish_laps_list" (array; index is track number)
- "finish_time"
- "finish_time_list" (array; index is track number)
- "first_lap_length"
- "gate_count"
- "holeshot_index"
- "max_slots"
- "muted" (array; index is slot number)
- "normal_lap_length"
- "race_time"
- "track_count"
- "uid" (array; index is slot number)
- "ping"

mxserver.get_string(name, index)
Returns the string associated with "name" with optional array index
"index".  Possible names are:
- "bikeinfo" (array; index is slot number)
- "ignore" (array; index is slot number)
- "rank" (array; index is slot number)
- "status" (array; index is slot number)
- "track_dir"
- "track_list" (array; index is track number)
- "track_name"

mxserver.connect_handler(slotnumber)
This is called when a client connects to the server.  "slot" is the
client's slot number.

mxserver.disconnect_handler(slotnumber)
This is called when a client disconnects from the server.
"slotnumber" is the client's slot number.  It is possible to get a
disconnect without a corresponding connect if the client fails to
initialize completely.

mxserver.timing_handler(slotnumber, position, time)
This is called when a client hits a timing gate.  "slotnumber" is the
client's slot number.  "position" is the position in the timing array.
"time" is the time in 1/128 second race time tics.

mxserver.info_handler(slotnumber, message)
This is called when an info packet is received from a client and
before the client's message is checked for server commands.
"slotnumber" is the client's slot number.  "message" is the message
that the client sent.  The handler should return 1 if the server
should not continue processing the message and 0 otherwise.

mxserver.command_handler(slotnumber, commandline)
This is called when the server receives a command it doesn't
recognize.  "slotnumber" is the client's slot number or
mxserver.max_slots if the command isn't associated with a client.
"commandline" is the command line to execute.  The handler should
return 1 if the command was handled and 0 otherwise.

mxserver.chat_handler(slotnumber, message)
This is called when a chat message is received from a client.
"slotnumber" is the client's slot number.  "message" is the message
that the client sent.  The handler should return 1 if the server
should not continue processing the message and 0 otherwise.

mxserver.start_handler()
This is called after a restart.

mxserver.finish_handler()
This is called before a restart.

mxserver.tic_handler()
This is called at a rate of 128 times per second.  This is not
perfectly accurate and can skip a beat if the server is running slow.

mxserver.second_handler()
This is called once every second.  This is not perfectly accurate and
can skip a beat if the server is running slow.

mxserver.ready_handler(slotnumber)
This is called when the client in the specified slot is ready.

mxserver.script_message_handler(slotnumber, message)
This is called when a script message is received from a client.
"slotnumber" is the client's slot number.  "message" is the message
that the client sent.
