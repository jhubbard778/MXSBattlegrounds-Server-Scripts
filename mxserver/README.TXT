fCopyright (C) 2009 by Josh Vanderhoof
All rights reserved

mxserver is the Linux server.
mxserver.exe is the Windows server.

To run the server, just run mxserver with the trackinfo files of the
tracks you want to run as parameters, like this:

mxserver rabbithill.trackinfo

======================================================================
Command line options:

--address <ip address>

Set the address that mxserver binds to.  Default is any incoming
address.


--admin <uid>

Set the administrator UID.  Default is no admin UID.
Example: --admin 456


--args-file <filename>

Reads command line arguments from a file.  If you need to include
whitespace in an argument, use double quotes.


--ban-file <ban filename>

Set the ban filename.  The server reads ban info from this file.  Each
line has a ban expiration time as a unix timestamp followed by a user
id.  A ban time of 0 is a permanent ban. Default is no ban file.
Example: --ban-file excrementlist.txt


--demo-file <filename>

Set the demo filename.  If you set this the server will record a demo
to the specified file.  Default is no demo recording.  Example:
--demo-file mydemo.mxdemo


--extension <gamecmd>:<shellcmd>

Adds gamecmd as a command that runs shellcmd on the server.  Arguments
after gamecmd will be added to shellcmd.  By default, only
administrators can run the command.  If gamecmd is preceded by a +
sign, marshals can run it.  If gamecmd is preceded by ++, anyone can
run it.  In shellcmd, ${slot} and ${uid} will be replaced by the slot
and UID of the user who invoked the command.  Example: --extension
"+mycmd:myscript.sh ${slot} ${uid}"


--erode <amount>

Sets the erode amount.  Can be between 0 and 100.  Default is 0.
Example: --erode 20


--greeting <text>

Set the server greeting message.  This is sent to clients after they
connect.  Default is no greeting.  Example: --greeting
"Welcome to my server".


--inactivity-timeout <seconds>

Specifies how many seconds a client can be inactive before being
disconnected.  Default 900.  Example: --inactivity-timeout 300


--javascript <filename>

Loads a javascript file.  See js/README.TXT for info on the mxserver
javascript API.  Example: --javascript js/help.js

--laps <laps>

Set the number of laps in a race. This affects all following
tracks. Default 5.  Example: --laps 10


--lineup-file <filename>

Set the lineup filename.  Each line of the lineup file will have the
slot, uid, uid check, slot status, gate, number and name separated by
spaces.


--marshal <uid>

Add a track marshal.  Track marshals can kick players and force
restarts and change the track.  Example: --marshal 456


--max-clients <n>

Set the maximum number of players allowed.  Default 10.  Example:
--max-clients 15


--max-cuts <n>

Set the maximum number of times a player can cut the track before he
is made kickable by anyone.  Default: no limit.  Example: --max-cuts 5


--max-players <n>

Set the maximum number of simultaneous players.  Default: 40.
Example:  --max-players 10


--min-version <version>

Sets the minimum client version that the server allows.  Example:
--min-version 2


--minutes <minutes> 

Set the number of minutes in a race. This affects all following
tracks.  Default 0.  Example: --minutes 10


--next-track <track number>

Specifies the track that will be set when the previous track finishes.
Negative numbers mean skip backwards from the current track.  Default
is the current track number + 1.  Example: --next-track 2


--no-arcade

Disables arcade mode.


--off-course-bias <bias>
--off-course-scale <scale>

This sets the amount of time a rider can be slower than the leader in
a section before being considered off course and ghosted out.  The
time is computed as "leader-time * off-course-scale + off-couse-bias".
Default 10 second bias, 1.5x scale.


--password <password>

Set the administrator password.  You also need to add this to the
command line options on your client.  Defaults to no password (no
admin commands for anyone).  Example: --password letbrockbye


--port <port number>

Sets the UDP port to run the server on.  Default 19800.  Example:
--port 19801


--rate <bytes per second>

Sets the maximum outgoing byte rate.  Default 1000000.  Example:
--rate 750000


--reserve <uid>

Allow a specific user to use a reserved slot.  Example: --reserve 456


--reserved-clients <n>

Sets the number of reserved client slots.  Default 0.  Example:
--reserved-clients 2


--results-cmd <command>

Set the results processing command.  If you set this the server will
run this command before the next race starts.  The server will wait
for the command to complete, so if the command could possibly be slow
make sure you background it.  Default is no results command.  Example:
--results-cmd myawesomestatsgenerator.pl


--results-file <filename>

Set the results filename.  If you set this the server will write
timing info to this file as the race progresses.  Default is no
results file.  Example: --results-file serverresults.txt


--sendfile-prefix <prefix>

Allow administrators to upload files with sendfile.  The uploaded
files will have the prefix added to the filename.  This obviously has
security issues, so make sure no important files can be overwritten
using the prefix.  Example: --sendfile-prefix uploads/


--track-interval <minutes>

Set the amount of time between track changes.  This affects all
following tracks.  If negative, the track will only run if explicitly
selected by "settrack".  Default: 60.  Example: --track-interval 10


--track <trackinfo filename>
or just
<trackinfo filename>

Adds a track to the track list.  To get a trackinfo file, start MX
Simulator, load the track you want and type "/savetrackinfo" into the
chat screen.


--xcmd-password <password>

Sets the password for external commands.  This allows you to run
server commands without the game client.  To run a command, send a
packet like this to the UDP port the game is running on:

x<password><command>

As an example, if the password was set to "/xyzzy/" and you're using
the bash shell, you could shut down the server like this:

