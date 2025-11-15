// Função genérica para alternar visibilidade da senha
function setupPasswordToggle(passwordId, toggleId) {
    const pwd = document.getElementById(passwordId);
    const toggle = document.getElementById(toggleId);
    if (!pwd || !toggle) return;

    toggle.addEventListener('click', function (){
        if (pwd.type === 'password'){
            pwd.type = 'text';
            toggle.src = 'icons/olho.png';
            toggle.alt = 'Ocultar senha';
            toggle.title = 'Ocultar senha';
        } else {
            pwd.type = 'password';
            toggle.src = 'icons/olho-fechado.png';
            toggle.alt = 'Mostrar senha';
            toggle.title = 'Mostrar senha';
        }
    });
}

// Inicializa os toggles de senha
document.addEventListener('DOMContentLoaded', function() {
    // Para página de login
    setupPasswordToggle('password', 'togglePassword');
    
    // Para página de cadastro
    setupPasswordToggle('senha', 'togglePassword');
    setupPasswordToggle('confirmaSenha', 'toggleConfirmPassword');
});

// Função para acordeão dos exercícios
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.exercicio-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isActive = content.classList.contains('active');
            
            // Fecha todos os painéis
            document.querySelectorAll('.exercicio-content').forEach(c => {
                c.classList.remove('active');
            });
            
            // Abre o painel clicado se não estava ativo
            if (!isActive) {
                content.classList.add('active');
            }
        });
    });
});

// Scroll suave para links da barra lateral
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sidebar a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(this.getAttribute('href'));
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Funções da página de perfil: abas, avatar preview, personalização e medidas
document.addEventListener('DOMContentLoaded', function () {
    // Abas
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (target) target.classList.add('active');
        });
    });

    // Personalização: avatar preview + salvar/load localStorage
    const personalizationForm = document.getElementById('personalizationForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const displayName = document.getElementById('displayName');
    const themeColor = document.getElementById('themeColor');

    function loadPersonalization() {
        try {
            const data = JSON.parse(localStorage.getItem('profile_personalization') || '{}');
            if (data.name) displayName.value = data.name;
            if (data.color) themeColor.value = data.color;
            if (data.avatar) avatarPreview.src = data.avatar;
            if (data.color) document.documentElement.style.setProperty('--cor-2', data.color);
        } catch (e) { /* ignore */ }
    }

    function readFileAsDataURL(file, cb) {
        const reader = new FileReader();
        reader.onload = () => cb(reader.result);
        reader.readAsDataURL(file);
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', () => {
            const f = avatarInput.files && avatarInput.files[0];
            if (f) {
                readFileAsDataURL(f, dataUrl => {
                    avatarPreview.src = dataUrl;
                });
            }
        });
    }

    if (personalizationForm) {
        personalizationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const avatarSrc = avatarPreview ? avatarPreview.src : '';
            const payload = {
                name: displayName.value || '',
                color: themeColor.value || '',
                avatar: avatarSrc
            };
            localStorage.setItem('profile_personalization', JSON.stringify(payload));
            if (payload.color) document.documentElement.style.setProperty('--cor-2', payload.color);
            alert('Personalização salva.');
        });
    }

    loadPersonalization();

    // Medidas: CRUD simples via localStorage
    const measurementForm = document.getElementById('measurementForm');
    const measurementsTableBody = document.getElementById('measurementsTableBody');

    function loadMeasurements() {
        return JSON.parse(localStorage.getItem('measurements') || '[]');
    }
    function saveMeasurements(arr) {
        localStorage.setItem('measurements', JSON.stringify(arr));
    }
    function renderMeasurements() {
        if (!measurementsTableBody) return;
        const arr = loadMeasurements();
        measurementsTableBody.innerHTML = '';
        arr.sort((a,b)=> b.date.localeCompare(a.date)).forEach((m, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${m.date}</td>
                            <td>${m.weight ?? ''}</td>
                            <td>${m.waist ?? ''}</td>
                            <td>${m.chest ?? ''}</td>
                            <td><button class="delete-measure" data-idx="${idx}">Excluir</button></td>`;
            measurementsTableBody.appendChild(tr);
        });
        // attach delete
        measurementsTableBody.querySelectorAll('.delete-measure').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-idx'), 10);
                const arr = loadMeasurements();
                arr.splice(idx, 1);
                saveMeasurements(arr);
                renderMeasurements();
            });
        });
    }

    if (measurementForm) {
        measurementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = document.getElementById('mDate').value;
            const weight = document.getElementById('mWeight').value;
            const waist = document.getElementById('mWaist').value;
            const chest = document.getElementById('mChest').value;
            if (!date || !weight) { alert('Preencha pelo menos data e peso.'); return; }
            const arr = loadMeasurements();
            arr.push({ date, weight, waist, chest });
            saveMeasurements(arr);
            renderMeasurements();
            measurementForm.reset();
        });
    }

    renderMeasurements();
});
