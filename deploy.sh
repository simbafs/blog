#!/bin/bash

msg=$1
if [ -z "$msg" ]; then
    # read from stdin
    read -rp "Enter commit message: " msg
fi

if [ -z "$msg" ]; then
    msg=$(date +%Y-%m-%d)
fi

export GPG_TTY=$(tty)
echo UPDATESTARTUPTTY | gpg-connect-agent
git add .
git commit -m "$msg"
git push
