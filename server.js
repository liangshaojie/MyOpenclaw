const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    // 解析URL
    const parsedUrl = url.parse(req.url);
    let filePath = parsedUrl.pathname;
    
    // 如果请求根路径，返回index.html
    if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
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
                console.log(`File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
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
                            }
                            h1 {
                                font-size: 4rem;
                                margin-bottom: 1rem;
                            }
                            p {
                                font-size: 1.2rem;
                                opacity: 0.9;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>404</h1>
                            <p>页面未找到</p>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // 服务器错误
                console.error(`Server error: ${err.code}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>服务器内部错误</h1>');
            }
        } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Todo App 服务器运行在端口 ${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
    console.log(`外部访问地址: https://supreme-engine-wrqvw49jqpp2v6xw-18789.app.github.dev/`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});