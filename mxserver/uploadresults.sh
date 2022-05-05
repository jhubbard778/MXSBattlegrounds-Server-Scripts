#!/bin/bash

name="$1"
results="$2"
password="$3"

if test -z "$name"
then 
        exit 1
fi

if ! test -f "$results"
then
        exit 1
fi

if test -z "$password"
then 
        exit 1
fi

tmpresults=$(mktemp /tmp/results.XXXXXXXX)

cp -- "$results" $tmpresults

(
curl -s -F "name=$name" -F "password=$password" -F 'results=<'$tmpresults http://mxsimulator.com/uploadresults.php
rm $tmpresults
) >/dev/null &
