---
title: '用 Go 更順暢的打造前後端分離的網頁應用程式'
publishDate: '2025-04-15 23:24:50'
description: '一個幫助建構前後端分離的 Go 網頁應用程式的工具'
tags:
  - go
---

## kama 是什麼

kama 是我在寫到大概地三個 Go 的前後端分離網頁應用程式時弄出來的套件。首先介紹一下我喜歡的開發模式，第一，一定是前後端分離，前端可能是 nextjs（SSG），後端是 Go。我不會使用 Nextjs 中的 Action、Dynamic route 之類的功能，單純把它當作 ReactJS 的打包工具。後端負責提供資料庫、API 之類的功能。在寫這堆程式的時候，有個問題馬上就跑出來了，開發的時候很直覺的會使用 NextJS 提供的開發伺服器嘛（這樣才有 hot reload），同時我又需要開一個 Go 的伺服器，那麼把 NextJS 開在埠 `3001`，Go 開在埠 `3000`，很棒。開發的時候都很棒，但是當打包成執行檔的時候問題就跑出來了，部屬的時候只會有一個埠 `3000`，前端所有呼叫 API 的地方都要從 `3001` 改成 `3000`。於是，我就開始研究怎麼讓 Go 提供 API 的同時，把所有其他沒處理的請求轉發到埠 `3001`，這麼一來，寫前端的時候就可以當作所有網址都是 `http://localhost:3000` 了。

> kama 是臺語中「橘子」的發音，音標是 /kam-á/

## 功能亮點

- 開發時把請求轉給前端的開發伺服器
- 編譯時把前端產出來的靜態檔案用 Golang 的 embed 功能打包進執行檔
- 用 overlayfs 讓執行時可以隨時覆蓋嵌入執行檔的靜態網頁檔案

## 怎麼使用？

首先安裝 kama

```
go get -u github.com/simbafs/kama
```

載入 `embed.FS`

```go
//go:embed all:static/*
var static embed.FS
```

建立一個 kama 物件

```go
k := kama.New(static)
```

把 kama 加入路由，目前支援 `net/http` 和 `gin`，其他的我用不到所以沒寫，歡迎 [PR](https://github.com/simbafs/kama/fork)！

```go
r := gin.Default()

// 一些你的 API endpoints ...

r.Use(k.Gin())

log.Fatel(r.Run(":3000"))
```

或是

```go
mux := http.NewServeMux()

// 一些你的 API endpoints ...

mux.HandleFunc("/", k.Go())

log.Fatal(http.ListenAndServe(":3000", mux))
```

> Tips  
> 你可以在建立 `kama` 物件時設定 `tree`，這會新增一個會印出 embed.FS 和 static 中檔案的路由，這在你懷疑某個檔案是不是不存在或是 debug overlayfs 相關問題時蠻好用的  
> `k := kama.New(static, kama.WithTree('/tree'))`

## 結語

kama 解決了前後端分離的網頁應用程式開發和部屬上的小麻煩，他提供了一個懶人的解決方案，達成了「開發方便、部屬簡單」的目的。  
開發的過程中蠻意外找不到類似的東西，這個畢竟只是我自己使用的玩具套件，蠻好奇像是 Gitea 之類的專案怎麼解決這個問題，也許他們的前端沒有 hot reload？
