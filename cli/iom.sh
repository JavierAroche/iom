#!/bin/bash

HELP="
Usage: iom file [option ...] ...

Options
-s <setting [option]> Use setting with options
-sub <folder name>    Save exports in subfolder (keep original)
-i                    Include subfolders when loading a folder
-h                    Show iom options
"

if [ $# -eq 0 ]; then
    echo "$HELP"
else
    for arg; do
        if [ $# -eq 1 ]; then
            open -a iom "$arg"
        fi
        if [ "$arg" == "-s" ]; then
            open -a iom "$arg"
        fi
        if [ "$arg" == "-sub" ]; then
            open -a iom "$arg"
        fi
        if [ "$arg" == "-i" ]; then
            open -a iom "$arg"
        fi
        if [ "$arg" == "-h" ]; then
            echo "$HELP"
        fi
    done
fi
