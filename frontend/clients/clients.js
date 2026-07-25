import { ClientsService, AuthService } from '../api.js';

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

    await loadClients();

    const clientModal = document.getElementById("clientModal");
    const saveBtn = clientModal?.querySelector(".btn-primary");

    if (saveBtn) {
        saveBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const nameInput = clientModal.querySelector("input[type='text']");
            const clientName = nameInput?.value.trim();

            if (!clientName) {
                alert("⚠️ برجاء إدخال اسم الموكل!");
                return;
            }

            saveBtn.innerHTML = `جاري الحفظ... <i class="fas fa-spinner fa-spin"></i>`;
            saveBtn.disabled = true;

            try {
                await ClientsService.create({ 
                    name: clientName,
                    phone: "01000000000" // حقل الهاتف لتفادي إيرور Prisma
                });
                alert("🎉 تم إضافة الموكل بنجاح!");
                
                window.toggleModal('clientModal', false);
                nameInput.value = "";
                await loadClients();
            } catch (err) {
                alert("❌ خطأ أثناء الإضافة: " + err.message);
            } finally {
                saveBtn.innerHTML = "حفظ البيانات";
                saveBtn.disabled = false;
            }
        });
    }
});

async function loadClients() {
    const gridLayout = document.querySelector(".saas-grid-layout");
    if (!gridLayout) return;

    try {
        const clients = await ClientsService.getAll();
        if (clients && clients.length > 0) {
            gridLayout.innerHTML = clients.map(client => `
                <div class="saas-card-item">
                    <div class="card-top-info">
                        <div class="avatar-box">${client.name ? client.name.charAt(0) : 'م'}</div>
                        <span class="badge-saas active">نشط</span>
                    </div>
                    <h4>${client.name}</h4>
                    <div class="card-details-box">
                        <div class="card-detail-row"><i class="fas fa-phone"></i> <span>${client.phone || 'غير مسجل'}</span></div>
                    </div>
                    <div class="card-actions-row">
                        <a href="../archive/archive.html" class="btn-action" style="text-decoration: none;"><i class="fas fa-folder-open"></i> الأرشيف</a>
                        <a href="../lawyers/lawyers.html" class="btn-action" style="text-decoration: none;"><i class="fas fa-comments"></i> الشات</a>
                    </div>
                </div>
            `).join('');
        } else {
            gridLayout.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-muted); padding: 20px;">لا يوجد موكلين مسجلين حالياً.</p>`;
        }
    } catch (err) {
        console.error("خطأ جلب الموكلين:", err);
    }
}