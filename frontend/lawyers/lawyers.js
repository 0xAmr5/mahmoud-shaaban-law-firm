import { AuthService, ClientsService, UsersService, apiFetch, formatDateArabic } from '../api.js';

document.addEventListener("DOMContentLoaded", async () => {
    if (!AuthService.getUser()) {
        window.location.href = "../login/index.html";
        return;
    }

    // 1. تشغيل السايدبار للموبايل
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.toggle("active");
        });
    }

    // 2. تشغيل الساعة الحية
    setInterval(() => {
        const liveClock = document.getElementById("liveClock");
        if (liveClock) liveClock.innerText = new Date().toLocaleTimeString('ar-EG');
    }, 1000);

    // 3. أزرار إثبات الحضور والانصراف
    document.getElementById("checkInBtn")?.addEventListener("click", () => {
        alert(`✅ تم إثبات حضورك بنجاح في تمام الساعة: ${new Date().toLocaleTimeString('ar-EG')}`);
    });

    document.getElementById("checkOutBtn")?.addEventListener("click", () => {
        alert(`🔴 تم إثبات انصرافك بنجاح في تمام الساعة: ${new Date().toLocaleTimeString('ar-EG')}`);
    });

    // 4. تحميل المحامين والموكلين ديناميكياً من الباك إند
    await loadLawyersAndClients();

    // 5. إضافة محامي جديد للمكتب
    const saveLawyerBtn = document.getElementById("saveLawyerBtn");
    saveLawyerBtn?.addEventListener("click", async (e) => {
        e.preventDefault();

        const name = document.getElementById("lawyerNameInput").value.trim();
        const email = document.getElementById("lawyerEmailInput").value.trim().toLowerCase();
        const phone = document.getElementById("lawyerPhoneInput").value.trim();
        const password = document.getElementById("lawyerPasswordInput").value;

        if (!name || !email || !phone || !password) {
            alert("⚠️ برجاء إدخال كافة البيانات المطلوبة للمحامي!");
            return;
        }

        if (!email.endsWith("@gmail.com")) {
            alert("⚠️ يجب أن يكون بريد المحامي بنطاق @gmail.com!");
            return;
        }

        saveLawyerBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
        saveLawyerBtn.disabled = true;

        try {
            await UsersService.createLawyer({ name, email, phone, password });
            alert("🎉 تم تسجيل وتفعيل حساب المحامي بنجاح!");
            
            window.toggleModal('addLawyerModal', false);

            document.getElementById("lawyerNameInput").value = "";
            document.getElementById("lawyerEmailInput").value = "";
            document.getElementById("lawyerPhoneInput").value = "";
            document.getElementById("lawyerPasswordInput").value = "";

            await loadLawyersAndClients();
        } catch (err) {
            alert("❌ خطأ أثناء إضافة المحامي: " + err.message);
        } finally {
            saveLawyerBtn.innerHTML = `<i class="fas fa-check"></i> حفظ بيانات المحامي`;
            saveLawyerBtn.disabled = false;
        }
    });

    // 6. إرسال التكليف (إضافة للشات + فتح واتساب مباشر)
    const confirmSendTaskBtn = document.getElementById("confirmSendTaskBtn");
    confirmSendTaskBtn?.addEventListener("click", (e) => {
        e.preventDefault();

        const lawyerSelect = document.getElementById("lawyerSelect");
        const taskTitle = document.getElementById("taskTitleInput").value.trim();
        const dueDate = document.getElementById("taskDueDateInput").value;

        const lawyerName = lawyerSelect.options[lawyerSelect.selectedIndex]?.text || "المحامي";
        const lawyerPhone = lawyerSelect.value;

        if (!lawyerPhone) {
            alert("⚠️ هذا المحامي ليس لديه رقم هاتف مسجل بالنظام لإرسال الواتساب!");
            return;
        }

        if (!taskTitle || !dueDate) {
            alert("⚠️ يرجى ملء تفاصيل المهمة وتاريخ الاستحقاق!");
            return;
        }

        const formattedDate = formatDateArabic(dueDate);

        const chatMessagesArea = document.getElementById("chatMessagesArea");
        if (chatMessagesArea) {
            chatMessagesArea.innerHTML += `
                <div style="background: rgba(212,175,55,0.08); border: 1px dashed var(--gold); padding: 15px; border-radius: 12px; margin: 10px 0; max-width: 85%;">
                    <h5 style="color:var(--gold); font-size:14px; margin-bottom:5px;"><i class="fas fa-thumbtack"></i> تكليف قضائي موجه لـ: ${lawyerName}</h5>
                    <p style="font-size:13px; color:white;">${taskTitle}</p>
                    <small style="color:var(--red); display:block; margin-top:5px; font-weight:700;">تاريخ الاستحقاق: ${formattedDate}</small>
                </div>
            `;
            chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
        }

        const whatsappMsg = `⚖️ *تكليف قضائي جديد*\n👤 *المكلف:* ${lawyerName}\n📌 *المهمة:* ${taskTitle}\n📅 *تاريخ الاستحقاق:* ${formattedDate}`;
        const whatsappUrl = `https://wa.me/${lawyerPhone}?text=${encodeURIComponent(whatsappMsg)}`;
        
        window.open(whatsappUrl, '_blank');
        window.toggleModal('taskModal', false);
        
        document.getElementById("taskTitleInput").value = "";
        document.getElementById("taskDueDateInput").value = "";
    });
});

