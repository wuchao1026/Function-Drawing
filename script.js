// 初始化变量
let myChart = null;
let yColumnCount = 1;
const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#7f8c8d', '#16a085'
];

// 输入模式按钮处理
const inputModeButtons = document.querySelectorAll('.input-mode-btn');
let currentInputMode = 'manual'; // 默认输入模式

inputModeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有按钮的active类
        inputModeButtons.forEach(btn => btn.classList.remove('active'));
        // 添加当前按钮的active类
        button.classList.add('active');
        // 更新当前输入模式
        currentInputMode = button.dataset.mode;
        // 切换输入模式
        toggleXInputMode(currentInputMode === 'auto');
    });
});

// 修改切换X值输入模式函数
function toggleXInputMode(isAuto) {
    const xInputs = document.querySelectorAll('.x-value');
    const xAxisSettings = document.querySelector('.x-axis-settings');
    
    xInputs.forEach(input => {
        input.disabled = isAuto;
    });
    
    xAxisSettings.style.display = isAuto ? 'block' : 'none';
}

// 生成X值按钮事件处理
document.getElementById('generate-x').addEventListener('click', generateXValues);

// 修改Y列添加按钮事件处理
function addYColumn() {
    yColumnCount++;
    
    // 添加表头
    const headerRow = document.querySelector('#data-table thead tr');
    const newTh = document.createElement('th');
    newTh.innerHTML = `Y${yColumnCount} 
        <button class="circle-button" onclick="addYColumn()">+</button>
        <button class="circle-button delete-button" onclick="removeYColumn(${yColumnCount})">-</button>`;
    headerRow.appendChild(newTh);
    
    // 为每一行添加新的Y值输入框
    const rows = document.querySelectorAll('#table-body tr');
    rows.forEach(row => {
        const newTd = document.createElement('td');
        newTd.innerHTML = `<input type="number" step="any" class="y${yColumnCount}-value">`;
        row.appendChild(newTd);
    });

    // 显示第一个Y列的删除按钮
    if (yColumnCount === 2) {
        const firstYColumn = document.querySelector('#data-table th:nth-child(2)');
        firstYColumn.querySelector('.delete-button').style.display = 'inline-flex';
    }
}

// 添加删除Y列的函数
function removeYColumn(columnIndex) {
    if (yColumnCount <= 1) return; // 保留至少一个Y列
    
    // 删除表头
    const headerRow = document.querySelector('#data-table thead tr');
    headerRow.removeChild(headerRow.children[columnIndex]);
    
    // 删除每行中的对应单元格
    const rows = document.querySelectorAll('#table-body tr');
    rows.forEach(row => {
        row.removeChild(row.children[columnIndex]);
    });
    
    // 更新剩余列的编号
    for (let i = columnIndex; i < headerRow.children.length; i++) {
        const th = headerRow.children[i];
        const yNum = i;
        th.innerHTML = `Y${yNum} 
            <button class="circle-button" onclick="addYColumn()">+</button>
            <button class="circle-button delete-button" onclick="removeYColumn(${yNum})">-</button>`;
        
        // 更新输入框的类名
        rows.forEach(row => {
            const input = row.children[i].querySelector('input');
            input.className = `y${yNum}-value`;
        });
    }
    
    yColumnCount--;
    
    // 如果只剩一个Y列，隐藏其删除按钮
    if (yColumnCount === 1) {
        const firstYColumn = document.querySelector('#data-table th:nth-child(2)');
        firstYColumn.querySelector('.delete-button').style.display = 'none';
    }
}

// 生成X值
function generateXValues() {
    const xStart = parseFloat(document.getElementById('x-start').value);
    const xEnd = parseFloat(document.getElementById('x-end').value);
    const xStep = parseFloat(document.getElementById('x-step').value);
    
    if (isNaN(xStart) || isNaN(xEnd) || isNaN(xStep) || xStep <= 0) {
        alert('请输入有效的X轴范围和间隔值');
        return;
    }
    
    // 清空现有的行
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    // 生成新的行
    for (let x = xStart; x <= xEnd; x += xStep) {
        addNewRow(x.toFixed(2), true);
    }
}

