import { AuthService, CasesService } from '../api.js';

document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthService.getUser()) {
        window.location.href = "../login/index.html";
        return;
    }

    // ربط القضايا بالمودال لربط الدفعة
    await loadCasesForFinance();
});

// فتح وإغلاق النافذة المنبثقة
window.openModal = function() {
    const modal = document.getElementById("paymentModal");
    if (modal) modal.classList.add("active");
};

window.closeModal = function() {
    const modal = document.getElementById("paymentModal");
    if (modal) modal.classList.remove("active");
};

async function loadCasesForFinance() {
    try {
        const cases = await CasesService.getAll();
        const caseSelect = document.querySelector("#paymentModal select");
        if (caseSelect && cases && cases.length > 0) {
            caseSelect.innerHTML = cases.map(c => `<option value="${c.id}">${c.caseNumber} - ${c.client?.name || 'عام'}</option>`).join('');
        }
    } catch (err) {
        console.error("خطأ جلب ماليات القضايا:", err);
    }
}