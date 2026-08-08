"use strict";
/* ========================================
   ダイヤ倍率計算機
   ======================================== */
const INVESTMENTS = {
    30: 30,
    300: 300,
    3000: 3000,
    30000: 30000
};
const TOTAL_INVESTMENT = 33330;
const MAX_RATE = 2;
const STORAGE_KEY = "diamondCounterData_v2";
/* ----------------------------------------
   DOM
---------------------------------------- */
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
const totalRateElement =
    document.getElementById("totalRate");
const resetButton =
    document.getElementById("resetButton");
/* ----------------------------------------
   入力値
---------------------------------------- */
function getValue(input) {
    if (!input || input.value.trim() === "") {
        return null;
    }
    const value = Number(input.value);
    return Number.isFinite(value) ? value : null;
}
/* ----------------------------------------
   倍率
---------------------------------------- */
function calculateRate(difference, investment) {
    const rate = difference / investment;
    return Math.min(rate, MAX_RATE);
}
/* ----------------------------------------
   表示
---------------------------------------- */
function displayRate(element, rate) {
    element.classList.remove(
        "good",
        "warning",
        "bad",
        "max"
    );
    if (rate === null || !Number.isFinite(rate)) {
        element.textContent = "-";
        return;
    }
    element.textContent =
        rate.toFixed(3) + "倍";
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
/* ----------------------------------------
   各投資の計算
---------------------------------------- */
function calculate() {
    fields.forEach(field => {
        const base = getValue(field.base);
        const after = getValue(field.after);
        if (base === null || after === null) {
            field.diff.textContent = "-";
            displayRate(field.rate, null);
            return;
        }
        // 獲得後 - 元
        const difference = after - base;
        // 増加ダイヤ数
        field.diff.textContent =
            difference.toLocaleString("ja-JP");
        // 増加ダイヤ数 ÷ 投資額
        const rate = calculateRate(
            difference,
            INVESTMENTS[field.key]
        );
        displayRate(field.rate, rate);
    });
    calculateTotal();
    saveData();
}
/* ----------------------------------------
   総合倍率
---------------------------------------- */
function calculateTotal() {
    const firstBase =
        getValue(fields[0].base);
    const fourthAfter =
        getValue(fields[3].after);
    if (
        firstBase === null ||
        fourthAfter === null
    ) {
        displayRate(
            totalRateElement,
            null
        );
        return;
    }
    // ④獲得後 - ①元
    const totalDifference =
        fourthAfter - firstBase;
    // 総投資額33330で割る
    const totalRate =
        calculateRate(
            totalDifference,
            TOTAL_INVESTMENT
        );
    displayRate(
        totalRateElement,
        totalRate
    );
}
/* ----------------------------------------
   保存
---------------------------------------- */
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
        console.error(
            "保存エラー:",
            error
        );
    }
}
/* ----------------------------------------
   復元
---------------------------------------- */
function loadData() {
    try {
        const saved =
            localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return;
        }
        const data =
            JSON.parse(saved);
        fields.forEach(field => {
            if (!data[field.key]) {
                return;
            }
            field.base.value =
                data[field.key].base || "";
            field.after.value =
                data[field.key].after || "";
        });
    } catch (error) {
        console.error(
            "復元エラー:",
            error
        );
    }
}
/* ----------------------------------------
   リセット
---------------------------------------- */
function resetData() {
    if (
        !window.confirm(
            "入力内容をすべてリセットしますか？"
        )
    ) {
        return;
    }
    fields.forEach(field => {
        field.base.value = "";
        field.after.value = "";
        field.diff.textContent = "-";
        displayRate(
            field.rate,
            null
        );
    });
    displayRate(
        totalRateElement,
        null
    );
    try {
        localStorage.removeItem(
            STORAGE_KEY
        );
    } catch (error) {
        console.error(
            "削除エラー:",
            error
        );
    }
}
/* ----------------------------------------
   イベント登録
---------------------------------------- */
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
/* ----------------------------------------
   起動
---------------------------------------- */
loadData();
calculate();
/* ----------------------------------------
   Service Worker
---------------------------------------- */
if ("serviceWorker" in navigator) {
    window.addEventListener(
        "load",
        async () => {
            try {
                const registration =
                    await navigator.serviceWorker.register(
                        "./service-worker.js"
                    );
                console.log(
                    "PWA Service Worker:",
                    registration.scope
                );
            } catch (error) {
                console.error(
                    "Service Worker登録エラー:",
                    error
                );
            }
        }
    );
}