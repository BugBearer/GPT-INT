import * as vscode from 'vscode';
import axios from 'axios'; // make sure to run 'npm install axios' to add this package
import * as path from 'path';
import * as fs from 'fs';



let extensionSettings = {
    apiBaseUrl: 'https://api.kwwai.top/v1', // Default value
    apiKey: '19MiENiYc4g3953D4D2B075412b9a214b7f4f0f9a64',
    //apiKey: 'sk-E5oks19MiENiYc4g3953D4D2B075412b9a214b7f4f0f9a64',         // Default value, replace with your actual default API key
    model: 'gpt-4-1106-preview'             // Default value
};
  
type Message = {
    role: 'user' | 'assistant';
    content: string;
};
let panel: vscode.WebviewPanel ; 
let GlobalconversationHistory: Message[] = []; // Global conversation history

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "my-gpt-extension" is now active!');
        // 当插件激活时，关闭所有之前可能打开的Webview Panels
        if (panel) {
            panel.dispose();
        }
    let disposable1 = vscode.commands.registerCommand('gptint.interactWithGPT', async () => {
        // Send a request and get the model's reply

        type Message = {
            role: 'user' | 'assistant';
            content: string;
        };

        const conversationHistory: Message[] = [
            // ... your conversation history, e.g.:
            { role: 'user', content: 'Hello, who are you?' }
            // Add other messages as needed
        ];
        
        try {
            const response = await axios.post(`${extensionSettings.apiBaseUrl}/chat/completions`, {
                model: extensionSettings.model,
                messages: conversationHistory,
            }, {
                headers: {
                    'Authorization': `Bearer ${extensionSettings.apiKey}`
                }
            });

            const message = response.data.choices[0].message.content;
            vscode.window.showInformationMessage(message);
        } catch (error) {
            console.error("Error interacting with custom GPT API: ", error);
            vscode.window.showErrorMessage("Error interacting with custom GPT API.");
        }
    });
    
    let showText = async (text: string) => {
        // 创建一个未保存的新文件来显示文本
        const document = await vscode.workspace.openTextDocument({
        content: text, // 文档的内容设置为读取到的文本
        language: "plaintext" // 你可以根据内容调整语言，例如 'typescript', 'python' 等
        });
        vscode.window.showTextDocument(document);
    };
    let disposable2 = vscode.commands.registerCommand('gptint.captureCode', async () => {
        // 获取当前编辑器的文本内容
        let editor = vscode.window.activeTextEditor;
        if (editor) {
            // 获取编辑器中的文档
            let document = editor.document;
            // 读取文档的全部文本
            let text = document.getText();

            // 在此处处理文本，比如发送给 GPT 模型或其他操作
            await showText(text);
        } else {
            vscode.window.showInformationMessage('No active editor.');
        }
    });
    let disposable3 = vscode.commands.registerCommand('gptint.showGptPanel', () => {
        panel = vscode.window.createWebviewPanel(
            'gptPanel',
            'GPT Suggestions',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true // Allow the Webview to run scripts
            }
        );

        panel.webview.html = getWebviewContent(context);

        // 当前活动编辑器的文本内容
        let currentText = '';

        // 更新当前文本的函数
        function updateCurrentText() {
            const editor = vscode.window.activeTextEditor;
            currentText = editor ? editor.document.getText() : '';
        }
        
        // 立即更新当前文本，以防激活时编辑器已经打开
        updateCurrentText();
        
        // 监听编辑器内容变化
        context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
            if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
                updateCurrentText();
            }
        })); 
        
        //监听编辑器选择变化也是很重要的，因为用户可能会在不同的文件间切换
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
            updateCurrentText();
        }));


        // Handle messages from the Webview
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'getGPTSuggestion') {
                // 获取当前编辑器的文本
                updateCurrentText();
                // 如果当前文本为空，则发送一条消息告诉用户需要输入内容
                if (!currentText.trim()) {
                    panel.webview.postMessage({
                        command: 'displayMessage',
                        role: 'assistant',
                        content:  "It seems like you haven't entered any code. Please type your code in the editor and then click 'Get GPT Suggestions'." 
                    });
                    return;
                }
                //const conversationHistory = [
                    // ... your conversation history, e.g.:
                //    { role: 'user', content: currentText }
                //];
                // 将用户消息立即显示在 Webview 中
                panel.webview.postMessage({
                    command: 'displayMessage',
                    role: 'user',
                    content: currentText
                });
                GlobalconversationHistory.push({ role: 'user', content: currentText });

                try {
                    // Send the text to the GPT model and wait for the response
                    const response = await axios.post(`${extensionSettings.apiBaseUrl}/chat/completions`, {
                        model: extensionSettings.model,
                        messages: GlobalconversationHistory,
                    }, {
                        headers: {
                            'Authorization': `Bearer ${extensionSettings.apiKey}`
                        }
                    });

                    // Append the GPT's response to the history
                    const gptResponse = response.data.choices[0].message.content;
                    GlobalconversationHistory.push({ role: 'assistant', content: gptResponse });

                    // Post the gpt response back to the Webview
                    panel.webview.postMessage({
                        command: 'displayMessage',
                        role:'assistant',
                        content: gptResponse //
                    });
                } catch (error) {
                    console.error("Error fetching GPT suggestion: ", error);
                    panel.webview.postMessage({ 
                        command: 'displayMessage', 
                        role:'assistant',
                        content: 'Error fetching GPT suggestion.'
                    });
                }
            }
            else if (message.command === 'saveSettings'){
                // 保存设置信息
                extensionSettings.apiBaseUrl = message.settings.apiBaseUrl;
                extensionSettings.apiKey = message.settings.apiKey;
                extensionSettings.model = message.settings.model;
                vscode.window.showInformationMessage('Settings updated successfully.');
            }
            else if (message.command === 'sendMessageToGPT'){
                // 将用户消息立即显示在 Webview 中
                panel.webview.postMessage({
                    command: 'displayMessage',
                    role: 'user',
                    content: message.text
                });
                // 添加用户消息到全局对话历史中
                GlobalconversationHistory.push({ role: 'user', content: message.text });

                try {
                    // 调用 GPT 接口
                    const response = await axios.post(`${extensionSettings.apiBaseUrl}/chat/completions`, {
                        model: extensionSettings.model,
                        messages: GlobalconversationHistory,
                    }, {
                        headers: {
                            'Authorization': `Bearer ${extensionSettings.apiKey}`
                        }
                    });

                    // 添加 GPT 的响应到全局对话历史中
                    const gptResponse = response.data.choices[0].message.content;
                    GlobalconversationHistory.push({ role: 'assistant', content: gptResponse });

                    // 将GPT响应发送回 Webview
                    panel.webview.postMessage({
                        command: 'displayMessage',
                        role:'assistant',
                        content: gptResponse
                    });
                } catch (error) {
                    console.error("Error fetching GPT suggestion: ", error);
                    panel.webview.postMessage({ 
                        command: 'displayMessage', 
                        role:'assistant',
                        content: 'Error fetching GPT suggestion.'
                    });
                }
            }
        }, undefined, context.subscriptions);
    });


    context.subscriptions.push(disposable1, disposable2, disposable3);
}

// Define the getWebviewContent function to return the HTML content for the Webview
function getWebviewContent(context: vscode.ExtensionContext) {
    // Construct the path to the HTML file within the extension's directory
    const webviewHtmlPath = path.join(context.extensionPath, 'src', 'webview', 'webviewContent.html');
    
    // Read the file content and return it as a string
    const htmlContent = fs.readFileSync(webviewHtmlPath, 'utf8');
    return htmlContent;
}


export function deactivate() {
    if (panel) {
        panel.dispose();
    }
    console.log('Your extension "my-gpt-extension" is now deactive!');
    // 你的停用代码...
}
