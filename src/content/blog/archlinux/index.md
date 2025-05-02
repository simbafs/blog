---
title: Arch Linux
publishDate: 2025-05-02
description: My story of installing arch linux
tags:
  - linux
  - archlinux
  - operating system
legacy: false
---
## 我幹麻又重裝系統
我原本使用的是 KDE neon，用著用著開始出現一些問題。首先是 firefox 之前我裝了一個 userscript，他大幅修改了 Firefox 的配置，我後來覺得不是很滿意，卻又不知道怎麼移除。然後是有個東西 baloo_file_extractor，我的電腦用著用著，就會突然卡到幾乎動不了，但是 CPU memory 都沒有飆高的傾向，一陣排查後懷疑是東西在搞鬼，但其實我也不是很確定。  
基於以上理由，於是我打算整個重裝算了，順便試試看 Arch Linux。其實我每次重裝大概都是這個理由，上次裝 KDE neon 也是想試試 KDE 所以才裝的。
## 我的系統配置
### 硬碟分割
首先是我的系統配置，最重要的是硬碟分割。
```
$ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS  
nvme0n1     259:0    0 931.5G  0 disk    
|-nvme0n1p1 259:1    0     2G  0 part /boot/efi  
|-nvme0n1p2 259:2    0  60.6G  0 part [SWAP]  
|-nvme0n1p3 259:3    0   100G  0 part /  
|-nvme0n1p4 259:4    0 668.9G  0 part /home  
`-nvme0n1p5 259:5    0   100G  0 part
```
我有一個 1T 的 SSD，分成了 `boot`、`swap`、`root1`、`home` 和 `root2`，原本的 KDE neon 裝在 `root1` 也就是 `nvme0n1p5`，這是的 Arch Linux 預計裝在 `root2`。  
### bootloader
而之前因為我還在 `root2` 裝了 PopOS（也是想試試），然後因為 PopOS 用的 bootloader 不是 grub 而是 systemd-boot（我把 KDE neon 也弄成用 systemd-boot 開機了）
所以還要另外處理 systemd-boot 的部分，不然開機會找不到 arch linux
## 大略過程
### Live USB
前面都跟平常一樣，下載 ISO、用 `dd` 燒錄到隨身碟上、用隨身碟開機。再來就不太一樣了，眾所周知 Arch Linux 沒有圖形化的安裝界面，全都要用命令行安裝，為了能舒服的用瀏覽器開 https://wiki.archlinux.org/title/Installation_guide 看教學，於是我做了以下動作：
1. 跟著 [1.11](https://wiki.archlinux.org/title/Installation_guide#Format_the_partitions) 掛載 `nvme0n1p3 = /`、`nvme0n1p1 = /boot/efi`、`nvme0n1p4 = /home`
2. 跟著 [2](https://wiki.archlinux.org/title/Installation_guide#Installation) 安裝基本套件
3. 關機！
### Chroot
接著就是雙系統的優勢了，開機到原本的 KDE neon，然後寫一個 `arch.sh` 並且給執行權限 `chmod a+x arch.sh`
```bash
#!/bin/sh

sudo mount --mkdir /dev/nvme0n1p3 /mnt/arch
sudo mount /dev/nvme0n1p4 /mnt/arch/home
sudo mount /dev/nvme0n1p1 /mnt/arch/boot/efi
sudo mount --types proc /proc /mnt/arch/proc
sudo mount --rbind /sys /mnt/arch/sys
sudo mount --make-rslave /mnt/arch/sys
sudo mount --rbind /dev /mnt/arch/dev
sudo mount --make-rslave /mnt/arch/dev
sudo mount --bind /run /mnt/arch/run

sudo chroot /mnt/arch

sudo umount -R /mnt/arch
```
然後就可以執行 `./arch` 直接假裝進入 arch linux，除了沒有真正開機、systemd 可能不理你以外，安裝套件、修改檔案配置什麼的完全沒問題。這時候就可以左邊開瀏覽器，右邊開終端機 chroot，舒服

> 其實這個 `arch.sh` 做的事跟 [3.2](https://wiki.archlinux.org/title/Installation_guide#Chroot) 的 `arch-chroot` 做的差不多
### Home
為了雙系統不打架，我兩邊的使用者都取名 simba（雖然 linux 中使用者名稱不重要 ><），但是家目錄在 arch linux 這邊設成 `/home/simba-arch`，這樣就不會打架了（記得嗎？我的 `/home` 是獨立一個硬碟分區，兩個系統共用的）

> 我之前有幾次安裝新的系統不會換家目錄，這樣設定檔就通通不用搬，但是這次我想重弄 Firefox，所以開了一個新的家目錄。

## 坑
### initramfs
這個部份是因為我把 bootloader 換成 systemd-boot 才會出現的問題，我需要手動把 `/boot/{initramfs-linux.img,initramfs-linux-fallback.img,vmlinuz-linux}` 複製到 `/boot/efi/EFI/arch` 裡。原本我是想改 `/etc/mkinitcpio.d/linux.preset` 中 `default_image` 和  `fallback_image` 兩的路徑，直接讓他寫進 `/boot/efi/EFI/arch` 裡，但還是有點問題。最後我弄了一個 systemd service，會在關機前執行複製
```systemd
[Unit]  
Description=Copy initramfs and vmlinuz to /boot/efi/EFI/arch before shutdown  
DefaultDependencies=no  
Before=shutdown.target reboot.target halt.target umount.target  
  
[Service]  
Type=oneshot  
ExecStart=/usr/local/bin/cpinitramfs.sh  
RemainAfterExit=yes  
  
[Install]  
WantedBy=halt.target reboot.target shutdown.target  
```
`/use/local/bin/cpinitramfs.sh` 的內容長這樣
```bash
#!/bin/bash  
  
cp /boot/{initramfs-linux.img,initramfs-linux-fallback.img,vmlinuz-linux} /boot/efi/EFI/arch
```
然後記得給執行權限、啟用服務
```
chmod a+x /usr/local/bin/cpinitramfs.sh
systemctl daemon-reload
systemctl enable cpinitramfs.service
```
順便附上 `/boot/efi/loader/entries/arch.conf`
```conf
title	Arch Linux
linux	/EFI/arch/vmlinuz-linux
initrd	/EFI/arch/initramfs-linux.img
options	root=UUID=72f0c94d-708c-4da9-8bcf-663e6a3906b4 rw
```
### WiFi
以前 ubuntu 的 installer 都把我養的太好了，我還真的沒在純終端機環境中設定 WiFi。首先要起動一些服務
```bash
systemctl start iwd.service
systemctl start NetworkManager
```
然後連線
```
nmcli d wifi rescan
nmcli d wifi connect <SSID>
```
搭拉！有網路了
## 心得
裝過這麼多系統，arch linux 確實是個很特別的體驗，之前的所有系統都有圖形化的安裝精靈會幫我搞定一切。也許是累積了五六年的 linux 經驗的關係，其實我覺得安裝 arch linux 沒有網路上說的那麼難嘛，搞最久的就只有 WiFi 而已。其他部份有 `pacman` 和 `yay` 都很簡單了。  
換成 Arch 後，最明顯的不同就是玩缺氧的時候明顯變得更順、CPU 溫度更低，之前動不動就 99 度，現在可以壓在 70 度左右，不知道是極簡的系統設計還是因為 arch linux 是 steam os 上游的關係。  
