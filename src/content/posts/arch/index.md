---
title: Archinstall 安装全流程指南
published: 2026-10-20
description: 'Archinstall 安装全流程指南'
image: ./cover.png
tags: [arch,linux]
category: 'linux'
draft: false 
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/%E7%B1%BB%E5%9E%8B-%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B-blue)
![Static Badge](https://img.shields.io/badge/%E7%B3%BB%E7%BB%9F-Arch%20Linux-1793d1?logo=archlinux&logoColor=white)
![Static Badge](https://img.shields.io/badge/%E5%B7%A5%E5%85%B7-archinstall-1793d1?logo=linux&logoColor=white)
![Static Badge](https://img.shields.io/badge/%E5%BC%95%E5%AF%BC-UEFI%20%2F%20BIOS-orange)
![Static Badge](https://img.shields.io/badge/%E6%A1%8C%E9%9D%A2-KDE%20%2F%20GNOME%20%2F%20Hyprland-green)
![Static Badge](https://img.shields.io/badge/%E7%8A%B6%E6%80%81-%E5%B7%B2%E6%95%B4%E7%90%86-lightgrey)

</div>

# Archinstall 安装全流程指南
> 适用对象：想用官方 `archinstall` 引导安装器（Guided Installer）快速装好 Arch Linux 的用户。
> 本文基于官方文档 [archinstall.archlinux.page](https://archinstall.archlinux.page/installing/guided.html) 整理，覆盖从制作启动盘到首启登录的完整流程。
> 版本说明：`archinstall` 迭代较快，菜单文案可能随版本微调，但核心步骤一致。下文以较新的引导安装器为准。
---
## 目录
1. [前置说明](#1-前置说明)
2. [准备工作](#2-准备工作)
3. [启动进入 Live 环境](#3-启动进入-live-环境)
4. [联网与基础检查](#4-联网与基础检查)
5. [启动 archinstall](#5-启动-archinstall)
6. [引导安装菜单逐项填写](#6-引导安装菜单逐项填写)
7. [确认并开始安装](#7-确认并开始安装)
8. [安装后首次启动](#8-安装后首次启动)
9. [常用后续配置](#9-常用后续配置)
10. [无人值守 / 脚本化安装](#10-无人值守--脚本化安装)
11. [常见问题与排错](#11-常见问题与排错)
---
## 1. 前置说明
`archinstall` 是 Arch Linux 官方提供的**引导式安装脚本**，基于 TUI（终端图形界面）一步步引导你完成磁盘分区、账号、桌面等配置。它与传统的「手动敲命令」安装相比：
- ✅ 省去大量手工命令，出错概率低；
- ✅ 支持桌面环境、显卡驱动、音频服务等一键勾选；
- ⚠️ 仍是「真 Arch」，装完系统很精简，后续需自己维护；
- ⚠️ 安装器**不会**在开始前帮你连 Wi‑Fi，网络需自行先配好。
> 官方建议：**始终从官方 Arch Linux ISO 内运行 `archinstall`**，避免第三方环境缺少依赖导致异常。
---
## 2. 准备工作
需要准备的物料：
| 项目 | 说明 |
| --- | --- |
| 一台目标电脑 | 满足 Arch 基本硬件要求（64 位 CPU、约 2GB+ 内存、充足磁盘空间） |
| 一个 ≥ 1GB 的 U 盘 | 用于制作启动盘，**会被清空** |
| 官方 Arch ISO | 从 [archlinux.org/download](https://archlinux.org/download/) 获取，建议校验签名 |
| 稳定的网络 | 有线网络最省心；Wi‑Fi 也能用，但需手动连接 |
### 制作启动盘（以现有 Linux 为例）
```bash
# 假设 ISO 已下载到 ~/Downloads，U 盘设备为 /dev/sdX（务必确认，写错会清掉别的盘）
sudo dd if=~/Downloads/archlinux-*.iso of=/dev/sdX bs=4M status=progress oflag=sync
```
> Windows 用户可用 [Rufus](https://rufus.ie/)（写入模式选「DD 镜像」或默认 ISO 均可，官方 ISO 推荐 DD 模式）或 balenaEtcher。
---
## 3. 启动进入 Live 环境
1. 把 U 盘插到目标电脑，开机按 `F2 / Del / F12`（因主板而异）进入启动菜单；
2. 选择 U 盘启动；
3. 在 Arch 启动菜单中：
   - **UEFI 机器**：选 `Arch Linux install medium (x86_64, UEFI)`；
   - **老 BIOS 机器**：选 `Arch Linux install medium (x86_64, BIOS)`；
4. 稍等片刻，进入黑色终端，提示符为 `root@archiso ~ #`，表示已进入 Live 环境。
---
## 4. 联网与基础检查
安装器不会帮你联网，**这一步必须自己做**。
### 有线网络（多数情况）
插上网线后通常自动获取 IP。验证：
```bash
ping -c 3 archlinux.org
```
能通即可。
### Wi‑Fi 连接
用 `iwd` 自带的 `iwctl`：
```bash
iwctl
# 进入交互界面后：
device list                 # 列出无线网卡，如 wlan0
station wlan0 scan          # 扫描
station wlan0 get-networks  # 查看可用热点
station wlan0 connect "你的SSID"   # 按提示输入密码
exit
ping -c 3 archlinux.org
```
### 同步时间（重要）
Arch 安装依赖正确的系统时间，否则签名校验会失败：
```bash
timedatectl set-ntp true
timedatectl status    # 确认 "System clock synchronized: yes"
```
### 检查启动模式
```bash
ls /sys/firmware/efi/efivars
```
- 目录存在 → **UEFI 模式**；
- 提示无此目录 → **BIOS/Legacy 模式**。
这决定了后续分区与引导方式。
---
## 5. 启动 archinstall
确认联网、时间正常后，直接运行：
```bash
archinstall
```
引导安装器（`guided`）是默认脚本，等同于 `archinstall guided`。随后进入 TUI 主菜单。
> 想看所有内置脚本：`archinstall --script list`。
> 其他内置脚本还有 `minimal`（最小安装）、`only_hdd`（只分区）等。
---
## 6. 引导安装菜单逐项填写
TUI 中可用 **方向键 / Tab** 移动，**回车**进入或确认，**空格**勾选。下面是引导安装会依次出现的主要配置项：
### 6.1 语言（Archinstall Language）
选择安装器界面语言，例如 `English`。中文界面可能不完整，建议先用英文降低踩坑概率。
### 6.2 键盘布局（Keyboard layout）
默认 `us`。中文用户一般保持 `us`；如需终端中文输入法另行配置。
### 6.3 镜像源 / 地区（Mirror region）
选择离你最近的镜像地区（如 `China`、`Worldwide`）。选好后下载速度更快。可多选。
### 6.4 磁盘配置（Disk configuration）
最重要的一步，三个子选项：
- **Wipe all and use best-effort default partition layout**
  清空整块盘，自动给出推荐分区（新手最省心，UEFI 会自动建 EFI + 根分区 + swap）。
- **Manual partitioning**
  手动分区，适合多系统 / 自定义布局。需自己指定 `/`（根）、`/boot` 或 `/efi`、swap 等挂载点。
- **Custom layout（仅格式化已挂载分区）**
  如果你已经自行 `mount` 到 `/mnt/archinstall`，安装器就不再动磁盘。
> ⚠️ 「Wipe all」会**抹掉整块磁盘数据**，务必确认选对磁盘、已备份。
### 6.5 磁盘加密（Disk encryption，可选）
- 选 `Encryption` 可对整个磁盘/分区启用 **LUKS** 加密；
- 设置后会要求输入加密密码，开机需解锁；
- 不加密则直接回车跳过（笔记本建议加密以防丢失）。
### 6.6 启动引导（Bootloader）
- **UEFI**：默认 `Systemd-boot`，也可选 `GRUB`、`Limine`；
- **BIOS**：只能用 `GRUB` 或 `Limine`（systemd-boot 不支持 BIOS）。
引导器一般保持默认即可。
### 6.7 主机名（Hostname）
给机器起个名字，如 `archlinux`、`my-pc`。默认 `archinstall`。
### 6.8 root 密码（Root password）
设置 root 管理员密码。也可留空（此时必须在下一步创建带 sudo 的普通用户，否则无法提权）。
### 6.9 用户与密码（User account）
创建普通用户：
- 输入用户名、密码；
- 勾选 `Grant this user sudo privileges`（赋予 sudo 权限）——日常操作建议用普通用户 + sudo，而非直接用 root。
> 规则：若 root 密码留空，**必须**至少创建一个具备 sudo 权限的普通用户。
### 6.10 显卡驱动（Graphics driver，可选）
按你的显卡选择：
- `All open-source`（通用开源驱动，含 Intel/AMD）；
- `NVIDIA (proprietary)`（闭源 N 卡驱动）；
- `NVIDIA (open kernel)`（新版开源内核模块）；
- `AMD / ATI`、`Intel` 等。
无独立显卡的笔记本一般选 `All open-source` 即可。
### 6.11 桌面环境 / 配置模板（Profile）
这是「装完能不能直接用」的关键：
- **Desktop**（桌面环境）：可选 `KDE Plasma`、`GNOME`、`Xfce`、`Cinnamon`、`Hyprland` 等；
- **Minimal**（最小）；
- **Server**、**Xorg`、`Wayland` 等专项模板。
选 `Desktop` 后会再让你挑具体桌面 + 显示协议（X11/Wayland）。**新手强烈建议选一个桌面环境**，否则装完只有命令行。
### 6.12 音频服务（Audio，可选）
- `PipeWire`（现代默认，推荐）；
- `PulseAudio`（传统）。
桌面用户选 PipeWire 即可。
### 6.13 内核（Kernel）
默认 `linux`（最新稳定版）。也可追加 `linux-lts`（长期支持版，更稳）、`linux-zen`（性能向）、`linux-hardened`（安全向）。可多选，建议至少保留 `linux`。
### 6.14 网络配置（Network configuration，可选）
- 选 `NetworkManager`（桌面用户推荐，带图形接管）；
- 或 `systemd-networkd` + `iwd`（轻量无图形）；
- 服务器常用 `systemd-networkd`。
### 6.15 时区（Timezone）
设为 `Asia/Shanghai`（中国用户），安装器会自动配置。
### 6.16 额外软件包（Additional packages，可选）
可填要额外安装的包名（空格分隔），例如 `git vim firefox`。也可装完再 `pacman -S` 安装。
### 6.17 平行下载数 / NTP 等
- `Parallel downloads`：建议设 `5~10` 加速下载；
- `NTP`：默认开启，保持系统时间同步。
---
## 7. 确认并开始安装
所有项填好后，菜单会出现 **`Install`**（或 `Save & Install`）选项。回车前最后确认一遍配置摘要。
> 安装器会再次提醒：磁盘将被写入。确认无误后回车，正式开始。
安装过程会自动：
1. 分区 / 格式化磁盘；
2. 解压基础系统、安装内核与引导；
3. 写入用户、网络、桌面、驱动等配置；
4. 进度条跑完，提示 `Installation succeeded`（或类似成功信息）。
**不要中途断电或强制退出。** 视网速与硬件，通常几分钟到十几分钟。
---
## 8. 安装后首次启动
安装成功后：
```bash
reboot
```
- 取出或忽略 U 盘（确保从硬盘启动）；
- 看到 GRUB / systemd-boot 菜单 → 选择 `Arch Linux`；
- 进入登录界面（若装了桌面）或命令行登录提示。
用之前创建的普通用户 + 密码登录。若装的是纯命令行，用 `用户名` 登录后 `sudo -i` 可切 root。
> 若启用过磁盘加密，开机需先输入 LUKS 密码解锁。
---
## 9. 常用后续配置
刚装好的 Arch 很「素」，下面几步让它能日常使用：
### 更新系统
```bash
sudo pacman -Syu
```
### 启用网络（若装了 NetworkManager）
```bash
sudo systemctl enable --now NetworkManager
# 图形桌面里点托盘网络图标连 Wi-Fi；命令行：
nmcli device wifi list
nmcli device wifi connect "SSID" password "密码"
```
### 安装 AUR 助手（可选）
```bash
sudo pacman -S --needed base-devel git
git clone https://aur.archlinux.org/yay.git
cd yay && makepkg -si
```
### 安装常用软件
```bash
sudo pacman -S firefox chromium code noto-fonts-cjk  # 浏览器、编辑器、中文字体
```
### 中文本地化（如需要）
编辑 `/etc/locale.gen`，取消 `zh_CN.UTF-8 UTF-8` 注释，然后：
```bash
sudo locale-gen
sudo localectl set-locale LANG=zh_CN.UTF-8
```
---
## 10. 无人值守 / 脚本化安装
如果你要批量装机或重复安装，可以用配置文件跳过交互：
```bash
archinstall --config config.json          # 本地配置
archinstall --config-url https://x/config.json   # 远程配置
```
配置示例（节选，完整字段见[官方 `--config` 说明](https://archinstall.archlinux.page/installing/guided.html#config-options)）：
```json
{
  "hostname": "archlinux",
  "kernels": ["linux"],
  "bootloader": "Systemd-boot",
  "disk_config": { "config_type": "manual_partitioning", "...": "..." },
  "locale_config": { "kb_layout": "us", "sys_lang": "en_US" },
  "timezone": "Asia/Shanghai",
  "profile_config": { "profile": "Desktop", "gfx_driver": "All open-source" },
  "users": [{ "username": "alice", "password": "...", "sudo": true }]
}
```
敏感信息（密码）可放单独的 `--creds` 文件：
```json
{ "root_enc_password": "你的root密码" }
```
> 想快速生成一份配置模板，可运行 `archinstall --dry-run`：它在**安全模式**下模拟安装并把配置存到磁盘，不真正写盘。
---
## 11. 常见问题与排错
**Q：运行 `archinstall` 提示找不到命令 / 依赖缺失？**
A：确认是从**官方 Arch ISO** 启动，而不是其他发行版的 Live 盘。官方 ISO 自带 `archinstall`。
**Q：Wi‑Fi 连不上？**
A：安装器不代连网络。先用 `iwctl` 连好（见第 4 节），再启动 `archinstall`。
**Q：时间不对导致签名校验失败（"invalid or corrupted package"）？**
A：`timedatectl set-ntp true` 后重试，确保时间已同步。
**Q：装完开机直接进入命令行，没有桌面？**
A：说明第 6.11 步没选桌面 Profile。可重启进系统后用 `sudo pacman -S plasma` 等手动安装，或重装时选 Desktop。
**Q：UEFI 启动但只看到 BIOS 选项 / 反过来？**
A：检查第 4 节「启动模式」结果。UEFI 需要 EFI 系统分区（FAT32，挂载 `/efi` 或 `/boot`），引导器选 systemd-boot/GRUB；BIOS 只能选 GRUB/Limine。
**Q：磁盘被整盘清空了？**
A：第 6.4 步若选了 "Wipe all"，会抹掉整盘。重要数据请提前备份，或改用 Manual partitioning 仅动目标分区。
**Q：开机卡在解密 / 引导失败？**
A：确认 BIOS 中关闭了「Secure Boot」（或改用支持 Secure Boot 的 GRUB/UKI 方案）；加密盘需输入正确 LUKS 密码。
---
## 参考与延伸阅读
- 官方引导安装文档：<https://archinstall.archlinux.page/installing/guided.html>
- Arch Wiki（安装）：<https://wiki.archlinux.org/title/Installation_guide>
- Arch Wiki（archinstall）：<https://wiki.archlinux.org/title/Archinstall>
- 网络配置：<https://wiki.archlinux.org/title/Network_configuration>
---
*祝安装顺利。Arch 的乐趣在于「自己掌控每一个细节」，archinstall 只是帮你把地基打稳。*