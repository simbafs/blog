---
title: 我怎麼使用 AI 寫程式
publishDate: '2025-07-21 17:41:11'
description: '用 Gemini 寫了一個專案後，這是我的一點心得'
tags:
  - ai
  - gemini
  - vibe coding
---

# 我怎麼使用 AI 寫程式

我使用的是 Gemini CLI，因為他有免費額度，額度用完了我就換一個帳號

## auth

我選擇用 API Key 驗證，因為我可以在家目錄建立檔案 `.env`，裡面長這樣

```
GEMINI_API_KEY=XXXX
#GEMINI_API_KEY=XXXX
#GEMINI_API_KEY=XXXX
```

裡面是不同帳號申請的 API key（在 [這裡](https://aistudio.google.com/apikey) 申請 ），每當額度用完了，我只需要按幾下就可以切換 key，然後在 Gemini CLI 中用 `/auth` 重新驗證，就可以用更多額度了。

## 建立專案

假設現在什麼都沒有，要建立一個全新的專案，我建議不要給 AI 自己開始，因為他真著很不喜歡用 `npm create` 之類的工具，他會自己寫入 `package.json`、`vite.config.js` 之類的檔案。所以建議是自己先執行 `npm create xxx`，並且把不需要的檔案移除。尤其是 node 這種要一堆設定檔的，這樣操作更為重要，不過像是 Golang 就還好，有個 `main.go` 和 `go.mod` 就能執行的就可以叫 AI 在一個空目錄直接開始。

## coding

coding 分兩個，一個是加新功能，另一個是修 bug。
加新功能的時候建議不要直接一句話「我要一個計算機網頁」，而是先開一個 `spec.md` 之類的檔案，在裡面用你自己的話描述需要的功能，語言零碎毫無組織沒關係。接著叫 AI 「把 @spec.md 中的內容重寫成正式、詳細的規格文件」，然後檢查他產出來的東西，把不合心意的東西修掉。最後才是叫 AI 「根據 @spec.md 某某章節的內容在 xx 目錄生成程式碼」。這樣的「翻譯」過程比較不會讓 AI 產生大便。

至於修 Bug，可先嘗試讓 AI 自己找問題，只要跟他說「按下按鈕後行為不符合預期，他應該怎養怎樣，請修復」之類的。但如果他找不出來，就需要你自己動手，比如說當你發現這是因為發生 deadlock，那麼就直接跟他說「@src/main.go 中 handleStart() 這個函式發生 deadlock，請解決」，他通常都可以很完美的解決。

## 重構

重構就更簡單了，尤其是當你東湊西湊完成一個能動的 MVP(Minimum Viable Product)，然後叫他根據 clean architecture 或是其他原則重構。因為這個過程本來就是 AI 最擅長的轉化內容（也就是前面提到的翻譯），所以一般來說都可以很完美的完成。

## commit

因為我的 git 有設定要簽章，三不五時他就會要我輸入 GPG 密碼解密密鑰，所以 AI 常常無法正確 commit，因此我都是叫他「generate commit message compared to HEAD and write it to commit.txt」，會叫他「compared to HEAD」是因為 Gemini 有時會只寫他做的事，我幫他修的東西他會當作看不見，或是我撤回他的大便但是他當作那個修改還在。接著使用命令 `git commit -F commit.txt` 提交更變。

> 當然 `commit.txt` 要加入 `.gitignore`

## FQA

### 什麼時候 Gemini CLI 的額度會重設？

Gemini CLI 額度分成每分鐘和每天兩種，每天的那個比較討厭，因為每分鐘的限制滑個手機就過了，根據 [這一篇 issue](https://github.com/google-gemini/gemini-cli/issues/2981) ，太平洋時間 00:00 會重設，也就是臺灣時間下午三點。
