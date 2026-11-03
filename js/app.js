/* ================= ВКЛАДКИ ================= */
function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

/* ================= ПОКАЗ ОТВЕТОВ ================= */
function toggleAnswer(id) {
    const el = document.getElementById(id);
    const btn = event.target;
    if (el.style.display === 'none' || el.style.display === '') {
        el.style.display = 'block';
        btn.textContent = 'Скрыть ответ';
    } else {
        el.style.display = 'none';
        btn.textContent = 'Показать ответ';
    }
}

/* ================= РЕГИСТРАЦИЯ SERVICE WORKER ================= */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js', { scope: './' })
            .then(reg => console.log('SW зарегистрирован:', reg.scope))
            .catch(err => console.error('Ошибка SW:', err));
    });
}

/* ================= УСТАНОВКА PWA ================= */
let deferredPrompt;
const installBtn = document.getElementById('install-pwa-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'block';
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Установка PWA:', outcome);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
}

window.addEventListener('appinstalled', () => {
    console.log('PWA установлено');
    if (installBtn) installBtn.style.display = 'none';
});

/* ================= ОТПРАВКА ФОРМЫ В GOOGLE ТАБЛИЦЫ =================
   ВАЖНО: замените YOUR_APPS_SCRIPT_URL на URL вашего веб-приложения Google Apps Script.
   Инструкция — в ответе ниже.
*/
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

function setupHomeworkForm() {
    const form = document.getElementById('homework-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.btn-submit');
        const msg = document.getElementById('form-message');
        const formData = new FormData(form);

        // Преобразуем FormData в объект
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        data.timestamp = new Date().toISOString();

        btn.disabled = true;
        btn.textContent = 'Отправка...';
        if (msg) { msg.className = 'form-message'; msg.style.display = 'none'; }

        try {
            // Используем URLSearchParams + no-cors — самый совместимый способ для Google Apps Script
            const params = new URLSearchParams();
            Object.keys(data).forEach(k => params.append(k, data[k]));

            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Важно: иначе CORS-ошибка
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            // При mode: 'no-cors' ответ не читается, но данные обычно доходят.
            // Показываем успех, если не было исключения.
            if (msg) {
                msg.textContent = '✅ Работа отправлена! Преподаватель увидит её в таблице.';
                msg.className = 'form-message success';
            }
            form.reset();
        } catch (err) {
            console.error('Ошибка отправки:', err);
            if (msg) {
                msg.textContent = '❌ Не удалось отправить. Проверьте интернет и попробуйте снова.';
                msg.className = 'form-message error';
            }
        } finally {
            btn.disabled = false;
            btn.textContent = 'Отправить работу';
        }
    });
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    setupHomeworkForm();
});
