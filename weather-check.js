#!/usr/bin/env node

/**
 * 美国天气检查定时任务
 * 每隔一小时检查一次美国主要城市的天气情况
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 美国主要城市列表
const US_CITIES = [
    'New+York',
    'Los+Angeles', 
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San+Antonio',
    'San+Diego',
    'Dallas',
    'San+Jose',
    'Austin',
    'Jacksonville',
    'Fort+Worth',
    'Columbus',
    'San+Francisco',
    'Charlotte',
    'Indianapolis',
    'Seattle',
    'Denver',
    'Washington+DC'
];

// 获取单个城市天气
function getWeatherForCity(city) {
    return new Promise((resolve, reject) => {
        // 使用wttr.in API获取天气信息
        const command = `curl -s "wttr.in/${city}?format=%l:+%c+%t+(feels+like+%f),+%w+wind,+%h+humidity,+%p+precipitation"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error fetching weather for ${city}:`, error);
                resolve(`❌ ${city}: 天气数据获取失败`);
                return;
            }
            
            if (stderr) {
                console.error(`Stderr for ${city}:`, stderr);
                resolve(`❌ ${city}: 天气数据获取错误`);
                return;
            }
            
            const weatherData = stdout.trim();
            if (weatherData && !weatherData.includes('Unknown location')) {
                resolve(`🌤️ ${weatherData}`);
            } else {
                resolve(`❌ ${city}: 未知地点`);
            }
        });
    });
}

// 获取所有城市天气
async function getAllCitiesWeather() {
    const timestamp = new Date().toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    console.log(`\n🌍 美国天气检查 - ${timestamp}`);
    console.log(`=` .repeat(50));
    
    let weatherReport = `🌍 **美国天气报告** - ${timestamp}\n\n`;
    
    // 分批获取天气信息，避免请求过于频繁
    const batchSize = 5;
    for (let i = 0; i < US_CITIES.length; i += batchSize) {
        const batch = US_CITIES.slice(i, i + batchSize);
        const promises = batch.map(city => getWeatherForCity(city));
        const results = await Promise.all(promises);
        
        results.forEach(result => {
            console.log(result);
            weatherReport += `${result}\n`;
        });
        
        // 每批次之间稍作延迟
        if (i + batchSize < US_CITIES.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    weatherReport += `\n📊 **数据来源**: wttr.in\n`;
    weatherReport += `⏰ **更新频率**: 每小时一次\n`;
    weatherReport += `🌐 **检查时间**: 北京时间 ${timestamp}`;
    
    console.log(`\n✅ 天气检查完成`);
    return weatherReport;
}

// 保存天气报告到文件
function saveWeatherReport(report) {
    const reportsDir = path.join(process.cwd(), 'weather-reports');
    
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `weather-report-${today}.md`;
    const filepath = path.join(reportsDir, filename);
    
    // 如果文件已存在，追加内容
    if (fs.existsSync(filepath)) {
        fs.appendFileSync(filepath, `\n---\n${report}\n`);
    } else {
        fs.writeFileSync(filepath, `# 美国天气报告\n\n${report}\n`);
    }
    
    console.log(`📄 天气报告已保存到: ${filepath}`);
    return filepath;
}

// 主函数
async function main() {
    try {
        console.log('🌍 开始美国天气检查...');
        
        const weatherReport = await getAllCitiesWeather();
        const reportPath = saveWeatherReport(weatherReport);
        
        console.log('✅ 天气检查任务完成');
        
        // 这里可以添加发送消息的逻辑
        // 例如通过message工具发送给用户
        console.log('💡 可以将天气报告发送给用户了');
        
    } catch (error) {
        console.error('❌ 天气检查任务失败:', error);
        
        // 记录错误
        const errorLog = path.join(process.cwd(), 'weather-reports', 'error.log');
        const errorMessage = `[${new Date().toISOString()}] 天气检查错误: ${error.message}\n`;
        
        fs.appendFileSync(errorLog, errorMessage);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { getWeatherForCity, getAllCitiesWeather, saveWeatherReport };