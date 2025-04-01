---
title: Git Snippet
publishDate: '2023-02-20'
description: ''
tags:
  - git
  - linux
legacy: true
---

# Git Snippet

## move branch to another commit (not recommand)

```
 git branch --force <branch name> <commit id>
```

## list changed filename

```
 git diff --name-only HEAD
```

[ref: stackoverflow](https://stackoverflow.com/questions/1552340/how-to-list-only-the-names-of-files-that-changed-between-two-commits)
