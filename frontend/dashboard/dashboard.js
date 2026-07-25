import { AuthService, CasesService, ClientsService, SessionsService } from '../api.js';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. تشغيل السايدبار للموبايل
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
        });
    }

    // 2. التحقق من أمان الجلسة
    const user = AuthService.getUser();
    if (!user) {
        window.location.href = "../login/index.html";
        return;
    }

    // تحديث الاسم بالهيدر
    const adminNameLabel = document.querySelector(".user-profile .info h4");
    if (adminNameLabel) adminNameLabel.innerText = user.name || 'مدير النظام';

    // 3. تحميل الإحصائيات بالجلسات والقضايا والموكلين
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        const [cases, clients, upcomingSessions] = await Promise.all([
            CasesService.getAll().catch(() => []),
            ClientsService.getAll().catch(() => []),
            SessionsService.getUpcoming().catch(() => [])
        ]);

        // تحديث العدادات
        const caseH3 = document.querySelector(".stat-card:nth-child(1) h3");
        const clientH3 = document.querySelector(".stat-card:nth-child(2) h3");
        const sessionH3 = document.querySelector(".stat-card:nth-child(3) h3");

        if (caseH3) caseH3.innerText = `${cases.length || 0} قضية`;
        if (clientH3) clientH3.innerText = `${clients.length || 0} موكل`;
        if (sessionH3) sessionH3.innerText = `${upcomingSessions.length || 0} جلسات`;

        // عرض الجلسات القادمة بالأجندة
        const agendaContainer = document.querySelector(".agenda-list");
        if (agendaContainer && upcomingSessions.length > 0) {
            agendaContainer.innerHTML = upcomingSessions.map(session => {
                const date = new Date(session.sessionDate);
                const day = date.getDate();
                const monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                const month = monthNames[date.getMonth()];

                return `
                    <div class="agenda-item" style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; width: 50px; height: 50px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                                <span style="font-size: 16px; font-weight: 900; line-height:1;">${day}</span>
                                <small style="font-size: 10px; color: var(--gold);">${month}</small>
                            </div>
                            <div>
                                <h4 style="font-size: 14px; font-weight: 800;">${session.courtBranch || 'جلسة قضائية'}</h4>
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">قضية: ${session.case?.caseNumber || ''} - موكل: ${session.case?.client?.name || 'عام'}</p>
                            </div>
                        </div>
                        <span class="badge-saas" style="background: rgba(239, 68, 68, 0.1); color: var(--red);">مجدولة</span>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error("خطأ جلب بيانات الداشبورد:", err);
    }
}