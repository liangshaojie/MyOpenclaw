#!/usr/bin/env node

/**
 * 美国天气检查定时任务 (简化版本)
 * 每隔一小时检查一次美国主要城市的天气情况
 * 使用模拟数据，实际使用时可以替换为真实天气API
 */

const fs = require('fs');
const path = require('path');

// 美国主要城市列表
const US_CITIES = [
    'New York',
    'Los Angeles', 
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
    'Austin',
    'Jacksonville',
    'Fort Worth',
    'Columbus',
    'San Francisco',
    'Charlotte',
    'Indianapolis',
    'Seattle',
    'Denver',
    'Washington DC'
];

// 模拟天气数据（实际使用时替换为真实API调用）
function getSimulatedWeather(city) {
    const weatherConditions = [
        '☀️ 晴朗',
        '⛅ 多云', 
        '☁️ 阴天',
        '🌧️ 小雨',
        '⛈️ 雷阵雨',
        '🌨️ 小雪',
        '🌫️ 雾霾'
    ];
    
    const temperatures = [15, 18, 22, 25, 28, 30, 32, 35, 38, 40];
    const windSpeeds = ['微风', '3级', '4级', '5级'];
    const humidityLevels = ['45%', '52%', '68%', '75%', '82%'];
    
    return {
        city: city,
        condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temperature: temperatures[Math.floor(Math.random() * temperatures.length)] + '°C',
        feelsLike: temperatures[Math.floor(Math.random() * temperatures.length)] + '°C',
        wind: windSpeeds[Math.floor(Math.random() * windSpeeds.length)],
        humidity: humidityLevels[Math.floor(Math.random() * humidityLevels.length)],
        precipitation: Math.random() > 0.7 ? '10%' : '0%'
    };
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
    console.log(`=` .repeat(60));
    
    let weatherReport = `🌍 **美国天气报告** - ${timestamp}\n\n`;
    
    // 获取所有城市的天气数据
    const weatherData = US_CITIES.map(city => getSimulatedWeather(city));
    
    weatherData.forEach(data => {
        const weatherLine = `🌤️ ${data.city}: ${data.condition}, 温度 ${data.temperature} (体感 ${data.feelsLike}), ${data.wind}风, 湿度${data.humidity}, 降水概率${data.precipitation}`;
        console.log(weatherLine);
        weatherReport += `${weatherLine}\n`;
    });
    
    // 添加统计信息
    const avgTemp = weatherData.reduce((sum, data) => {
        return sum + parseInt(data.temperature);
    }, 0) / weatherData.length;
    
    const rainyCities = weatherData.filter(data => data.precipitation !== '0%').length;
    
    weatherReport += `\n📊 **统计信息**\n`;
    weatherReport += `• 平均温度: ${avgTemp.toFixed(1)}°C\n`;
    weatherReport += `• 降水城市数: ${rainyCities}/${weatherData.length}\n`;
    weatherReport += `• 检查城市数: ${weatherData.length}个\n\n`;
    
    weatherReport += `📊 **数据来源**: 模拟数据 (实际使用时替换为真实API)\n`;
    weatherReport += `⏰ **更新频率**: 每小时一次\n`;
    weatherReport += `🌐 **检查时间**: 北京时间 ${timestamp}`;
    
    console.log(`\n✅ 天气检查完成`);
    console.log(`📈 平均温度: ${avgTemp.toFixed(1)}°C`);
    console.log(`🌧️ 降水城市: ${rainyCities}个`);
    
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

// 发送天气报告（这里可以集成发送消息的逻辑）
function sendWeatherReport(report) {
    console.log('💡 天气报告准备发送...');
    console.log('📤 可以通过message工具发送给用户');
    
    // 返回报告内容，供后续发送使用
    return report;
}

// 主函数
async function main() {
    try {
        console.log('🌍 开始美国天气检查...');
        
        const weatherReport = await getAllCitiesWeather();
        const reportPath = saveWeatherReport(weatherReport);
        const reportToSend = sendWeatherReport(weatherReport);
        
        console.log('✅ 天气检查任务完成');
        console.log('📤 天气报告已准备就绪，可以发送给用户');
        
        // 返回天气报告内容
        return reportToSend;
        
    } catch (error) {
        console.error('❌ 天气检查任务失败:', error);
        
        // 记录错误
        const errorLog = path.join(process.cwd(), 'weather-reports', 'error.log');
        const errorMessage = `[${new Date().toISOString()}] 天气检查错误: ${error.message}\n`;
        
        fs.appendFileSync(errorLog, errorMessage);
        throw error;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().then(report => {
        console.log('\n📋 完整天气报告:');
        console.log(report);
    }).catch(error => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
}

module.exports = { getSimulatedWeather, getAllCitiesWeather, saveWeatherReport, main };