---
title: 文章更新時間錯亂問題
publishDate: '2020-08-20'
description: ''
tags:
  - hexo
  - linux
  - bash
legacy: true
---

# 問題

在設定完 GitHub Action 之後，我發現我的文章的更新時間都錯了，會全部變成當天日期。但是本地生成的就沒有這個問題，經過一番盤查和猜測後，我發現問題是因為 git 不會把 modified date 紀錄，因為每台電腦的時區都是不一樣的，紀錄起來沒有意義。但是我們需要這項 meta data，所以我們就要自己想法紀錄

# 解法 v1.0

首先，因為每一篇文章 hexo 都會紀錄建立時間，所以我們可以直接把他抓出來，然後把檔案的更新時間設成這個時間就可以啦！

## 更改檔案的 modified time

這個功能只要用我們最熟悉的 `touch` 就可以做到了。一般我們使用 `touch` 的時候會把 modified time 改成當下時間，那要改任意時間只要加上 `-t` 選項就可以啦

```
-t STAMP
    use [[CC]YY]MMDDhhmm[.ss] instead of current time
```

假設我們有個檔案 `tmp` ，我想把他的日期改成 `1999/3/23 12:32:33` ，那我可以這樣下指令

```
ted timeouch -t'19993231232.33' tmp
```

## 抓出檔名、日期

```bash
# git create time
grep -rnw source/_posts -e 'date'
```

output:（這裡的 `date:` 後面我多加了一個空白，原因後面會說）

```
source/_posts/hexo-installation.md:3:date:  2020-02-10 17:26:45
source/_posts/blessed.md:3:date:  2020-02-17 23:24:10
source/_posts/bash.md:3:date:  2020-02-16 22:15:10
source/_posts/hexo-cli-extras.md:3:date:  2020-02-11 21:26:30
source/_posts/remind-daniel.md:3:date:  2020-03-15 21:35:25
source/_posts/jquery.md:3:date:  2020-03-15 11:38:47
source/_posts/nginx-reverse-proxy-setup.md:3:date:  2020-02-13 10:34:58
source/_posts/nginx-ui.md:3:date:  2020-06-23 22:50:29
source/_posts/reverse-ssh.md:3:date:  2020-02-23 21:24:34
source/_posts/webpack-react.md:3:date:  2020-06-28 22:39:57
source/_posts/mxlinux-change-workspace.md:3:date:  2020-05-08 17:59:22
```

## 分離時間，檔名

觀察他的輸出  
檔名的部份是在以冒號分隔的第一欄  
日期/時間是在以空格分隔的第二、三欄
那我們就可以根據這個把他們分離出來

```bash
# get name, time
grep -rnw source/_posts -e 'date' > t
cut -d: -f1 t > name
cut -d' ' -f2,3 t > time
```

output:（節錄，這邊沒有對的很好）
name:

```
source/_posts/sqlite.md
source/_posts/ssh-tunnel.md
source/_posts/unix-socket.md
source/_posts/webpack-react.md
source/_posts/youtube-dl.md
source/_posts/加入-google-search-和-sitemap.md
```

time:

```
2020-02-24 22:14:36
2020-02-23 14:30:22
2020-06-28 22:39:57
2020-03-04 22:48:20
2020-08-19 22:37:52
2020-08-20 23:33:13
```

## 處理日期的格式

在 `更改檔案的 modified time` 提到的日期格式和我們抓出來的不太一樣，所以我們需要做一些處理

```
cut -d' ' -f2,3 t | sed 's/[- ]//g' | sed 's/://' | sed 's/:/./' > time
```

這樣就可以成功轉換日期格式了

## 時間檔

接下來把 `name`、`time` 合起來就變成時間擋了，這裡有一點要注意，因為我們恢復的時候是用 for 迴圈，換行和空白都會被當成切斷符號，所以檔名和時間中間的間隔符號我們選用冒號 `:`

```
paste -d: name time > source/_posts/time
```

## 清垃圾

最後記得把剛才產生出來但是用不到的檔案清掉

```
rm t name time
```

## 完整程式碼

```bash
# updateDate.sh
#!/bin/bash
if [[ -z $1 ]];then
  dir="source/_posts"
else
  dir=$1
fi

grep 'date: [0-9]{4}' $dir/*.md > t
cut -d: -f1 t > name
cut -d' ' -f2,3 t | sed 's/[- ]//g' | sed 's/://' | sed 's/:/./' > time
paste -d: name time > $dir/time

for i in $(cat $dir/time);do
  n=$(echo $i | cut -d: -f1);
  d=$(echo $i | cut -d: -f2);
  touch -t$d $n;
done

rm t name time
```

## 備註

剛剛有說到在這份教學中的 `date: ` 都多加一個空白，原因是因為 grep 在抓時候不會只抓第一個，為了避免抓到錯的所以我故意讓他不匹配，不然再生成時間檔的時候會出錯，所以你們的文章中如果出現會匹配 `date: [0-9]{4}` 的字串，記得要做一下手腳

# 解法 v2.0

上一個作法雖然可行，但是有一個缺點，就是他的更新時間都會是建立時間，不會是 modified time，所以解法二誕生了  
其實很簡單，改上面的一小行就好了。首先用 `stat` 取出檔案的 modified time

```bash
stat -c %y source/_posts/*.md > time
```

```
2020-03-04 22:48:20.000000000 +0800
2020-08-19 22:37:52.000000000 +0800
2020-08-21 22:15:44.366513358 +0800
2020-07-04 10:17:39.000000000 +0800
```

然後在經過適當的轉換變成我們要的格式就完成啦！

## 完整程式碼

```bash
# storePostTime.sh
#!/bin/bash
if [[ -z $1 ]];then
  dir=source/_posts
else
  dir=$1
fi

ls $dir/*.md > name
stat -c %y $dir/*.md |\
  cut -d' ' -f1,2 |\
  sed 's/[- ]//g' |\
  sed 's/://' |\
  sed 's/:/./' |\
  cut -d. -f1,2 > time
paste -d: name time > t
mv t $dir/time
rm name time
```

```bash
# recorverDate.sh
#!/bin/bash
if [[ -z $1 ]];then
  file="source/_posts/time"
else
  file=$1
fi
for i in $(cat $file);do
  n=$(echo $i | cut -d: -f1);
  d=$(echo $i | cut -d: -f2);
  touch -t$d $n;
done
```
