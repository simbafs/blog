---
title: NeonKDE
publishDate: '2023-08-29'
description: ''
tags:
  - kde
  - linux
  - desktop
  - neonKDE
  - git
  - gpg
legacy: true
---

# NeonKDE

## git sign with gpg
```
export GPG_TTY=$(tty)
```

> https://gist.github.com/paolocarrasco/18ca8fe6e63490ae1be23e84a7039374?permalink_comment_id=4455441#gistcomment-4455441

## gpg agent

```
$ echo UPDATESTARTUPTTY | gpg-connect-agent
```

> https://unix.stackexchange.com/questions/371901/gpg-agent-refuses-ssh-keys-with-ssh-add-reporting-agent-refused-operation
