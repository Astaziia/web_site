import { MathfieldElement } from 'https://unpkg.com/mathlive?module';

// Конфигурация полей для каждого типа графика
const mathFields = {
    explicit: [{ id: 'zExpr', label: 'z = f(x, y)', value: 'sin(x) * cos(y)' }],
    implicit: [{ id: 'FExpr', label: 'F(x, y) = 0', value: 'x^2 + y^2 - 9' }],
    parametric: [
        { id: 'xExpr', label: 'x(t) =', value: 'cos(t)' },
        { id: 'yExpr', label: 'y(t) =', value: 'sin(t)' },
        { id: 'zExpr', label: 'z(t) =', value: 't / 10' }
    ],
    polar: [
        { id: 'rExpr', label: 'r(theta) =', value: '2 + sin(3 * theta)' }
    ]
};

// Инициализация полей ввода
export function initMathFields() {
    const inputArea = document.getElementById('inputs');
    const selector = document.getElementById('mode');

    function createField(field) {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.innerText = field.label;
        label.style.fontFamily = "'Roboto', sans-serif";
        label.style.marginRight = '10px';
        div.appendChild(label);

        const mf = new MathfieldElement();
        mf.id = field.id;
        mf.value = field.value;
        mf.style.marginLeft = "10px";
        mf.style.width = "300px";
        mf.style.fontFamily = "'Roboto Mono', monospace";
        div.appendChild(mf);

        inputArea.appendChild(div);
    }

    function updateFields(type) {
        inputArea.innerHTML = '';
        mathFields[type].forEach(createField);
    }

    function getVal(id) {
        return document.getElementById(id)?.value ?? '';
    }

    selector.addEventListener('change', () => {
        updateFields(selector.value);
    });

    updateFields(selector.value); // начальная загрузка

    // Экспортируем функцию получения значения
    window.getExpressionValue = getVal;
    window.getCurrentMode = () => selector.value;
}

// Построение явного графика
function plotExplicitGraph(expr) {
    const parsed = math.parse(expr).compile();
    const x = [], y = [], z = [];
    const step = 0.5;

    for (let i = -10; i <= 10; i += step) x.push(i);
    for (let j = -10; j <= 10; j += step) y.push(j);

    for (let i = 0; i < x.length; i++) {
        const row = [];
        for (let j = 0; j < y.length; j++) {
            try {
                const val = parsed.evaluate({ x: x[i], y: y[j] });
                row.push(isFinite(val) ? val : null);
            } catch {
                row.push(null);
            }
        }
        z.push(row);
    }

    Plotly.newPlot('plot', [{
        x: x,
        y: y,
        z: z,
        type: 'surface',
        colorscale: [[0, '#8673f1'], [1, '#8673f1']]
    }], {
        title: `z = ${expr}`,
        scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'z' } },
        margin: { l: 0, r: 0, b: 0, t: 50 },
    });
}

// Построение неявного графика
function plotImplicitGraph(expr) {
    const parsed = math.parse(expr).compile();
    const x = [], y = [], z = [];
    const step = 0.25;

    for (let i = -10; i <= 10; i += step) x.push(i);
    for (let j = -10; j <= 10; j += step) y.push(j);

    for (let i = 0; i < x.length; i++) {
        const row = [];
        for (let j = 0; j < y.length; j++) {
            try {
                row.push(parsed.evaluate({ x: x[i], y: y[j] }));
            } catch {
                row.push(null);
            }
        }
        z.push(row);
    }

    Plotly.newPlot('plot', [{
        type: 'contour',
        x: x,
        y: y,
        z: z,
        contours: { coloring: 'lines', showlabels: true },
        line: { width: 2, color: '#8673f1' },
        showscale: false
    }], {
        title: `F(x, y) = 0: ${expr}`,
        xaxis: { title: 'x' },
        yaxis: { title: 'y' },
        margin: { l: 0, r: 0, b: 0, t: 50 }
    });
}

// Построение параметрического графика
function plotParametricGraph(xExpr, yExpr, zExpr) {
    const xParsed = math.parse(xExpr).compile();
    const yParsed = math.parse(yExpr).compile();
    const zParsed = math.parse(zExpr).compile();

    const tValues = math.range(0, 10 * Math.PI, 0.1).toArray();
    const x = [], y = [], z = [];

    for (let t of tValues) {
        try {
            x.push(xParsed.evaluate({ t }));
            y.push(yParsed.evaluate({ t }));
            z.push(zParsed.evaluate({ t }));
        } catch {
            x.push(null); y.push(null); z.push(null);
        }
    }

    Plotly.newPlot('plot', [{
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        line: { color: '#8673f1', width: 4 }
    }], {
        title: 'Параметрическая кривая: x(t), y(t), z(t)',
        scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'z' } },
        margin: { l: 0, r: 0, b: 0, t: 50 }
    });
}

// Построение полярного графика
function plotPolarGraph(rExpr) {
    const rParsed = math.parse(rExpr).compile();

    const thetaValues = math.range(0, 2 * Math.PI, 0.01).toArray();
    const x = [], y = [], z = [];

    for (let theta of thetaValues) {
        try {
            const r = rParsed.evaluate({ theta });
            x.push(r * Math.cos(theta));
            y.push(r * Math.sin(theta));
            z.push(theta);
        } catch {
            x.push(null); y.push(null); z.push(null);
        }
    }

    Plotly.newPlot('plot', [{
        type: 'scatter3d',
        mode: 'lines',
        x: x,
        y: y,
        z: z,
        line: { color: '#8673f1', width: 4 }
    }], {
        title: `Полярная функция: r(θ) = ${rExpr}`,
        scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'z' } },
        margin: { l: 0, r: 0, b: 0, t: 50 }
    });
}

// Основная функция построения графика
export function plotGraph() {
    const mode = window.getCurrentMode();

    if (mode === 'explicit') {
        const expr = window.getExpressionValue('zExpr');
        plotExplicitGraph(expr);
    } else if (mode === 'implicit') {
        const expr = window.getExpressionValue('FExpr');
        plotImplicitGraph(expr);
    } else if (mode === 'parametric') {
        const xExpr = window.getExpressionValue('xExpr');
        const yExpr = window.getExpressionValue('yExpr');
        const zExpr = window.getExpressionValue('zExpr');
        plotParametricGraph(xExpr, yExpr, zExpr);
    } else if (mode === 'polar') {
        const rExpr = window.getExpressionValue('rExpr');
        plotPolarGraph(rExpr);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initMathFields();
    window.plotGraph = plotGraph;
});