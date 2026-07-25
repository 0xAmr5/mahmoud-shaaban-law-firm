import { AuthService } from '../api.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const submitBtn = document.getElementById("submitBtn");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const identifier = emailInput.value.trim(); // يقبل إيميل أو رقم موبايل
            const password = passwordInput.value;

            if (!identifier || !password) {
                alert("⚠️ يرجى إدخال البريد أو رقم الموبايل وكلمة المرور!");
                return;
            }

            submitBtn.innerHTML = `جاري التوثيق... <i class="fas fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;

            try {
                await AuthService.login(identifier, password);
                alert("تم تسجيل الدخول بنجاح! 🎉");
                window.location.href = "../dashboard/dashboard.html";
            } catch (error) {
                alert("❌ خطأ في تسجيل الدخول: " + error.message);
                submitBtn.innerHTML = `تسجيل الدخول <i class="fas fa-arrow-left"></i>`;
                submitBtn.disabled = false;
            }
        });
    }
});