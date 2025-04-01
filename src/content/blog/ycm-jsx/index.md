---
title: 讓 YCM 接受 jsx
publishDate: '2020-07-04'
description: ''
tags:
  - vim
  - jsx
  - react
---

# 讓 YCM 接受 jsx

最近寫 ˋreact 的時候只要遇到 jsx 語法 YCM 就會跳出這個錯誤

```
Cannot use JSX unless the '--jsx' flag is provided. (FixIt)
```

研究之後發現這是要給 tsserver 一個 `--jsx` 的 flag 就可以解決
爬文半個小時後發現只要在專案下的 `jsconfig.json`

```diff
{
  "compilerOptions": {
    "target": "es6",
    "checkJs": true
+ },
+ "compilerOptions": {
+   "jsx": "react"
  }
}
```
