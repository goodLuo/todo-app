# Android 打包指南

## 方式一：GitHub Actions 云端打包（推荐）

无需安装任何开发工具，全程在云端完成！

### 快速开始

#### 1. 创建 GitHub 仓库

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 关联 GitHub 仓库
git remote add origin https://github.com/你的用户名/todo-app.git
git branch -M main
git push -u origin main
```

#### 2. 触发构建

推送代码后，GitHub Actions 会自动开始构建。

或者手动触发：
1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 选择 **Build Android APK** 工作流
4. 点击 **Run workflow** 按钮

#### 3. 下载 APK

1. 等待构建完成（约 3-5 分钟）
2. 点击完成的工作流运行记录
3. 在 **Artifacts** 部分下载 `app-debug.apk`

---

### 构建 Release 签名版本

发布到应用商店需要签名的 APK。

#### 1. 生成签名密钥

在本地电脑运行（需要安装 JDK）：

```bash
keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

按提示输入：
- 密钥库密码 (KEYSTORE_PASSWORD)
- 密钥别名 (KEY_ALIAS): my-key-alias
- 密钥密码 (KEY_PASSWORD)
- 姓名、组织等信息

**⚠️ 重要：妥善保管此密钥文件和密码！丢失后无法更新应用！**

#### 2. 配置 GitHub Secrets

1. 打开 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 添加以下 Secrets：

| Secret 名称 | 值 |
|------------|-----|
| `KEYSTORE_BASE64` | 密钥文件的 Base64 编码（见下方） |
| `KEYSTORE_PASSWORD` | 密钥库密码 |
| `KEY_ALIAS` | 密钥别名，如 `my-key-alias` |
| `KEY_PASSWORD` | 密钥密码 |

**生成 KEYSTORE_BASE64：**

```bash
# macOS/Linux
base64 -i release-key.jks | pbcopy

# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("release-key.jks")) | Set-Clipboard
```

#### 3. 触发 Release 构建

1. 进入 **Actions** → **Build Android APK**
2. 点击 **Run workflow**
3. 选择 `main` 分支
4. 点击绿色的 **Run workflow** 按钮
5. 等待完成后下载 `app-release.apk`

---

## 方式二：本地打包

需要安装 Android Studio 和相关工具。

### 环境准备

#### 1. 安装必要工具

- [Android Studio](https://developer.android.com/studio) 
- JDK 17+

#### 2. 配置环境变量

**Windows:**
```bash
JAVA_HOME=C:\Program Files\Java\jdk-17
ANDROID_HOME=C:\Users\你的用户名\AppData\Local\Android\Sdk
```

**macOS/Linux:**
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 打包步骤

```bash
# 1. 安装 Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
npm install @capacitor/app @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen @capacitor/local-notifications

# 2. 初始化 Capacitor
npx cap init "待办清单" "com.todoapp.checklist" --web-dir dist

# 3. 添加 Android 平台
npx cap add android

# 4. 构建 Web 项目
npm run build

# 5. 同步到 Android
npx cap sync android

# 6. 打开 Android Studio
npx cap open android

# 在 Android Studio 中：
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

---

## 自定义应用信息

### 修改应用 ID 和名称

编辑 `capacitor.config.ts`：

```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.yourapp',  // 修改为你的应用 ID
  appName: '你的应用名',              // 修改为你的应用名
  // ...
};
```

### 修改版本号

构建后，编辑 `android/app/build.gradle`：

```gradle
android {
    defaultConfig {
        versionCode 1        // 每次更新递增
        versionName "1.0.0"  // 显示给用户的版本
    }
}
```

---

## 应用图标

### 方法 1：使用在线工具

1. 准备一张 1024x1024 的 PNG 图标
2. 访问 [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
3. 上传图标，下载生成的 zip
4. 解压到 `android/app/src/main/res/` 目录

### 方法 2：使用 capacitor-assets

```bash
# 安装工具
npm install -D @capacitor/assets

# 准备图标文件
# resources/icon.png (1024x1024)
# resources/splash.png (2732x2732)

# 生成所有尺寸
npx capacitor-assets generate
```

### 通知小图标

通知栏图标需要是**白色+透明背景**的 PNG：

| 目录 | 尺寸 |
|------|------|
| `drawable-mdpi` | 24x24 |
| `drawable-hdpi` | 36x36 |
| `drawable-xhdpi` | 48x48 |
| `drawable-xxhdpi` | 72x72 |
| `drawable-xxxhdpi` | 96x96 |

文件名：`ic_stat_icon.png`

---

## 常见问题

### Q: 构建失败 "SDK location not found"

创建 `android/local.properties`：
```properties
sdk.dir=/Users/你的用户名/Library/Android/sdk
```

### Q: Gradle 下载慢

编辑 `android/build.gradle`，添加国内镜像：
```gradle
repositories {
    maven { url 'https://maven.aliyun.com/repository/google' }
    maven { url 'https://maven.aliyun.com/repository/central' }
    google()
    mavenCentral()
}
```

### Q: APK 安装失败

检查是否开启了"允许安装未知来源应用"。

### Q: 应用闪退

1. 连接设备，运行 `adb logcat` 查看日志
2. 检查 Android 版本是否 >= 8.0
3. 确保所有权限已授予

### Q: 深色模式不跟随系统

在 `android/app/src/main/res/values/styles.xml` 添加：
```xml
<item name="android:forceDarkAllowed">false</item>
```

---

## 发布到应用商店

### Google Play Store

1. 注册 [Google Play 开发者账号](https://play.google.com/console) ($25 一次性)
2. 创建应用
3. 上传签名的 APK 或 AAB
4. 填写商店信息、截图
5. 提交审核（通常 1-3 天）

### 国内应用商店

| 平台 | 注册链接 | 需要软著 |
|------|---------|---------|
| 华为 | [AppGallery Connect](https://developer.huawei.com/consumer/cn/appgallery) | 推荐 |
| 小米 | [小米开放平台](https://dev.mi.com/) | 需要 |
| OPPO | [OPPO 开放平台](https://open.oppomobile.com/) | 需要 |
| vivo | [vivo 开放平台](https://dev.vivo.com.cn/) | 需要 |
| 应用宝 | [腾讯开放平台](https://open.qq.com/) | 需要 |

**软著申请：** 可以通过代理机构申请，费用约 300-500 元，周期 1-2 个月。

---

## 更新应用

```bash
# 1. 修改代码后重新构建
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. 递增版本号 (android/app/build.gradle)
# versionCode 2
# versionName "1.0.1"

# 4. 重新打包
# 推送到 GitHub 触发 Actions，或本地打包
```
