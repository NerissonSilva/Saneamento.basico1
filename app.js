// Use relative URLs since frontend and backend are on the same domain
const API_URL = '/api';

async function loginWithGoogle() {
    window.location.href = `${API_URL}/auth/google`;
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/user`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            showUserInfo(data.user);
        } else {
            showLoginSection();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginSection();
    }
}

function showUserInfo(user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'block';
    
    document.getElementById('userName').textContent = user.displayName;
    document.getElementById('userEmail').textContent = user.emails?.[0]?.value || '';
    document.getElementById('userPhoto').src = user.photos?.[0]?.value || '';
}

function showLoginSection() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('userSection').style.display = 'none';
}

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        showLoginSection();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Check for login success in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('login') === 'success') {
    checkAuth();
    window.history.replaceState({}, document.title, '/');
} else if (urlParams.get('login') === 'failed') {
    alert('Login falhou. Tente novamente.');
    window.history.replaceState({}, document.title, '/');
} else {
    checkAuth();
}
