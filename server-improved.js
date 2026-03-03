#!/usr/bin/env node

/**
 * Todo App 服务器 - 改进版本
 * 优化GitHub Codespace部署和端口配置
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // 监听所有接口，便于Codespace端口转发

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8'
};

console.log(`🚀 Todo App 服务器启动中...`);
console.log(`📍 工作目录: ${process.cwd()}`);
console.log(`🌐 监听地址: ${HOST}:${PORT}`);

const server = http.createServer((req, res) => {
    // 解决CORS问题
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 解析URL
    const parsedUrl = url.parse(req.url);
    let filePath = parsedUrl.pathname;
    
    // 日志记录
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${filePath}`);
    
    // 如果请求根路径，返回index.html
    if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
    }
    
    // 安全检查，防止目录遍历攻击
    if (filePath.includes('..')) {
        console.log(`⚠️ 安全警告: 检测到潜在的目录遍历攻击: ${filePath}`);
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>403 - 禁止访问</title>
                <style>
                    body {
                        font-family: 'Inter', sans-serif;
                        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0;
                        color: white;
                    }
                    .container {
                        text-align: center;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 3rem;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                        max-width: 600px;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.1rem;
                        opacity: 0.9;
                        line-height: 1.6;
                    }
                    .code {
                        background: rgba(0, 0, 0, 0.2);
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        font-family: monospace;
                        margin: 1rem 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>403</h1>
                    <p><strong>禁止访问</strong></p>
                    <p>检测到潜在的安全威胁，访问被拒绝。</p>
                    <p class="code">${filePath}</p>
                    <p>请检查URL是否正确。</p>
                </div>
            </body>
            </html>
        `);
        return;
    }
    
    // 构建完整的文件路径
    filePath = path.join(__dirname, 'todo-app', filePath);
    
    // 获取文件扩展名
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                console.log(`❌ 文件未找到: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>404 - 页面未找到</title>
                        <style>
                            body {
                                font-family: 'Inter', sans-serif;
                                background: linear-gradient(135deg, #10b981 0%, #f59e0b 100%);
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 0;
                                color: white;
                            }
                            .container {
                                text-align: center;
                                background: rgba(255, 255, 255, 0.1);
                                padding: 3rem;
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                                max-width: 600px;
                            }
                            h1 {
                                font-size: 4rem;
                                margin-bottom: 1rem;
                            }
                            p {
                                font-size: 1.2rem;
                                opacity: 0.9;
                                line-height: 1.6;
                            }
                            .path {
                                background: rgba(0, 0, 0, 0.2);
                                padding: 0.5rem 1rem;
                                border-radius: 8px;
                                font-family: monospace;
                                margin: 1rem 0;
                                word-break: break-all;
                            }
                            .back-btn {
                                display: inline-block;
                                background: rgba(255, 255, 255, 0.2);
                                color: white;
                                text-decoration: none;
                                padding: 0.75rem 1.5rem;
                                border-radius: 10px;
                                margin-top: 1rem;
                                transition: all 0.3s ease;
                            }
                            .back-btn:hover {
                                background: rgba(255, 255, 255, 0.3);
                                transform: translateY(-2px);
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>404</h1>
                            <p><strong>页面未找到</strong></p>
                            <p>请求的资源不存在，请检查URL是否正确。</p>
                            <div class="path">${filePath}</div>
                            <a href="/" class="back-btn">返回首页</a>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // 服务器错误
                console.error(`❌ 服务器错误: ${err.code}`);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>500 - 服务器内部错误</title>
                        <style>
                            body {
                                font-family: 'Inter', sans-serif;
                                background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin: 0;
                                color: white;
                            }
                            .container {
                                text-align: center;
                                background: rgba(255, 255, 255, 0.1);
                                padding: 3rem;
                                border-radius: 20px;
                                backdrop-filter: blur(10px);
                                max-width: 600px;
                            }
                            h1 {
                                font-size: 4rem;
                                margin-bottom: 1rem;
                            }
                            p {
                                font-size: 1.2rem;
                                opacity: 0.9;
                                line-height: 1.6;
                            }
                            .error {
                                background: rgba(0, 0, 0, 0.2);
                                padding: 1rem;
                                border-radius: 8px;
                                font-family: monospace;
                                margin: 1rem 0;
                                text-align: left;
                                font-size: 0.9rem;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>500</h1>
                            <p><strong>服务器内部错误</strong></p>
                            <p>服务器遇到了一个错误，无法完成您的请求。</p>
                            <div class="error">错误代码: ${err.code}<br>错误信息: ${err.message}</div>
                            <p>请稍后重试，或联系管理员。</p>
                        </div>
                    </body>
                    </html>
                `);
            }
        } else {
            // 成功响应
            res.writeHead(200, { 
                'Content-Type': contentType,
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block'
            });
            res.end(content);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`✅ Todo App 服务器运行成功！`);
    console.log(`🌐 本地访问: http://localhost:${PORT}`);
    console.log(`🌐 Codespace访问: https://supreme-engine-wrqvw49jqpp2v6xw-18789.app.github.dev/`);
    console.log(`📱 移动端访问: https://supreme-engine-wrqvw49jqpp2v6xw-18789.app.github.dev/`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`🔧 监听配置: ${HOST}:${PORT}`);
    console.log(`💡 提示: 如果访问不了，请检查GitHub Codespace的端口转发配置`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('📡 收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📡 收到 SIGINT 信号，正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ 端口 ${PORT} 已被占用`);
        console.log(`💡 请尝试使用其他端口，或停止占用该端口的进程`);
    } else {
        console.error('❌ 服务器错误:', err);
    }
    process.exit(1);
});