async function loadLawyersAndClients() {
    const lawyersGroup = document.getElementById("lawyersGroup");
    const clientsGroup = document.getElementById("clientsGroup");
    const lawyerSelect = document.getElementById("lawyerSelect");

    try {
        const officeId = AuthService.getOfficeId();
        const lawyersList = await apiFetch(`/users/lawyers?officeId=${officeId}`).catch(() => []);

        if (lawyersList && lawyersList.length > 0) {
            if (lawyersGroup) {
                lawyersGroup.innerHTML = lawyersList.map(lawyer => `
                    <div class="chat-user-item-row" data-id="${lawyer.id}">
                        <div class="avatar-box">${lawyer.name ? lawyer.name.charAt(0) : 'م'}</div>
                        <div>
                            <h4>${lawyer.name} ${lawyer.role === 'ADMIN' ? '(مدير المكتب)' : '(محامي)'}</h4>
                            <p style="font-size:11px; color:var(--green);">متصل الآن</p>
                        </div>
                    </div>
                `).join('');
            }

            if (lawyerSelect) {
                lawyerSelect.innerHTML = lawyersList.map(lawyer => {
                    const cleanPhone = lawyer.phone ? lawyer.phone.replace(/[^0-9]/g, '') : '';
                    return `<option value="${cleanPhone}">${lawyer.name} (${lawyer.phone || 'بدون رقم'})</option>`;
                }).join('');
            }
        } else {
            if (lawyerSelect) lawyerSelect.innerHTML = `<option value="">لا يوجد محامين فرعيين مسجلين بالمكتب</option>`;
            if (lawyersGroup) lawyersGroup.innerHTML = `<p style="padding:10px; color:var(--text-muted); font-size:12px;">لا يوجد محامين مسجلين.</p>`;
        }

        const clients = await ClientsService.getAll().catch(() => []);
        if (clientsGroup && clients && clients.length > 0) {
            clientsGroup.innerHTML = clients.map(c => `
                <div class="chat-user-item-row" data-id="${c.id}">
                    <div class="avatar-box" style="color:var(--gold);">${c.name ? c.name.charAt(0) : 'م'}</div>
                    <div>
                        <h4>${c.name}</h4>
                        <p style="font-size:11px; color:var(--text-muted);">${c.phone || 'موكل بالمكتب'}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error("خطأ جلب بيانات الفريق والموكلين:", err);
    }
}