export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://mahmoud-shaaban-law-firm-production.up.railway.app';
export function formatDateArabic(dateString) {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`; 
}

window.toggleModal = function(modalId, show) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
        if (show) {
            modalEl.classList.add("active");
            modalEl.style.opacity = "1";
            modalEl.style.visibility = "visible";
        } else {
            modalEl.classList.remove("active");
            modalEl.style.opacity = "0";
            modalEl.style.visibility = "hidden";
        }
    }
};

window.openModal = function() {
    const modal = document.querySelector('.modal-overlay') || document.getElementById('paymentModal');
    if (modal) modal.classList.add('active');
};

window.closeModal = function() {
    const modal = document.querySelector('.modal-overlay') || document.getElementById('paymentModal');
    if (modal) modal.classList.remove('active');
};

export async function apiFetch(endpoint, method = 'GET', body = null, needsAuth = true) {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('access_token');
    
    if (needsAuth) {
        if (!token) {
            window.location.href = '../login/index.html';
            return;
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'حدث خطأ في الاتصال بالباك إند');
        }

        return data;
    } catch (err) {
        console.error(`❌ API Error [${endpoint}]:`, err.message);
        throw err;
    }
}

export const AuthService = {
    async login(email, password) {
        const response = await apiFetch('/auth/login', 'POST', { email, password }, false);
        if (response.access_token) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user_info', JSON.stringify(response.user));
            localStorage.setItem('office_id', response.user.officeId || response.user.id);
            localStorage.setItem('sb-user-id', response.user.id);
        }
        return response;
    },
    logout() {
        localStorage.clear();
        window.location.href = '../login/index.html';
    },
    getUser() {
        const user = localStorage.getItem('user_info');
        return user ? JSON.parse(user) : null;
    },
    getOfficeId() {
        return localStorage.getItem('office_id') || '';
    }
};

export const UsersService = {
    async createLawyer(lawyerData) {
        const officeId = AuthService.getOfficeId();
        return await apiFetch('/users/lawyer', 'POST', { ...lawyerData, officeId });
    }
};

export const ClientsService = {
    async getAll() {
        return await apiFetch(`/clients?officeId=${AuthService.getOfficeId()}`);
    },
    async create(clientData) {
        return await apiFetch('/clients', 'POST', { ...clientData, officeId: AuthService.getOfficeId() });
    }
};

export const ArchiveService = {
    async uploadFile(file) {
        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/archive/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'خطأ في رفع الملف');
        return data;
    }
};

export const CasesService = {
    async getAll() {
        return await apiFetch(`/cases?officeId=${AuthService.getOfficeId()}`);
    },
    async create(caseData) {
        return await apiFetch('/cases', 'POST', { ...caseData, officeId: AuthService.getOfficeId() });
    }
};

export const SessionsService = {
    async getUpcoming() {
        return await apiFetch(`/sessions/upcoming?officeId=${AuthService.getOfficeId()}`);
    },
    async create(sessionData) {
        return await apiFetch('/sessions', 'POST', sessionData);
    }
};