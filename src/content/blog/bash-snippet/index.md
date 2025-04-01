---
title: Bash Snippet
publishDate: '2023-02-25'
description: ''
tags:
  - bash
  - snippet
  - command
  - cli
  - linux
legacy: true
---

# Bash Snippet

## Clear broken symlinks

```
 $ find . -type l ! -exec test -e {} \; -exec sudo rm {}  \;
```

> [stackoverflow](https://unix.stackexchange.com/questions/34248/how-can-i-find-broken-symlinks)

## Random String

```
$ cat /dev/random | head | md5sum | head -c 32
```
