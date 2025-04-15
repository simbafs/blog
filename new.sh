#!/bin/bash

title=$1

if [ -z "$title" ]; then
    echo "Usage: $0 <title>"
    exit 1
fi

if [ -d "./src/content/blog/${title}" ]; then
    vi ./src/content/blog/"${title}"/index.md
else
    mkdir -p ./src/content/blog/"${title}"

    cat <<-EOF >./src/content/blog/"${title}"/index.md
---
title: "${title}"
publishDate: "$(date '+%Y-%m-%d %H:%M:%S')"
description: ''
tags: []
---

# ${title}
EOF

    vi ./src/content/blog/"${title}"/index.md
fi