echo -n "x/xyzzy/shutdown" >/dev/udp/127.0.0.1/19800

The server will only accept commands from 127.0.0.1 or the address
given by the --address option.


======================================================================
Server commands:

When connected to the server, you can sent it commands by chatting.
Currently the following commands are recognized:

==== Commands that everyone can use ====

server,ignore <none|specs|all>
Ignores chat messages from the specified group when you're racing.

server,info
Shows info about the current race.  (Track, laps, etc.)

server,gate <gate number>
Sets the current client's gate preference.

server,listplayers [search string]
Lists all the clients on the server.  If search string is given, only
list players whose name or number matches the string.

server,listtracks
Lists the tracks available on the server.

server,play
Puts current client in player mode for further races.

server,spec
Puts current client in spectator mode for further races.

server,restart
Votes to restart the race.

server,norestart
Withdraws vote to restart the race.


==== Commands that only track marshalls and admins can use ====

server,forceplay <UID or ALL>
Forces the specified client into player mode for further races.

server,forcespec <UID or ALL>
Forces the specified client into spectator mode for further races.

server,lock
server,unlock
Locks/unlocks the server.  When the server is locked players start out
in spec mode and cannot switch from spec to play mode and vice versa.

server,nexttrack
Selects the next track in the list.

server,settrack <track number>
Jumps to a specific track in the list.

server,ban <UID> [minutes] [reason]
Bans the specified client.  If minutes is not specified or 0 the ban
is permanent.  This only affects the internal ban list.  It does not
change the ban file.

server,listbans
Lists the internal bans.  The bans from the ban file will not be in
this list.

server,kick <slot number>
Kicks a player off the server.

server,knockout <1st remount delay> <2nd delay> <nth delay>
Sets the "knockout" delays.  The delays are in 1/128 second units.
When the delay is non-zero, the rider will take that much longer to
remount after he falls off.  Currently up to 16 delays are supported.
Requires client version 17.

server,allignore <none|specs|all>
Change the ignore setting for every client on the server.

server,mute <UID> [minutes]
Prevents a player from chatting.

server,broadcast <message>
Echoes a message to all clients.

server,broadcastto <slot or UID> <message>
Echoes a message to a specific client.  Use either a UID or a slot
number prefixed by "s", e.g. "server,broadcastto s15 hello".

server,forcegate <UID> <gate number>
Forces the specified client's gate choice.

server,lockgate
server,unlockgate
Locks/unlocks the gate.  When the gate is locked players can't change
their gate pick.

server,clearclass
Clears the approved bikes list.  This will allow any bike in.

server,homologate <bike>
Adds a bike to the approved bikes list.  If a rider is on a bike that
isn't in the list, he will be put on the first bike in the list.

server,erode <amount>
Sets the track erosion amount.

==== Commands that only admins can use ====

server,addtrack <time> <laps> <change interval> <trackinfo>
Adds a new track with the given time, laps and track change interval.
The times are in minutes.

server,removetrack <track number>
Removes the specified track.

server,addmarshal <uid>
Adds a track marshal.

server,removemarshal <uid>
Removes a track marshal.

server,clearmarshals
Removes all track marshals

server,listmarshals
Lists the current track marshals.

server,at <time> <command>
Runs command at specified time.  Time can be either a UNIX timestamp
or a relative time consisting of the number of seconds with a plus
sign prefix.  E.g. "server, at +60 broadcast 1 minute has passed".

server,clearschedule
Forgets all commands scheduled with "server,at".

server,listschedule
Lists all commands scheduled with "server,at".

server,exec <script>
Executes a script stored on the server.  Scripts must begin with a
line that reads "#mxserverscript", followed by a series of server
commands (without the server, prefix).

server,maxclients <max> [reserved]
Sets the maximum number clients and optionally the number of slots set
aside for reserved UIDs.

server,maxplayers <max>
Sets the maximum number of players.

server,reserve <UID or ALL>
Adds a UID to the reserved list.  If ALL, it will reserve the UIDs of
all currently connected clients.

server,unreserve <UID or ALL>
Removes a UID from the reserved list.  If ALL, it will clear the
reserved list.

server,serverrate <bytes per second>
Sets the server's outgoing byte rate in bytes per second.

server,redirectslot <slot number> <address>
Tells client to disconnect and connect to the server at specified address.

server,shutdown
Shuts down the server.

======================================================================
Examples:

Here's how you would run a typical server.  First make a file named
"serverargs.txt" that looks like this:

--port 19800
--max-clients 11
--password xxxxxxx
--greeting "Welcome to my server"
--ban-file bans.txt
--results-file results.txt
--track-interval 15
--laps 5
alcrest.trackinfo
locust.trackinfo
x1b.trackinfo
overhill.trackinfo
smithtown.trackinfo
glenside.trackinfo
buddscreek.trackinfo
ridge.trackinfo
redbud.trackinfo
mooch.trackinfo
waterloo.trackinfo

Then run the server like this:

mxserver --args-file serverargs.txt


If you don't want to deal with a separate file, you could also just pass
everything on the command line like this:

mxserver --port 19800 --max-clients 11 --password xxxxxxx --greeting "Welcome to my server" --ban-file bans.txt --results-file results.txt --track-interval 15 --laps 5 alcrest.trackinfo locust.trackinfo x1b.trackinfo overhill.trackinfo smithtown.trackinfo glenside.trackinfo buddscreek.trackinfo ridge.trackinfo redbud.trackinfo mooch.trackinfo waterloo.trackinfo
