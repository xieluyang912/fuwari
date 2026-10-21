---
title: Archlinux qq 无法复制问题解决
published: 2026-10-21
description: '解决Archlinux qq无法复制的问题'
image: './cover.jpg'
tags: [Arch,linux]
category: 'linux'
draft: false
lang: ''
---

<div class="badge-row">

![Static Badge](https://img.shields.io/badge/%E7%B1%BB%E5%9E%8B-%E6%95%85%E9%9A%9C%E6%8E%92%E6%9F%A5-blue)
![Static Badge](https://img.shields.io/badge/%E5%B9%B3%E5%8F%B0-Arch%20Linux-1793d1?logo=archlinux&logoColor=white)
![Static Badge](https://img.shields.io/badge/%E6%A1%8C%E9%9D%A2-niri-7da1de)
![Static Badge](https://img.shields.io/badge/%E5%BA%94%E7%94%A8-Linux%20QQ-12B7F5?logo=qq&logoColor=white)
![Static Badge](https://img.shields.io/badge/%E6%96%B9%E6%A1%88-XWayland-orange)
![Static Badge](https://img.shields.io/badge/%E7%8A%B6%E6%80%81-%E5%B7%B2%E4%BF%AE%E5%A4%8D-green)

</div>

# Linux QQ 剪贴板无法复制粘贴修复指南（Arch + niri）

## 问题原因

你遇到的复制问题，核心原因是 **Linux QQ 的剪贴板功能仍然依赖 X11 实现**，而你的 niri 环境之前缺少 `DISPLAY` 变量，导致桥接工具无法工作。

下面是基于你当前 Arch + niri 环境的完整解决流程。

---

## 第一步：安装并配置 XWaylad 环境

> niri 从 **25.08** 版本开始原生集成 `xwayland-satellite`，只要安装它，niri 就会自动设置 `DISPLAY` 并按需启动。

### 1. 安装 xwayland-satellite

```
sudo pacman -S xwayland-satellite
```

### 2. 移除手动配置（如果之前加过）

如果你在 niri 配置里手动写过启动 `xwayland-satellite` 或设置 `DISPLAY` 的语句，需要**全部删掉**，否则会干扰自动集成。

### 3. 重启 niri 会话

完全注销当前 niri 会话，重新登录。

### 4. 验证 DISPLAY

重新登录后，在终端运行：

```bash
echo $DISPLAY
```

应输出类似 `:0` 的值。如果仍为空，运行 `linuxqq-wayland-fix --doctor` 复查，确认「DISPLAY 为空」那一项已变为通过。

---

## 第二步：使用 linuxqq-wayland-fix 启动 QQ

> `linuxqq-wayland-fix` 的剪贴板修复依赖 XWayland 来桥接 QQ 的 X11 剪贴板实现，所以**必须先完成第一步**。

### 1. 确保已安装

你之前已经通过 AUR 安装了 `linuxqq-wayland-fix-git`。如果没有，重新安装：

```bash
paru -S linuxqq-wayland-fix-git
```

### 2. 彻底退出旧版 QQ

确保系统托盘里的 QQ 图标也已完全退出。

### 3. 启动修复版

从应用菜单找到「**QQ（Wayland 修复版）**」并点击启动。**不要点原来的「QQ」图标。**

### 4. 验证

启动后测试复制粘贴。如果仍不正常，运行自检：

```bash
linuxqq-wayland-fix --doctor
```

确认所有关键项（尤其是 `DISPLAY` 和剪贴板修复）都已通过。

---

## 如果仍然无法复制：备选方案

如果完成以上两步后复制依然失效，说明 `linuxqq-wayland-fix` 的剪贴板桥接在你的 niri 环境下未能正常工作。可以改用下面两个工具之一。

### 备选方案一：xwayclip

`xwayclip` 是一个独立的**双向剪贴板同步工具**，专门为 QQ 这类混合协议应用设计，且已在 niri 上测试可用。

#### 1. 安装 xwayclip

```bash
cargo install xwayclip
```

> 需要系统已安装 Rust 工具链。如果没有，先执行 `sudo pacman -S rust`。

#### 2. 运行

保持它在后台运行，然后再启动 QQ：

```bash
xwayclip &
```

或者直接在终端前台运行 `xwayclip`，保持终端不关闭，再打开 QQ 测试复制。

### 备选方案二：qq-wayland-clipboard

另一个针对 Linux QQ 剪贴板问题的 wrapper。原理是用独立的 **Xvfb** 隔离 QQ 的 X11 剪贴板操作，再将内容转换到 Wayland 剪贴板。

#### 1. 安装（AUR）

```bash
yay -S qq-wayland-clipboard-git
```

> 需要系统中已有 `Xvfb` 命令：`sudo pacman -S xorg-server-xvfb`。

#### 2. 启动

先彻底退出 QQ，然后：

```bash
qq-wayland-clipboard /opt/QQ/qq
```

该命令会保持在前台运行，按 `Ctrl+C` 停止整个实例。

---

## 总结

1. **优先完成第一步**：安装 `xwayland-satellite` 并重启 niri，让 `DISPLAY` 正常可用；
2. 然后从菜单启动「QQ（Wayland 修复版）」；
3. 如果仍不行，在 **xwayclip** 和 **qq-wayland-clipboard** 之间选一个尝试。
