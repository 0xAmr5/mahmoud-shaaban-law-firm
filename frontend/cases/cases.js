import { CasesService, ClientsService, AuthService } from '../api.js';

document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthService.getUser()) {
        window.location.href = "../login/index.html";
        return;
    }

    await loadCases();

    const caseModal = document.getElementById("caseModal");
    const saveBtn = caseModal?.querySelector(".btn-primary");

    if (saveBtn) {
        saveBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const inputs = caseModal.querySelectorAll("input[type='text']");
            const caseNumber = inputs[0]?.value.trim();
            const court = inputs[1]?.value.trim();

            if (!caseNumber || !court) {
                alert("⚠️ يرجى إدخال رقم الدعوى والمحكمة كاملين!");
                return;
            }

            saveBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
            saveBtn.disabled = true;

            try {
                const clients = await ClientsService.getAll();
                if (!clients || clients.length === 0) {
                    alert("⚠️ يجب إضافة موكل واحد على الأقل من صفحة الموكلين أولاً قبل إنشاء قضية!");
                    saveBtn.innerHTML = "حفظ الملف";
                    saveBtn.disabled = false;
                    return;
                }

                await CasesService.create({
                    caseNumber,
                    title: `قضية رقم ${caseNumber}`,
                    court,
                    clientId: clients[0].id
                });

                alert("⚖️ تم إضافة القضية بنجاح!");
                window.toggleModal('caseModal', false);
                inputs[0].value = "";
                inputs[1].value = "";
                await loadCases();
            } catch (err) {
                alert("❌ خطأ أثناء إضافة القضية: " + err.message);
            } finally {
                saveBtn.innerHTML = "حفظ الملف";
                saveBtn.disabled = false;
            }
        });
    }
});

async function loadCases() {
    const tableBody = document.querySelector(".saas-table tbody");
    if (!tableBody) return;

    try {
        const cases = await CasesService.getAll();
        if (cases && cases.length > 0) {
            tableBody.innerHTML = cases.map(c => `
                <tr>
                    <td><strong>${c.caseNumber}</strong></td>
                    <td>${c.client?.name || 'غير محدد'}</td>
                    <td><span style="color: var(--text-muted);">عام</span></td>
                    <td>${c.court || 'غير محدد'}</td>
                    <td><span class="badge-saas active">${c.status || 'نشط'}</span></td>
                    <td>
                        <button class="action-icon-btn"><i class="fas fa-eye"></i></button>
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:20px;">لا توجد قضايا مسجلة حالياً.</td></tr>`;
        }
    } catch (err) {
        console.error("خطأ جلب القضايا:", err);
    }
}