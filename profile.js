const userId = localStorage.getItem('myBoardUserId');
if (!userId) window.location.href = 'auth.html';

const themeBtn = document.getElementById('themeBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const avatarImg = document.getElementById('avatarImg');
const openEditBtn = document.getElementById('openEditBtn');
const editModal = document.getElementById('editModal');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const ageInput = document.getElementById('ageInput');

const displayGender = document.getElementById('displayGender');
const displayAge = document.getElementById('displayAge');
const displayGoal = document.getElementById('displayGoal');

let profileState = {
    avatar: 'лиса',
    gender: 'Мужской',
    age: '18',
    goal: 'Ударный режим 7 дней'
};

async function loadProfile() {
    try {
        const res = await fetch(`http://localhost:8080/api/users/${userId}`);
        if (res.ok) {
            const data = await res.json();
            userEmail.textContent = data.email;

            if (data.avatar) profileState.avatar = data.avatar;
            if (data.gender) profileState.gender = data.gender;
            if (data.age) profileState.age = data.age;
            if (data.goal) profileState.goal = data.goal;

            updateUI();
        }
    } catch (err) {
        console.error('Ошибка загрузки профиля', err);
    }
}

function updateUI() {
    avatarImg.src = `${profileState.avatar}.png`;
    displayGender.textContent = profileState.gender;
    displayAge.textContent = profileState.age + ' лет';
    displayGoal.textContent = profileState.goal;
    ageInput.value = profileState.age;
}

document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = btn.getAttribute('data-type');
        const value = btn.getAttribute('data-value');

        if (type === 'avatar' || type === 'gender' || type === 'goal') {
            document.querySelectorAll(`.option-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            profileState[type] = value;
        }
    });
});

ageInput.addEventListener('input', (e) => {
    profileState.age = e.target.value;
});

openEditBtn.addEventListener('click', () => {
    document.querySelectorAll('.option-btn').forEach(btn => {
        const type = btn.getAttribute('data-type');
        const value = btn.getAttribute('data-value');
        if (profileState[type] === value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    editModal.classList.remove('hidden');
});

cancelEditBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
});

saveProfileBtn.addEventListener('click', async () => {
    saveProfileBtn.textContent = 'Сохранение...';

    try {
        const res = await fetch(`http://localhost:8080/api/users/${userId}/avatar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                avatar: profileState.avatar,
                gender: profileState.gender,
                age: profileState.age,
                goal: profileState.goal
            })
        });

        if (res.ok) {
            editModal.classList.add('hidden');
            updateUI();
            alert('Профиль сохранен!');
        } else {
            alert('Ошибка при сохранении');
        }
    } catch (err) {
        alert('Сервер недоступен');
    } finally {
        saveProfileBtn.textContent = 'Сохранить';
    }
});

if (themeBtn) {
    if (document.body.classList.contains('dark')) themeBtn.textContent = 'Выключить';
    else themeBtn.textContent = 'Включить';

    themeBtn.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark');
        if (isDark) {
            localStorage.setItem('myBoardTheme', 'dark');
            themeBtn.textContent = 'Выключить';
        } else {
            localStorage.setItem('myBoardTheme', 'light');
            themeBtn.textContent = 'Включить';
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('myBoardUserId');
        localStorage.removeItem('myBoardEmail');
        window.location.href = 'auth.html';
    });
}

loadProfile();