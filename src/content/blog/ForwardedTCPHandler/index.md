---
title: 閱讀 ssh.ForwardedTCPHandler 源碼
publishDate: 2025-05-06
description: 逐行閱讀 github.com/gliderlabs/ssh 內 ForwardedTCPHandler 原始碼的筆記
tags:
  - golang
  - ssh
  - "#rfc"
  - tcp
legacy: false
---
高中第一次使用 ssh tunnel 後就對他很有興趣，後來幾次想用研究他卻一直沒什麼機會。這次研讀的是[github.com/gliderlabs/ssh v0.3.8](https://github.com/gliderlabs/ssh/tree/v0.3.8) 中很小的一部分，只負責實作 tcp reverse proxy，且還沒有深入底層 ssh 協定，但對於理解 ssh 協定的運作是蠻好的一個開始。
## 結構體定義
首先看結構體的定義
```go ln:92
type ForwardedTCPHandler struct {
	forwards map[string]net.Listener
	sync.Mutex
}
```
需要關注的只有 `forwards`，`sync.Mutex` 只是個鎖。`forwards` 是一個字串對應 `net.Listener` 的映射，可以猜測，一個 ssh 連線可以轉發多個連線，確實之前看過 RFC 規格書是可以辦到的，~~只是我不知道怎麼用原版的 ssh 指令弄出來~~。

> ok，寫到「只是我不知道...」這句的時候突然我腦袋被雷打到，有個想法，試試 `ssh -R 4000:localhost:3000 -R 5000:localhost:3000 localhost -p 2222`，成功了  
> 另外，如果現在已經有個 ssh 連線了，可以使用跳脫序列 `~C` 開啟命令行（建立 ssh 連線時要加上選項 `-o EnableEscapeCommandline=yes`），然後跟平常在指令一樣使用 `-R 4000:localhost:3000` 就可以臨時建立轉發了。另外使用跳脫序列 `~?` 可以看到所有能用的 跳脫序列
## HandleSSHRequest()
### 參數
`ForwardedTCPHandler` 唯一有用的方法 `HandleSSHRequest()`，他接收三個參數 `ctx Context`、`srv *Server` 和 `req *gossh.Request`，如果猜的沒錯，這個套件應該是在官方的 `context` 推廣之前就建立的，跟 gin 一樣，所以才會自訂 context，`srv` 沒什麼好說的，就是對應的 ssh server，而 `req` 應該就是建立這個 forward 的請求了。  
### 回傳值
這個函數的兩個回傳值 `bool, []byte`，看字面意思猜測應該是對應「請求使否成功」和「訊息」，至於如果回傳訊息會出現在哪裡應該就是看客戶端實作。  
> Update:  
> 舉例來說，當收到 `tcpip-forward` 的 `SSH_MSG_GLOBAL_REQUEST` 且 port = 0 want reply = true 時，就要回傳綁定的埠號  

### 初始化
進入函式前五行先確保 `h.forwards` 不是 `nil`，這樣 `ForwardedTCPHandler` 不用初始化也能使用
```go ln:98
h.Lock()
if h.forwards == nil {
	h.forwards = make(map[string]net.Listener)
}
h.Unlock()
```
然後從 `ctx` 中取出連線
```go ln:103
conn := ctx.Value(ContextKeyConn).(*gossh.ServerConn)
```
### 處理不同請求類型
然後是一個大大的 switch，他會處理兩種類型 `tcpip-forward` 和 `cancel-tcpip-forward`，這兩個最都會回傳 `true, ...`，如果不是以上兩個請求類型，函數就會回傳 `false, nil`，這個布林值驗證了前面對於回傳值得猜測。
```go ln:104
switch req.Type {
case "tcpip-forward":
	...
	return true, ...
case "cancel-tcpip-forward":
	...
	return true, ...
default:
	return false, nil
}
```
接著我們就來看這個函式怎麼處理這兩個請求類型
### tcpip-forward
在一開始先從 `req` 中讀取請求的內容
```go ln:106
var reqPayload remoteForwardRequest
if err := gossh.Unmarshal(req.Payload, &reqPayload); err != nil {
	// TODO: log parse failure
	return false, []byte{}
}
```
`remoteForwardRequest` 的定義是
```go ln:68
type remoteForwardRequest struct {
	BindAddr string
	BindPort uint32
}
```
如果伺服器有設定 `ReversePortForwardingCallback()` 函式，就執行他，如果函數回傳 `false`，代表判定不給 tcp 轉發，就回傳 `false` 和錯誤訊息 `[]byte("port forwarding is disabled")`。
```go ln:111
if srv.ReversePortForwardingCallback == nil || !srv.ReversePortForwardingCallback(ctx, reqPayload.BindAddr, reqPayload.BindPort) {
	return false, []byte("port forwarding is disabled")
}
```
接著，根據 `reqPayload` 中的資訊建立 TCP 監聽器
```go ln:114
addr := net.JoinHostPort(reqPayload.BindAddr, strconv.Itoa(int(reqPayload.BindPort)))
ln, err := net.Listen("tcp", addr)
if err != nil {
	// TODO: log listen failure
	return false, []byte{}
}
```
接下來這段程式我覺得可以放後面一點，因為他到蠻後面才用得到。通常來說 `destPort` 和 `reqPayload.BindPort` 會一樣，但是有例外。[RFC](https://datatracker.ietf.org/doc/html/rfc4254#section-7.1) 中有提到，當 `reqPayload.BindPort` 是 0 且 WantReply = True 時，伺服器要隨機挑一個 > 1024 的埠（非特權），並且使用 `remoteForwardSucess` 把挑選的埠號回傳。
```go ln:120
_, destPortStr, _ := net.SplitHostPort(ln.Addr().String())
destPort, _ := strconv.Atoi(destPortStr)
```
建立好連線後，就把他放進 `h.forwards` 裡存起來，這邊用的 key 是客戶端送來的 addr + port
```go ln:122
h.Lock()
h.forwards[addr] = ln
h.Unlock()
```
啟動一個 goroutine，當收到關閉訊號時關掉 TCP 監聽器
```go ln:125
go func() {
	<-ctx.Done()
	h.Lock()
	ln, ok := h.forwards[addr]
	h.Unlock()
	if ok {
		ln.Close()
	}
}()
```
再啟動一個 goroutine，負責接收監聽器進來的連線，並且在 for 迴圈結束後（連線關閉）刪除從 `h.forwards` 監聽器
```go ln:134
go func() {
	for {
		c, err := ln.Accept()
		if err != nil {
			// TODO: log accept failure
			break
			...
		}
		h.Lock()
		delete(h.forwards, addr)
		h.Unlock()
}()
```
拿到 TCP 連線後，先解開遠端（客戶端）的地址與埠號
```go ln:141
originAddr, orignPortStr, _ := net.SplitHostPort(c.RemoteAddr().String())
originPort, _ := strconv.Atoi(orignPortStr)
```
然後把這兩個值分別塞進 `remoteForwardChannelData` 的 `OriginAddr` 和 `OriginPort` 欄位，`DestAddr` 和 `DestPort` 欄位則是當初請求指定的地址與監聽器實際監聽的埠號

> 在 `[本地] <-ssh-> [伺服器] <-tcp-> [遠端]` 的架構中，`Origin` 描述的是遠端的端口，而 `Dest` 描述的是伺服器的端口，所以理論上只有 `Dest` 的部份會影響到 `[本地] <-ssh-> [伺服器]` 這段通訊。實驗確實如此複製了一份程式碼後任意修改 `Origin` 的地址與埠號都不影響實際上的轉發。

```go ln:143
payload := gossh.Marshal(&remoteForwardChannelData{
	DestAddr:   reqPayload.BindAddr,
	DestPort:   uint32(destPort),
	OriginAddr: originAddr,
	OriginPort: uint32(originPort),
})
```
`remoteForwardChannelData` 的定義是
```go ln:82
type remoteForwardChannelData struct {
	DestAddr   string
	DestPort   uint32
	OriginAddr string
	OriginPort uint32
}
```
他的用途是由伺服器傳給本地，讓本地的 ssh 知道要開啟一個 ssh 通道處理 tcp 連線轉發。
然後，再次開啟一個 goroutine 處理來處理這個 ssh 通道，避免阻塞 TCP 監聽器
```go ln:149
go func() {
	ch, reqs, err := conn.OpenChannel(forwardedTCPChannelType, payload)
	if err != nil {
		// TODO: log failure to open channel
		log.Println(err)
		c.Close()
		return
	}
	...
}()
```
`forwardedTCPChannelType` 是在檔案一開始定義的常數，他的值是 `forwarded-tcpip`。
我們要捨棄從這個新開啟的 ssh 通道進來的所有請求
```go ln:157
go gossh.DiscardRequests(reqs)
```
然後就是經典的兩個 `io.ReadWriteCloser` 互相複製的程式
```go ln:158
go func() {
	defer ch.Close()
	defer c.Close()
	io.Copy(ch, c)
}()
go func() {
	defer ch.Close()
	defer c.Close()
	io.Copy(c, ch)
}()
```
### cancel-tcpip-forward
取消的部份就比較簡單了，先讀取請求的內容確定要取消哪個轉發
```go ln:127
var reqPayload remoteForwardCancelRequest
if err := gossh.Unmarshal(req.Payload, &reqPayload); err != nil {
	// TODO: log parse failure
	return false, []byte{}
}
```
組合出 `h.forwards` 的鍵值 addr + port
```go ln:132
addr := net.JoinHostPort(reqPayload.BindAddr, strconv.Itoa(int(reqPayload.BindPort)))
```
從 `h.forwards` 中取出 TCP 監聽器
```go ln:133
h.Lock()
ln, ok := h.forwards[addr]
h.Unlock()
```
如果成功，關掉他
```go ln:136
if ok {
	ln.Close()
}
```
## 統整
### 程式
整個函式最重要的是以下這幾行
```go
func (h *Server) HandleSSHRequest(ctx ssh.Context, srv *ssh.Server, req *gossh.Request) (bool, []byte) {
	...
	switch req.Type {
	case "tcpip-forward":
		...
		ln, err := net.Listen("tcp", addr)
		...
		go func() {
			for{
				c, err := ln.Accept()
				...
				go func(){
					ch, reqs, err := conn.OpenChannel(forwardedTCPChannelType, payload)
					...
				}()
			}		
			...
		}()
	}
}
```
### SSH 協定
> 這段應該要搭配 [rfc 4254](https://datatracker.ietf.org/doc/html/rfc4254) 服用

本地端先發出一個 `tcpip-forward` 型別的 `SSH_MSG_GLOBAL_REQUEST` 請求，當伺服器收到遠端的 TCP 請求後，伺服器發出一個 `forwarded-tcpip` 型別的 `SSH_MSG_CHANNEL_OPEN` 請求開啟通道，通道開啟後就可以兩邊複製資料了。
整個流程是本地端先發起的，根據 RFC 規格書，如果伺服器主動發起開啟通道的，本地端「必須」拒絕。
## 參考資料
- https://datatracker.ietf.org/doc/html/rfc4254
- https://github.com/gliderlabs/ssh