#!/usr/bin/env node

/**
 * 天气报告发送脚本
 * 获取美国天气并发送给用户
 */

const weatherCheck = require('./weather-check-simple');

async function sendWeatherReport() {
    try {
        console.log('🌍 开始获取并发送天气报告...');
        
        // 获取天气报告
        const weatherReport = await weatherCheck.main();
        
        // 将天气报告格式化为适合发送的格式
        const formattedReport = `
🌍 **美国天气报告**

${weatherReport.split('🌍 **美国天气报告**')[1] || weatherReport}
        `.trim();
        
        console.log('📤 天气报告已准备就绪');
        console.log('📋 报告内容预览:');
        console.log(formattedReport.substring(0, 500) + '...');
        
        // 在实际环境中，这里会调用message工具发送天气报告
        // 例如：message({ action: 'send', channel: 'telegram', message: formattedReport })
        
        return formattedReport;
        
    } catch (error) {
        console.error('❌ 发送天气报告失败:', error);
        
        const errorMessage = `❌ 天气报告获取失败: ${error.message}`;
        console.log(errorMessage);
        
        return errorMessage;
    }
}

// 主函数
async function main() {
    const report = await sendWeatherReport();
    console.log('\n✅ 天气报告发送任务完成');
    return report;
}

// 如果直接运行此脚本
if (require.main === module) {
    main().then(report => {
        console.log('\n📋 最终天气报告:');
        console.log(report);
    }).catch(error => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });
}

module.exports = { sendWeatherReport, main };