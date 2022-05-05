@echo off

rem Change the following line to your UID instead of 0
set ADMINID=23971
set PORT=19800;

if not %ADMINID%==0 goto runserver

echo Enter the UID for the adminstrator of this server.
echo If you don't know it, log onto a server and type
echo "server,listplayers" to find it.
set /p ADMINID=? 

:runserver
echo Starting mxserver...
mxserver --admin %ADMINID% --port %PORT% --args-file serverargs.txt
pause