// 添加新行
function addNewRow(xValue = '', isDisabled = false) {
    const tbody = document.getElementById('table-body');
    const newRow = document.createElement('tr');
    let rowHtml = `<td><input type="number" step="any" class="x-value" value="${xValue}" ${isDisabled ? 'disabled' : ''}></td>`;
    
    // 添加所有Y值的输入框
    for (let i = 1; i <= yColumnCount; i++) {
        rowHtml += `<td><input type="number" step="any" class="y${i}-value"></td>`;
    }
    
    newRow.innerHTML = rowHtml;
    tbody.appendChild(newRow);
}

// 修改添加行按钮事件处理
document.getElementById('add-row').addEventListener('click', () => {
    const isAuto = currentInputMode === 'auto';
    addNewRow('', isAuto);
});

// 修改添加行按钮的内容
document.getElementById('add-row').innerHTML = '+';

// 添加生成图表按钮事件监听器
document.getElementById('generate-chart').addEventListener('click', generateChart);

// 图表类型按钮处理
const chartTypeButtons = document.querySelectorAll('.chart-type-btn');
let currentChartType = 'line'; // 默认图表类型

chartTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有按钮的active类
        chartTypeButtons.forEach(btn => btn.classList.remove('active'));
        // 添加当前按钮的active类
        button.classList.add('active');
        // 更新当前图表类型
        currentChartType = button.dataset.type;
    });
});

// 修改生成图表函数中获取图表类型的方式
function generateChart() {
    // 收集表格数据
    const data = collectTableData();
    
    if (Object.values(data).every(arr => arr.length === 0)) {
        alert('请输入至少一组有效的坐标数据');
        return;
    }
    
    // 获取用户输入的标题
    const xAxisLabel = document.getElementById('x-axis-label').value || 'X轴';
    const yAxisLabel = document.getElementById('y-axis-label').value || 'Y轴';
    const chartTitle = document.getElementById('chart-title').value;
    
    // 使用currentChartType替代原来的select值
    const chartType = currentChartType;
    
    // 创建图表
    const ctx = document.getElementById('chart-canvas').getContext('2d');
    
    // 如果已存在图表，先销毁
    if (myChart) {
        myChart.destroy();
    }
    
    // 创建数据集
    const datasets = Object.entries(data).map(([label, points], index) => ({
        label: label,
        data: points,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        fill: false
    }));
    
    // 创建新图表
    myChart = new Chart(ctx, {
        type: chartType,
        data: { datasets },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: !!chartTitle,  // 只在有标题时显示
                    text: chartTitle,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 20
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: xAxisLabel  // 使用用户输入的X轴标题
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisLabel  // 使用用户输入的Y轴标题
                    }
                }
            }
        }
    });
}

function collectTableData() {
    const rows = document.querySelectorAll('#table-body tr');
    const data = {};
    
    // 初始化数据数组
    for (let i = 1; i <= yColumnCount; i++) {
        data[`Y${i}`] = [];
    }
    
    rows.forEach(row => {
        const x = parseFloat(row.querySelector('.x-value').value);
        
        // 收集每个Y值
        for (let i = 1; i <= yColumnCount; i++) {
            const y = parseFloat(row.querySelector(`.y${i}-value`).value);
            if (!isNaN(x) && !isNaN(y)) {
                data[`Y${i}`].push({x: x, y: y});
            }
        }
    });
    
    // 对每组数据进行排序
    Object.values(data).forEach(points => {
        points.sort((a, b) => a.x - b.x);
    });
    
    return data;
}

// 保存图表按钮事件处理
document.getElementById('save-chart').addEventListener('click', () => {
    const canvas = document.getElementById('chart-canvas');
    
    // 创建一个临时链接
    const link = document.createElement('a');
    link.download = '函数图像.png';
    link.href = canvas.toDataURL('image/png');
    
    // 模拟点击下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// 修改初始Y1列的按钮
document.addEventListener('DOMContentLoaded', () => {
    // 设置X轴默认值
    document.getElementById('x-start').value = '0';
    document.getElementById('x-end').value = '10';
    document.getElementById('x-step').value = '1';
    
    // 初始化X轴设置区域显示状态
    toggleXInputMode(false);
    
    // 为Y1的加号按钮添加事件处理
    const y1Header = document.querySelector('#data-table th:nth-child(2)');
    y1Header.innerHTML = `Y1 
        <button class="circle-button" onclick="addYColumn()">+</button>
        <button class="circle-button delete-button" onclick="removeYColumn(1)" style="display: none;">-</button>`;
    
    // 添加第一行
    document.getElementById('add-row').click();
}); 