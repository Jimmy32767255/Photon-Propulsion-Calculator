// 常量定义
const SPEED_OF_LIGHT = 299792458; // 光速 (m/s)
const G_ACCELERATION = 9.80665; // 标准重力加速度 (m/s²)
const MACH_SPEED = 343; // 马赫1的速度 (m/s)，在海平面标准大气压下的声速

// 主题设置
const THEME_KEY = 'theme-preference';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

// 时间单位转换为秒
const TIME_UNITS = {
    's': 1,                // 秒
    'm': 60,               // 分钟
    'h': 3600,             // 小时
    'd': 86400,            // 天
    'w': 604800,           // 周
    'y': 31536000          // 地球年
};

// 速度单位转换系数（相对于m/s）
const SPEED_UNITS = {
    'm/s': 1,                // 米/秒
    'km/h': 0.2777778,       // 公里/小时 (1 km/h = 0.2777778 m/s)
    'mile/h': 0.44704,       // 英里/小时 (1 mile/h = 0.44704 m/s)
    'nmi/h': 0.5144444,      // 海里/小时 (1 nmi/h = 0.5144444 m/s)
    'mach': MACH_SPEED       // 马赫 (1 mach = 343 m/s)
};

// 主题切换函数
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME);
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题
    initTheme();

    // 添加深色模式切换按钮事件监听
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', toggleTheme);
    // 获取DOM元素
    const dryMassInput = document.getElementById('dryMass');
    const fuelMassInput = document.getElementById('fuelMass');
    const timeInput = document.getElementById('time');
    const timeUnitSelect = document.getElementById('timeUnit');
    const accelerationInput = document.getElementById('acceleration');
    const accelerationUnitSelect = document.getElementById('accelerationUnit');
    const initialVelocityInput = document.getElementById('initialVelocity');
    const energyUnitSelect = document.getElementById('energyUnit');
    const calculateButton = document.getElementById('calculate');
    const resultsDiv = document.getElementById('results');
    const processDiv = document.getElementById('process');

    // 添加计算按钮事件监听器
    calculateButton.addEventListener('click', () => {
        // 获取输入值
        const dryMass = parseFloat(dryMassInput.value); // 干质量 (t)
        const fuelMass = parseFloat(fuelMassInput.value); // 燃料质量 (t)
        const totalMass = dryMass + fuelMass; // 总质量 (t)
        const time = parseFloat(timeInput.value); // 时间
        const timeUnit = timeUnitSelect.value; // 时间单位
        const acceleration = parseFloat(accelerationInput.value); // 加速度
        const accelerationUnit = accelerationUnitSelect.value; // 加速度单位
        const initialVelocity = parseFloat(initialVelocityInput.value); // 初速度 (m/s)

        // 验证输入
        if (isNaN(dryMass) || isNaN(fuelMass) || isNaN(time) || isNaN(acceleration) || isNaN(initialVelocity)) {
            resultsDiv.innerHTML = '<p class="error">请填写所有必填字段</p>';
            processDiv.innerHTML = '';
            return;
        }

        if (dryMass <= 0 || fuelMass < 0 || time <= 0) {
            resultsDiv.innerHTML = '<p class="error">干质量必须大于零，燃料质量必须大于等于零，时间必须大于零</p>';
            processDiv.innerHTML = '';
            return;
        }

        // 转换时间为秒
        const timeInSeconds = time * TIME_UNITS[timeUnit];

        // 转换加速度为 m/s²
        const accelerationInMPS2 = accelerationUnit === 'G' ? acceleration * G_ACCELERATION : acceleration;

        // 计算过程
        let process = '';

        // 1. 计算所需能量
        process += '1. 计算所需能量:\n';
        process += `   - 飞船干质量: ${dryMass} 吨 = ${dryMass * 1000} kg\n`;
        process += `   - 燃料质量: ${fuelMass} 吨 = ${fuelMass * 1000} kg\n`;
        process += `   - 飞船总质量: ${totalMass} 吨 = ${totalMass * 1000} kg\n`;
        process += `   - 加速时间: ${time} ${getTimeUnitName(timeUnit)} = ${timeInSeconds.toLocaleString()} 秒\n`;
        process += `   - 加速度: ${acceleration} ${accelerationUnit} = ${accelerationInMPS2.toLocaleString()} m/s²\n`;
        process += `   - 初速度: ${initialVelocity.toLocaleString()} m/s\n\n`;

        // 计算力
        const force = totalMass * 1000 * accelerationInMPS2; // 牛顿 (N)
        process += `   - 所需力: 质量 × 加速度 = ${(totalMass * 1000).toLocaleString()} kg × ${accelerationInMPS2.toLocaleString()} m/s² = ${force.toLocaleString()} N\n`;

        // 计算能量和功率
        const energy = force * accelerationInMPS2 * timeInSeconds; // 焦耳 (J)
        const powerPerSecond = energy / timeInSeconds; // 瓦特 (W)
        
        // 获取能量单位选择
        const selectedEnergyUnit = energyUnitSelect.value;
        
        // 根据选择的能量单位调整计算过程的显示
        if (selectedEnergyUnit === 'J') {
            process += `   - 所需能量: 力 × 加速度 × 时间 = ${force.toLocaleString()} N × ${accelerationInMPS2.toLocaleString()} m/s² × ${timeInSeconds.toLocaleString()} s = ${energy.toLocaleString()} J\n`;
            process += `   - 每秒所需能量: 所需能量 / 时间 = ${energy.toLocaleString()} J / ${timeInSeconds.toLocaleString()} s = ${powerPerSecond.toLocaleString()} W\n\n`;
        } else {
            process += `   - 所需功率: 力 × 加速度 = ${force.toLocaleString()} N × ${accelerationInMPS2.toLocaleString()} m/s² = ${powerPerSecond.toLocaleString()} W\n`;
            process += `   - 总所需能量: 功率 × 时间 = ${powerPerSecond.toLocaleString()} W × ${timeInSeconds.toLocaleString()} s = ${energy.toLocaleString()} J\n\n`;
        }

        // 2. 计算光子推进所需燃料
        process += '2. 计算光子推进所需燃料:\n';
        
        // E = mc²
        const requiredFuelMass = energy / (SPEED_OF_LIGHT * SPEED_OF_LIGHT); // kg
        const fuelMassPerSecond = powerPerSecond / (SPEED_OF_LIGHT * SPEED_OF_LIGHT); // kg/s
        process += `   - 根据爱因斯坦质能方程 E = mc²:\n`;
        process += `   - 燃料质量 = 能量 / (光速²) = ${energy.toLocaleString()} J / (${SPEED_OF_LIGHT.toLocaleString()} m/s)² = ${requiredFuelMass.toLocaleString()} kg\n`;
        process += `   - 每秒燃料消耗 = 每秒能量 / (光速²) = ${powerPerSecond.toLocaleString()} W / (${SPEED_OF_LIGHT.toLocaleString()} m/s)² = ${fuelMassPerSecond.toLocaleString()} kg/s\n\n`;

        // 3. 计算最终速度和ΔV（考虑燃料消耗和相对论效应）
        process += '3. 计算最终速度和ΔV（考虑燃料消耗和相对论效应）:\n';
        
        // 考虑燃料消耗导致的质量变化
        const dryMassKg = dryMass * 1000; // 干质量（kg）
        let currentFuelMass = fuelMass * 1000; // 当前燃料质量（kg）
        let currentTotalMass = dryMassKg + currentFuelMass; // 当前总质量（kg）
        let currentVelocity = initialVelocity; // 初始速度（m/s）
        const timeStep = 1.0; // 时间步长（秒）
        let totalTime = 0;
        
        process += `   - 考虑燃料消耗导致的质量变化和相对论效应:\n`;
        process += `   - 初始干质量: ${dryMassKg.toLocaleString()} kg\n`;
        process += `   - 初始燃料质量: ${currentFuelMass.toLocaleString()} kg\n`;
        process += `   - 初始总质量: ${currentTotalMass.toLocaleString()} kg\n`;
        process += `   - 初始速度: ${currentVelocity.toLocaleString()} m/s\n`;
        
        while (totalTime < timeInSeconds) {
            // 当前时间步长（确保不超过总时间）
            const dt = Math.min(timeStep, timeInSeconds - totalTime);
            
            // 当前加速度（考虑质量变化）
            const currentAcceleration = accelerationInMPS2;
            
            // 计算当前时间步长内的能量消耗
            const stepEnergy = currentTotalMass * currentAcceleration * currentAcceleration * dt;
            
            // 计算当前时间步长内的燃料消耗
            const stepFuelMass = stepEnergy / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);
            
            // 更新燃料质量（减去燃料消耗）
            currentFuelMass = Math.max(0, currentFuelMass - stepFuelMass);
            // 更新总质量（干质量 + 当前燃料质量）
            currentTotalMass = dryMassKg + currentFuelMass;
            
            // 如果燃料质量为零，无法继续加速
            if (currentFuelMass <= 0) {
                process += `   - 警告：燃料消耗完毕，无法继续加速\n`;
                break;
            }
            
            // 计算速度增量（考虑相对论效应）
            const velocityIncrement = currentAcceleration * dt;
            
            // 相对论速度加和公式
            const c = SPEED_OF_LIGHT;
            const v1 = currentVelocity / c;
            const v2 = velocityIncrement / c;
            const relativeVelocity = (v1 + v2) / (1 + v1 * v2);
            currentVelocity = relativeVelocity * c;
            
            // 更新总时间
            totalTime += dt;
        }
        
        const finalVelocity = currentVelocity;
        process += `   - 最终干质量: ${dryMassKg.toLocaleString()} kg\n`;
        process += `   - 最终燃料质量: ${currentFuelMass.toLocaleString()} kg（消耗了 ${((fuelMass * 1000 - currentFuelMass) / (fuelMass * 1000) * 100).toFixed(6)}%）\n`;
        process += `   - 最终总质量: ${currentTotalMass.toLocaleString()} kg\n`;
        process += `   - 最终速度（考虑相对论效应）: ${finalVelocity.toLocaleString()} m/s\n`;
        
        // 计算ΔV（速度变化量）
        const deltaV = finalVelocity - initialVelocity;
        process += `   - ΔV (速度变化量) = 最终速度 - 初速度\n`;
        process += `   - ΔV = ${finalVelocity.toLocaleString()} m/s - ${initialVelocity.toLocaleString()} m/s = ${deltaV.toLocaleString()} m/s\n`;

        // 计算光速百分比
        const lightSpeedPercentage = (finalVelocity / SPEED_OF_LIGHT) * 100;
        process += `   - 相当于光速的 ${lightSpeedPercentage.toFixed(6)}%\n`;
        
        // 显示结果
        displayResults({
            dryMass,
            fuelMass,
            totalMass,
            timeInSeconds,
            accelerationInMPS2,
            initialVelocity,
            energy,
            powerPerSecond,
            calculatedFuelMass: requiredFuelMass,
            fuelMassPerSecond,
            finalVelocity,
            lightSpeedPercentage,
            selectedEnergyUnit,
            deltaV,
            currentFuelMass
        });

        // 显示计算过程
        processDiv.innerHTML = `<pre>${process}</pre>`;
    });

    // 显示结果函数
    function displayResults(data) {
        const {
            dryMass,
            fuelMass,
            totalMass,
            timeInSeconds,
            accelerationInMPS2,
            initialVelocity,
            energy,
            powerPerSecond,
            calculatedFuelMass,
            fuelMassPerSecond,
            finalVelocity,
            lightSpeedPercentage,
            selectedEnergyUnit,
            deltaV,
            currentFuelMass
        } = data;

        // 根据选择的能量单位确定显示的值
        const displayValue = selectedEnergyUnit === 'J' ? energy : powerPerSecond;
        const displayUnitBase = selectedEnergyUnit === 'J' ? 'J' : 'W';
        
        // 格式化能量单位
        let energyValue, energyUnit;
        if (displayValue >= 1e18) {
            energyValue = (displayValue / 1e18).toFixed(2);
            energyUnit = 'E' + displayUnitBase;
        } else if (displayValue >= 1e15) {
            energyValue = (displayValue / 1e15).toFixed(2);
            energyUnit = 'P' + displayUnitBase;
        } else if (displayValue >= 1e12) {
            energyValue = (displayValue / 1e12).toFixed(2);
            energyUnit = 'T' + displayUnitBase;
        } else if (displayValue >= 1e9) {
            energyValue = (displayValue / 1e9).toFixed(2);
            energyUnit = 'G' + displayUnitBase;
        } else if (displayValue >= 1e6) {
            energyValue = (displayValue / 1e6).toFixed(2);
            energyUnit = 'M' + displayUnitBase;
        } else if (displayValue >= 1e3) {
            energyValue = (displayValue / 1e3).toFixed(2);
            energyUnit = 'k' + displayUnitBase;
        } else {
            energyValue = displayValue.toFixed(2);
            energyUnit = displayUnitBase;
        }
        
        // 格式化每秒能量单位（仅当显示焦耳时需要）
        let powerValue, powerUnit;
        if (selectedEnergyUnit === 'J') {
            if (powerPerSecond >= 1e18) {
                powerValue = (powerPerSecond / 1e18).toFixed(2);
                powerUnit = 'EW';
            } else if (powerPerSecond >= 1e15) {
                powerValue = (powerPerSecond / 1e15).toFixed(2);
                powerUnit = 'PW';
            } else if (powerPerSecond >= 1e12) {
                powerValue = (powerPerSecond / 1e12).toFixed(2);
                powerUnit = 'TW';
            } else if (powerPerSecond >= 1e9) {
                powerValue = (powerPerSecond / 1e9).toFixed(2);
                powerUnit = 'GW';
            } else if (powerPerSecond >= 1e6) {
                powerValue = (powerPerSecond / 1e6).toFixed(2);
                powerUnit = 'MW';
            } else if (powerPerSecond >= 1e3) {
                powerValue = (powerPerSecond / 1e3).toFixed(2);
                powerUnit = 'kW';
            } else {
                powerValue = powerPerSecond.toFixed(2);
                powerUnit = 'W';
            }
        }

        // 格式化质量单位
        let massValue, massUnit;
        if (calculatedFuelMass >= 1e9) {
            massValue = (calculatedFuelMass / 1e9).toFixed(2);
            massUnit = '千吨';
        } else if (calculatedFuelMass >= 1e6) {
            massValue = (calculatedFuelMass / 1e6).toFixed(2);
            massUnit = '吨';
        } else if (calculatedFuelMass >= 1e3) {
            massValue = (calculatedFuelMass / 1e3).toFixed(2);
            massUnit = 'kg';
        } else if (calculatedFuelMass >= 1) {
            massValue = calculatedFuelMass.toFixed(2);
            massUnit = 'kg';
        } else if (calculatedFuelMass >= 1e-3) {
            massValue = (calculatedFuelMass * 1e3).toFixed(2);
            massUnit = 'g';
        } else if (calculatedFuelMass >= 1e-6) {
            massValue = (calculatedFuelMass * 1e6).toFixed(2);
            massUnit = 'mg';
        } else if (calculatedFuelMass >= 1e-9) {
            massValue = (calculatedFuelMass * 1e9).toFixed(2);
            massUnit = 'μg';
        } else if (calculatedFuelMass >= 1e-12) {
            massValue = (calculatedFuelMass * 1e12).toFixed(2);
            massUnit = 'ng';
        } else if (calculatedFuelMass >= 1e-15) {
            massValue = (calculatedFuelMass * 1e15).toFixed(2);
            massUnit = 'pg';
        } else {
            massValue = (calculatedFuelMass * 1e18).toFixed(2);
            massUnit = 'fg';
        }

        // 获取速度单位选择
        const speedUnitSelect = document.getElementById('speedUnit');
        const selectedSpeedUnit = speedUnitSelect.value;
        const speedConversionFactor = SPEED_UNITS[selectedSpeedUnit];

        // 格式化速度
        let speedText;
        const convertedFinalVelocity = finalVelocity / speedConversionFactor;
        speedText = `${convertedFinalVelocity.toFixed(2)} ${selectedSpeedUnit}`;

        // 格式化每秒燃料消耗
        let fuelRateValue, fuelRateUnit;
        if (fuelMassPerSecond >= 1e9) {
            fuelRateValue = (fuelMassPerSecond / 1e9).toFixed(2);
            fuelRateUnit = '千吨/秒';
        } else if (fuelMassPerSecond >= 1e6) {
            fuelRateValue = (fuelMassPerSecond / 1e6).toFixed(2);
            fuelRateUnit = '吨/秒';
        } else if (fuelMassPerSecond >= 1e3) {
            fuelRateValue = (fuelMassPerSecond / 1e3).toFixed(2);
            fuelRateUnit = 'kg/秒';
        } else if (fuelMassPerSecond >= 1) {
            fuelRateValue = fuelMassPerSecond.toFixed(2);
            fuelRateUnit = 'kg/秒';
        } else if (fuelMassPerSecond >= 1e-3) {
            fuelRateValue = (fuelMassPerSecond * 1e3).toFixed(2);
            fuelRateUnit = 'g/秒';
        } else if (fuelMassPerSecond >= 1e-6) {
            fuelRateValue = (fuelMassPerSecond * 1e6).toFixed(2);
            fuelRateUnit = 'mg/秒';
        } else if (fuelMassPerSecond >= 1e-9) {
            fuelRateValue = (fuelMassPerSecond * 1e9).toFixed(2);
            fuelRateUnit = 'μg/秒';
        } else if (fuelMassPerSecond >= 1e-12) {
            fuelRateValue = (fuelMassPerSecond * 1e12).toFixed(2);
            fuelRateUnit = 'ng/秒';
        } else if (fuelMassPerSecond >= 1e-15) {
            fuelRateValue = (fuelMassPerSecond * 1e15).toFixed(2);
            fuelRateUnit = 'pg/秒';
        } else {
            fuelRateValue = (fuelMassPerSecond * 1e18).toFixed(2);
            fuelRateUnit = 'fg/秒';
        }

        // 格式化剩余燃料
        let remainingFuelValue, remainingFuelUnit;
        if (currentFuelMass >= 1e9) {
            remainingFuelValue = (currentFuelMass / 1e9).toFixed(2);
            remainingFuelUnit = '千吨';
        } else if (currentFuelMass >= 1e6) {
            remainingFuelValue = (currentFuelMass / 1e6).toFixed(2);
            remainingFuelUnit = '吨';
        } else if (currentFuelMass >= 1e3) {
            remainingFuelValue = (currentFuelMass / 1e3).toFixed(2);
            remainingFuelUnit = 'kg';
        } else if (currentFuelMass >= 1) {
            remainingFuelValue = currentFuelMass.toFixed(2);
            remainingFuelUnit = 'kg';
        } else if (currentFuelMass >= 1e-3) {
            remainingFuelValue = (currentFuelMass * 1e3).toFixed(2);
            remainingFuelUnit = 'g';
        } else if (currentFuelMass >= 1e-6) {
            remainingFuelValue = (currentFuelMass * 1e6).toFixed(2);
            remainingFuelUnit = 'mg';
        } else if (currentFuelMass >= 1e-9) {
            remainingFuelValue = (currentFuelMass * 1e9).toFixed(2);
            remainingFuelUnit = 'μg';
        } else if (currentFuelMass >= 1e-12) {
            remainingFuelValue = (currentFuelMass * 1e12).toFixed(2);
            remainingFuelUnit = 'ng';
        } else if (currentFuelMass >= 1e-15) {
            remainingFuelValue = (currentFuelMass * 1e15).toFixed(2);
            remainingFuelUnit = 'pg';
        } else {
            remainingFuelValue = (currentFuelMass * 1e18).toFixed(2);
            remainingFuelUnit = 'fg';
        }

        // 计算燃料消耗百分比
        const initialFuelMassKg = fuelMass * 1000;
        const fuelConsumptionPercentage = ((initialFuelMassKg - currentFuelMass) / initialFuelMassKg * 100).toFixed(2);

        // 构建结果HTML
        let html = '';
        
        // 根据选择的能量单位显示不同的信息
        if (selectedEnergyUnit === 'J') {
            // 当选择焦耳(J)时，第一行显示总能量，第二行显示功率
            html += `<p><strong>所需能量:</strong> ${energyValue} ${energyUnit}</p>\n`;
            html += `<p><strong>每秒所需能量(功率):</strong> ${powerValue} ${powerUnit}</p>\n`;
        } else {
            // 当选择瓦特(W)时，第一行显示功率，第二行显示总能量
            html += `<p><strong>所需功率:</strong> ${energyValue} ${energyUnit}</p>\n`;
            
            // 格式化总能量（焦耳）
            let totalEnergyValue, totalEnergyUnit;
            if (energy >= 1e18) {
                totalEnergyValue = (energy / 1e18).toFixed(2);
                totalEnergyUnit = 'EJ';
            } else if (energy >= 1e15) {
                totalEnergyValue = (energy / 1e15).toFixed(2);
                totalEnergyUnit = 'PJ';
            } else if (energy >= 1e12) {
                totalEnergyValue = (energy / 1e12).toFixed(2);
                totalEnergyUnit = 'TJ';
            } else if (energy >= 1e9) {
                totalEnergyValue = (energy / 1e9).toFixed(2);
                totalEnergyUnit = 'GJ';
            } else if (energy >= 1e6) {
                totalEnergyValue = (energy / 1e6).toFixed(2);
                totalEnergyUnit = 'MJ';
            } else if (energy >= 1e3) {
                totalEnergyValue = (energy / 1e3).toFixed(2);
                totalEnergyUnit = 'kJ';
            } else {
                totalEnergyValue = energy.toFixed(2);
                totalEnergyUnit = 'J';
            }
            html += `<p><strong>总所需能量:</strong> ${totalEnergyValue} ${totalEnergyUnit}</p>\n`;
        }
        
        // 格式化ΔV
        let deltaVText;
        const convertedDeltaV = data.deltaV / speedConversionFactor;
        deltaVText = `${convertedDeltaV.toFixed(2)} ${selectedSpeedUnit}`;

        html += `
            <p><strong>所需燃料质量:</strong> ${massValue} ${massUnit}</p>
            <p><strong>每秒燃料消耗:</strong> ${fuelRateValue} ${fuelRateUnit}</p>
            <p><strong>剩余燃料质量:</strong> ${remainingFuelValue} ${remainingFuelUnit} (消耗了 ${fuelConsumptionPercentage}%)</p>
            <p><strong>最终速度:</strong> ${speedText} (光速的 ${lightSpeedPercentage.toFixed(6)}%)</p>
            <p><strong>ΔV (速度变化量):</strong> ${deltaVText}</p>
        `;

        resultsDiv.innerHTML = html;
    }

    // 获取时间单位名称
    function getTimeUnitName(unit) {
        const names = {
            's': '秒',
            'm': '分钟',
            'h': '小时',
            'd': '天',
            'w': '周',
            'y': '地球年'
        };
        return names[unit] || unit;
    }
});
