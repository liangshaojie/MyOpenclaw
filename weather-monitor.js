#!/usr/bin/env node

/**
 * 天气监控定时任务服务
 * 每隔一小时检查一次美国天气情况并发送报告
 */

const weatherSender = require('./weather-sender');
const fs = require('fs');
const path = require('path');

class WeatherMonitor {
    constructor() {
        this.intervalTime = 60 * 60 * 1000; // 1小时
        this.isRunning = false;
        this.intervalId = null;
        this.startTime = new Date();
        
        // 创建日志目录
        this.logDir = path.join(process.cwd(), 'weather-logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // 处理优雅关闭
        process.on('SIGTERM', () => {
            this.log('收到 SIGTERM 信号，正在停止天气监控...');
            this.stop();
        });

        process.on('SIGINT', () => {
            this.log('收到 SIGINT 信号，正在停止天气监控...');
            this.stop();
        });
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        // 写入日志文件
        const logFile = path.join(this.logDir, 'weather-monitor.log');
        fs.appendFileSync(logFile, logMessage + '\n');
    }

    async checkWeather() {
        try {
            this.log('🌍 开始执行天气检查任务...');
            
            // 获取并发送天气报告
            const report = await weatherSender.sendWeatherReport();
            
            this.log('✅ 天气检查任务完成');
            
            // 在实际环境中，这里会通过message工具发送给用户
            // await this.sendToUser(report);
            
            return report;
            
        } catch (error) {
            this.log(`❌ 天气检查任务失败: ${error.message}`);
            
            // 记录错误
            const errorFile = path.join(this.logDir, 'errors.log');
            const errorMessage = `[${new Date().toISOString()}] 错误: ${error.stack}\n`;
            fs.appendFileSync(errorFile, errorMessage);
            
            throw error;
        }
    }

    async sendToUser(report) {
        try {
            // 这里会使用OpenClaw的message工具发送天气报告
            // 例如：message({ action: 'send', channel: 'telegram', message: report })
            
            this.log('📤 天气报告已发送给用户');
            
        } catch (error) {
            this.log(`❌ 发送天气报告失败: ${error.message}`);
            throw error;
        }
    }

    start() {
        if (this.isRunning) {
            this.log('⚠️ 天气监控服务已在运行中');
            return;
        }

        this.log('🚀 启动天气监控定时任务服务');
        this.log(`⏰ 检查间隔: ${this.intervalTime / 1000 / 60} 分钟`);
        this.log(`🕐 启动时间: ${this.startTime.toLocaleString('zh-CN')}`);

        this.isRunning = true;

        // 立即执行第一次检查
        this.checkWeather().catch(error => {
            this.log(`❌ 首次天气检查失败: ${error.message}`);
        });

        // 设置定时任务
        this.intervalId = setInterval(() => {
            this.checkWeather().catch(error => {
                this.log(`❌ 定时天气检查失败: ${error.message}`);
            });
        }, this.intervalTime);

        this.log('✅ 天气监控服务已启动，将每隔1小时执行一次检查');
        this.displayNextCheckTime();
    }

    stop() {
        if (!this.isRunning) {
            this.log('⚠️ 天气监控服务未在运行');
            return;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        const endTime = new Date();
        const runDuration = endTime - this.startTime;
        
        this.log('⏹️ 天气监控服务已停止');
        this.log(`📊 运行时长: ${Math.floor(runDuration / 1000)} 秒`);
        this.log(`⏹️ 停止时间: ${endTime.toLocaleString('zh-CN')}`);
        
        this.isRunning = false;
    }

    displayNextCheckTime() {
        if (!this.isRunning) return;
        
        const nextCheck = new Date(Date.now() + this.intervalTime);
        this.log(`🔄 下次检查时间: ${nextCheck.toLocaleString('zh-CN')}`);
    }

    getStatus() {
        const status = {
            isRunning: this.isRunning,
            startTime: this.startTime,
            intervalTime: this.intervalTime,
            nextCheckTime: this.isRunning ? new Date(Date.now() + this.intervalTime) : null,
            uptime: this.isRunning ? Date.now() - this.startTime : null
        };
        
        return status;
    }
}

// 主函数
async function main() {
    const monitor = new WeatherMonitor();
    
    // 显示启动信息
    console.log('='.repeat(60));
    console.log('🌍 美国天气监控定时任务服务');
    console.log('='.repeat(60));
    
    // 启动监控服务
    monitor.start();
    
    // 保持进程运行
    console.log('💡 按 Ctrl+C 停止服务');
    
    // 返回监控实例，用于外部控制
    return monitor;
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 天气监控服务启动失败:', error);
        process.exit(1);
    });
}

module.exports = WeatherMonitor;