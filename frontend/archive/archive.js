import { ArchiveService, AuthService } from '../api.js';

document.addEventListener("DOMContentLoaded", () => {
    if (!AuthService.getUser()) {
        window.location.href = "../login/index.html";
        return;
    }

    const uploadBtn = document.querySelector(".welcome-section .btn-primary");
    
    // إنشاء Input مخفي لاختيار الملفات عند الضغط على زرار "رفع مستند جديد"
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.doc,.docx,.xls,.xlsx";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
            fileInput.click();
        });
    }

    fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadBtn.innerHTML = `جاري الرفع... <i class="fas fa-spinner fa-spin"></i>`;
        uploadBtn.disabled = true;

        try {
            const res = await ArchiveService.uploadFile(file);
            alert(`🎉 ${res.message}\nحجم الملف: ${res.size}`);
            
            // إضافة الملف لايف في قائمة الأرشيف
            addFileToUI(res.originalName, res.size, file.name.split('.').pop().toLowerCase());
        } catch (err) {
            alert("❌ خطأ أثناء رفع الملف: " + err.message);
        } finally {
            uploadBtn.innerHTML = `<i class="fas fa-upload"></i> رفع مستند جديد`;
            uploadBtn.disabled = false;
            fileInput.value = "";
        }
    });
});

function addFileToUI(fileName, sizeStr, ext) {
    const agendaList = document.querySelector(".agenda-list");
    if (!agendaList) return;

    let iconClass = "fa-file-pdf";
    let iconColor = "var(--red)";

    if (ext.includes("doc")) {
        iconClass = "fa-file-word";
        iconColor = "var(--blue)";
    } else if (ext.includes("xls")) {
        iconClass = "fa-file-excel";
        iconColor = "var(--green)";
    }

    agendaList.insertAdjacentHTML("afterbegin", `
        <div class="agenda-item" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 45px; height: 45px; background: rgba(255,255,255,0.05); color: ${iconColor}; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 20px;">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div>
                    <h4 style="font-size: 14px; font-weight: 800;">${fileName}</h4>
                    <p style="font-size: 11px; color: var(--text-muted);">تم الرفع الآن • حجم الملف: ${sizeStr}</p>
                </div>
            </div>
            <button class="btn-primary" style="padding: 8px 12px; font-size: 12px;"><i class="fas fa-download"></i> تحميل</button>
        </div>
    `);
}