const userId = localStorage.getItem('myBoardUserId');
if (!userId) window.location.href = 'auth.html';

async function loadStats() {
    const res = await fetch(`http://localhost:8080/api/tasks/${userId}`);

    if (res.ok) {
        const tasks = await res.json();

        const total = tasks.length;
        const done = tasks.filter(t => t.status === 'done').length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statDone').textContent = done;
        document.getElementById('statProgress').textContent = percent + '%';

        document.getElementById('progressBar').style.width = percent + '%';
    }
}

loadStats();