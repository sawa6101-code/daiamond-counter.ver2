"use strict";

const INVESTMENTS = { 30: 30, 300: 300, 3000: 3000, 30000: 30000 };
const TOTAL_INVESTMENT = 33330;
const MAX_RATE = 2;
const STORAGE_KEY = "diamondCounterData_v3";

function init() {
    const fields = [
        { key: "30", base: "base30", after: "after30", diff: "diff30", rate: "rate30" },
        { key: "300", base: "base300", after: "after300", diff: "diff300", rate: "rate300" },
        { key: "3000", base: "base3000", after: "after3000", diff: "diff3000", rate: "rate3000" },
        { key: "30000", base: "base30000", after: "after30000", diff: "diff30000", rate: "rate30000" }
    ].map(f => ({
        key: f.key,
        base: document.getElementById(f.base),
        after: document.getElementById(f.after),
        diff: document.getElementById(f.diff),
        rate: document.getElementById(f.rate)
    }));

    const totalRate = document.getElementById("totalRate");
    const resetButton = document.getElementById("resetButton");

    if (!fields.every(f => f.base && f.after && f.diff && f.rate) || !totalRate || !resetButton) {
        console.error("必要なHTML要素が見つかりません。");
        return;
    }

    function value(input) {
        if (input.value.trim() === "") return null;
        const n = Number(input.value);
        return Number.isFinite(n) ? n : null;
    }

    function cappedRate(difference, investment) {
        return Math.min(difference / investment, MAX_RATE);
    }

    function renderRate(element, rate) {
        element.classList.remove("good", "warning", "bad", "max");
        if (rate === null || !Number.isFinite(rate)) {
            element.textContent = "-";
            return;
        }
        element.textContent = `${rate.toFixed(3)}倍`;
        if (rate >= MAX_RATE) element.classList.add("max");
        else if (rate >= 1.5) element.classList.add("good");
        else if (rate >= 1) element.classList.add("warning");
        else element.classList.add("bad");
    }

    function calculate() {
        for (const field of fields) {
            const base = value(field.base);
            const after = value(field.after);
            if (base === null || after === null) {
                field.diff.textContent = "-";
                renderRate(field.rate, null);
                continue;
            }
            const difference = after - base;
            field.diff.textContent = difference.toLocaleString("ja-JP");
            renderRate(field.rate, cappedRate(difference, INVESTMENTS[field.key]));
        }

        const firstBase = value(fields[0].base);
        const fourthAfter = value(fields[3].after);
        if (firstBase === null || fourthAfter === null) {
            renderRate(totalRate, null);
        } else {
            renderRate(totalRate, cappedRate(fourthAfter - firstBase, TOTAL_INVESTMENT));
        }
        save();
    }

    function save() {
        try {
            const data = {};
            fields.forEach(f => {
                data[f.key] = { base: f.base.value, after: f.after.value };
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn("保存できませんでした", e);
        }
    }

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            fields.forEach(f => {
                if (!data[f.key]) return;
                f.base.value = data[f.key].base ?? "";
                f.after.value = data[f.key].after ?? "";
            });
        } catch (e) {
            console.warn("保存データを読み込めませんでした", e);
        }
    }

    function reset() {
        if (!window.confirm("入力内容をすべてリセットしますか？")) return;
        fields.forEach(f => {
            f.base.value = "";
            f.after.value = "";
            f.diff.textContent = "-";
            renderRate(f.rate, null);
        });
        renderRate(totalRate, null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.warn("保存データを削除できませんでした", e);
        }
    }

    fields.forEach(f => {
        f.base.addEventListener("input", calculate);
        f.after.addEventListener("input", calculate);
        f.base.addEventListener("change", calculate);
        f.after.addEventListener("change", calculate);
    });

    resetButton.addEventListener("click", reset);

    load();
    calculate();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" })
            .then(reg => reg.update())
            .catch(err => console.warn("Service Worker登録失敗:", err));
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
