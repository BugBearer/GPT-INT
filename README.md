<p align="center">
  <img src="/img/logo.jpg" alt="logo">
</p>

# <p align="center"><strong>GPT Int (GPT Interaction for VSCode)</strong><br></p>

## <p align="center">使用GPT Int插件可以提升你的编程体验。运行这个插件，你就可以让GPT来生成高质量代码🚀 ，又或者简化你的代码，解释复杂的代码，进行代码补全操作等，一切都不费吹灰之力🤖💻。</p>

<p align="center">
  <a href="README.md">简体中文</a> /
  <a href="readmex.md">English</a>
</p>

## 提前准备
VS Code

OpenAI APIKey
## 开始使用
1.下载插件，并安装。然后运行插件。

2.按ctrl+shift+p并输入命令"Show Panel"，便可打开与GPT的交互面板。

3.点击Setting按钮，完成设置，便可正常使用插件。

<p align="center">
  <img src="/img/setting.gif" alt="logo">
</p>

## 插件设置
* `gptint.apiBaseUrl`: GPT API的base URL(默认https://api.openai.com).
* `gptint.apiKey`: 你的OpenAI API key.
* `gptint.model`: 你想使用的模型(e.g., gpt-4-1106-preview).



⚠️由于对话每次都将历史消息一并发送，因此请留意API消耗。

## 插件功能
### 代码补全
只需要在VSCode编辑器里打出注释，在注释里描述你的需求，并点击"Get GPT Suggestion"按钮，GPT Int插件就会尽可能地满足你，帮你补全完整的代码。
### 代码解释
只需要选中你不懂的代码，并点击"Get GPT Suggestion"按钮，GPT就会解答你的疑惑，为你讲解代码的功能和逻辑等。
### 简化代码
插件支持与GPT进行长对话。如果你感觉已有的某些代码是冗余的，你可以在聊天框里告诉GPT，并点击"Send Message"按钮。GPT会竭尽所能地为你重构代码。
### 支持自定义Prompt
你可以提前设定一些Prompt，比如告诉GPT接下来只需要输出代码等Prompt。
### 更多功能
更多功能正在开发中🚀...如果你有更好的想法，请在Issues里联系作者。

## 已知问题
⚠️由于某些特殊原因，使用插件后记得关闭插件后再关闭VSCode，否则下次启动会遇到一些特殊问题。（问题待修复）

## 开发日志

### 1.0.0
初始版本刚刚上线，完成了一些基本功能，还有很多功能待开发
### 1.0.1
修复了一些由于VSCode的WebPage内存问题而导致的BUG。现在长轮次对话不会导致编辑器崩溃了。

## 额外事项

<<<<<<< HEAD
在网络被严格限制的情况下，你可能在VSCode中需要一些额外的配置才能正常使用插件。

例如：

```
proxies = {
    "http": "http://127.0.0.1:7890",
    "https": "http://127.0.0.1:7890",
}
#请替换为你的实际代理IP
```
