#!/bin/bash

msg=$1
if [ -z "$msg" ]; then
    msg=$(date +%Y-%m-%d)
fi

fixGPG
git add .
git commit -m "$msg"
git push
