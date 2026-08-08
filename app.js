// ========================================
// ダイヤ倍率計算機
// ========================================

// 投資額
const INVESTMENTS = {
    30: 30,
    300: 300,
    3000: 3000,
    30000: 30000
};

// 総投資額
const TOTAL_INVESTMENT = 30 + 300 + 3000 + 30000; // 33330

// 倍率上限
const MAX_RATE = 2;

// 保存キー
const STORAGE_KEY = "diamondCounterData";

// ----------------------------------------
// DOM取得
// ----------------------------------------

const fields = [
    {
        key: "30",
        base: document.getElementById("base30"),
        after: document.getElementById("after30"),
        diff: document.getElementById("diff30"),
        rate: document.getElementById("rate30")
    },
    {
        key: "300",
        base: document.getElementById("base300"),
        after: document.getElementById("after300"),
        diff: document.getElementById("diff300"),
        rate: document.getElementById("rate300")
    },
    {
        key: "3000",
        base: document.getElementById("base3000"),
        after: document.getElementById("after3000"),
        diff: document.getElementById("diff3000"),
        rate: document.getElementById("rate3000")
    },
    {
        key: "30000",
        base: document.getElementById("base30000"),
        after: document.getElementById("after30000"),
        diff: document.getElementById("diff30000"),
        rate: document.getElementById("rate30000")
    }
];

const totalRateElement = document.getElementById("totalRate");
const resetButton = document.getElementById("resetButton");

// ----------------------------------------
// 数値取得
// ----------------------------------------

function getNumber(input) {
    const value = Number(input.value);

    return Number.isFinite(value) ? value : null;
}

// ----------------------------------------
// 倍率計算
// ----------------------------------------

function calculateRate(difference, investment) {

    if (!Number.isFinite(difference)) {
        return null;
    }

    const rate = difference / investment;

    // 最大2倍
    return Math.min(rate, MAX_RATE);
}

// ----------------------------------------
// 倍率表示
// ----------------------------------------

function formatRate(rate) {

    if (rate === null || !Number.isFinite(rate)) {
        return "-";
    }

    return `${rate.toFixed(3)}倍`;
}

// ----------------------------------------
// 倍率の色分け
// ----------------------------------------

function applyRateColor(element, rate) {

    element.classList.remove(
        "good",
        "warning",
        "bad",
        "max"
    );

    if (rate === null || !Number.isFinite(rate)) {
        return;
    }

    if (rate >= MAX_RATE) {
        element.classList.add("max");
    } else if (rate >= 1.5) {
        element.classList.add("good");
    } else if (rate >= 1.0) {
        element.classList.add("warning");
    } else {
        element.classList.add("bad");
    }
}

// ----------------------------------------
// 各投資の計算
// ----------------------------------------

function calculate() {

    fields.forEach(field => {

        const base = getNumber(field.base);
        const after = getNumber(field.after);

        // 両方入力されている場合のみ計算
        if (base !== null && after !== null) {

            // 増加ダイヤ数
            const difference = after - base;

            // 各投資額に対する倍率
            const rate = calculateRate(
                difference,
                INVESTMENTS[field.key]
            );

            field.diff.textContent =
                difference.toLocaleString("ja-JP");

            field.rate.textContent =
                formatRate(rate);

            applyRateColor(field.rate, rate);

        } else {

            field.diff.textContent = "-";
            field.rate.textContent = "-";

            applyRateColor(field.rate, null);
        }
    });

    calculateTotalRate();
    saveData();
}

// ----------------------------------------
// 総合倍率
// ----------------------------------------

function calculateTotalRate() {

    const first = fields[0];
    const last = fields[3];

    const firstBase = getNumber(first.base);
    const lastAfter = getNumber(last.after);

    if (firstBase === null || lastAfter === null) {

        totalRateElement.textContent = "-";

        applyRateColor(totalRateElement, null);

        return;
    }

    // ①元ダイヤ → ④獲得後
    const totalDifference =
        lastAfter - firstBase;

    // 総投資額33330に対する倍率
    const totalRate =
        calculateRate(
            totalDifference,
            TOTAL_INVESTMENT
        );

    totalRateElement.textContent =
        formatRate(totalRate);

    applyRateColor(
        totalRateElement,
        totalRate
    );
}

// ----------------------------------------
// データ保存
// ----------------------------------------

function saveData() {

    const data = {};

    fields.forEach(field => {

        data[field.key] = {
            base: field.base.value,
            after: field.after.value
        };

    });

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "データを保存できませんでした。",
            error
        );
    }
}

// ----------------------------------------
// データ復元
// ----------------------------------------

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return;
        }

        const data = JSON.parse(saved);

        fields.forEach(field => {

            if (!data[field.key]) {
                return;
            }

            field.base.value =
                data[field.key].base ?? "";

            field.after.value =
                data[field.key].after ?? "";

        });

    } catch (error) {

        console.warn(
            "保存データを読み込めませんでした。",
            error
        );
    }
}

// ----------------------------------------
// リセット
// ----------------------------------------

function resetData() {

    const confirmed =
        window.confirm(
            "入力内容をすべてリセットしますか？"
        );

    if (!confirmed) {
        return;
    }

    fields.forEach(field => {

        field.base.value = "";
        field.after.value = "";

        field.diff.textContent = "-";
        field.rate.textContent = "-";

        applyRateColor(field.rate, null);
    });

    totalRateElement.textContent = "-";

    applyRateColor(
        totalRateElement,
        null
    );

    try {

        localStorage.removeItem(
            STORAGE_KEY
        );

    } catch (error) {

        console.warn(
            "保存データを削除できませんでした。",
            error
        );
    }
}

// ----------------------------------------
// 入力イベント
// ----------------------------------------

fields.forEach(field => {

    field.base.addEventListener(
        "input",
        calculate
    );

    field.after.addEventListener(
        "input",
        calculate
    );
});

resetButton.addEventListener(
    "click",
    resetData
);

// ----------------------------------------
// 初期化
// ----------------------------------------

loadData();
calculate();

// ----------------------------------------
// Service Worker登録
// ----------------------------------------

if ("serviceWorker" in navigator) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./service-worker.js")
                .then(registration => {

                    console.log(
                        "Service Worker registered:",
                        registration.scope
                    );

                })
                .catch(error => {

                    console.error(
                        "Service Worker registration failed:",
                        error
                    );

                });
        }
    );
