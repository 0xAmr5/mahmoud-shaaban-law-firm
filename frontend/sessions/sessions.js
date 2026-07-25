import { SessionsService, CasesService, AuthService, formatDateArabic } from '../api.js';

document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthService.getUser()) {
        window.location.href = "../login/index.html";
        return;
    }

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
        });
    }

    await loadLiveSessions();
    await populateCasesDropdown();

    const sessionModal = document.getElementById("sessionModal");
    const saveBtn = sessionModal?.querySelector(".btn-primary");

    if (saveBtn) {
        saveBtn.addEventListener("click", async (e) => {
            e.preventDefault();

            const courtBranch = sessionModal.querySelector("input[placeholder*='تقديم مذكرات دفاع']")?.value.trim() || "جلسة عامة";
            const sessionDateInput = sessionModal.querySelector("input[type='date']")?.value;
            const caseSelect = sessionModal.querySelector("#caseSelectSelect");
            const caseId = caseSelect?.value;

            if (!sessionDateInput) {
                alert("⚠️ برجاء تحديد تاريخ الجلسة!");
                return;
            }

            if (!caseId) {
                alert("⚠️ يرجى اختيار القضية المرتبطة بالجلسة!");
                return;
            }

            const dateObj = new Date(sessionDateInput);
            if (isNaN(dateObj.getTime())) {
                alert("⚠️ يرجى اختيار تاريخ صحيح للجلسة!");
                return;
            }

            saveBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
            saveBtn.disabled = true;

            try {
                await SessionsService.create({
                    sessionDate: dateObj.toISOString(),
                    courtBranch: courtBranch,
                    requirements: "متابعة الدفاع والطلبات",
                    caseId: caseId
                });

                alert("📅 تم إدراج الموعد بالأجندة بنجاح!");
                window.toggleModal('sessionModal', false);
                await loadLiveSessions();
            } catch (err) {
                alert("❌ خطأ أثناء حفظ الجلسة: " + err.message);
            } finally {
                saveBtn.innerHTML = "حفظ الموعد";
                saveBtn.disabled = false;
            }
        });
    }
});

async function loadLiveSessions() {
    const agendaList = document.querySelector(".agenda-list");
    if (!agendaList) return;

    try {
        const sessions = await SessionsService.getUpcoming();

        if (sessions && sessions.length > 0) {
            agendaList.innerHTML = sessions.map(session => {
                const sDate = new Date(session.sessionDate);
                const day = String(sDate.getDate()).padStart(2, '0');
                const month = String(sDate.getMonth() + 1).padStart(2, '0');

                return `
                    <div class="agenda-item" style="justify-content: space-between; flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
                            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; width: 55px; height: 55px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                                <span style="font-size: 16px; font-weight: 900; line-height:1;">${day}</span>
                                <small style="font-size: 10px; color: var(--gold);">${month}</small>
                            </div>
                            <div>
                                <h4 style="font-size: 14px; font-weight: 800;">${session.courtBranch || 'جلسة قضائية'}</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                                    <i class="fas fa-gavel"></i> قضية: ${session.case?.caseNumber || 'عام'} • 
                                    <i class="fas fa-user"></i> الموكل: ${session.case?.client?.name || 'غير محدد'} • 
                                    <i class="fas fa-calendar-alt"></i> ${formatDateArabic(session.sessionDate)}
                                </p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span class="badge-saas urgent">مجدولة</span>
                            <button class="action-icon-btn"><i class="fas fa-edit"></i></button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            agendaList.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">لا توجد جلسات قادمة مضافة بالأجندة.</p>`;
        }
    } catch (err) {
        console.error("خطأ جلب الجلسات:", err);
    }
}

async function populateCasesDropdown() {
    const sessionModal = document.getElementById("sessionModal");
    const caseGroup = sessionModal?.querySelector(".form-group-saas");
    if (!sessionModal || !caseGroup) return;

    try {
        const cases = await CasesService.getAll();
        let selectHtml = `<div class="form-group-saas"><label>اختر القضية المرتبطة</label><select id="caseSelectSelect">`;
        if (cases && cases.length > 0) {
            cases.forEach(c => {
                selectHtml += `<option value="${c.id}">${c.caseNumber} - ${c.client?.name || 'موكل عام'}</option>`;
            });
        } else {
            selectHtml += `<option value="">لا توجد قضايا متاحة (أضف قضية أولاً)</option>`;
        }
        selectHtml += `</select></div>`;
        caseGroup.insertAdjacentHTML('afterend', selectHtml);
    } catch (err) {
        console.error("خطأ جلب القضايا للمودال:", err);
    }
}