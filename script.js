// Переменная статуса админ-панели
let isAdminMode = false;

// Локальный бэкап базы данных (чтобы сайт работал на ПК без CORS)
const backupDatabase = [
    {
        "Hack ID": "4570345803245",
        "country": "Иран",
        "flag": "assets/iran.png",
        "owner": "Костя",
        "description": "Иран — теократическое унитарное государство. Главой государства является высший руководитель (рахбар), главой правительства — президент. Должность верховного руководителя занимает Моджтаба Хаменеи, президента — Масуд Пезешкиан."
    },
    {
        "Hack ID": "34765484335",
        "country": "Корея",
        "flag": "assets/koreya.png",
        "owner": "Костя",
        "description": "Коре́я — географическая территория (две страны), включающая Корейский полуостров и прилегающие острова и объединённая общим культурно-историческим наследием[1]. В прошлом единое государство. На севере имеет сухопутную границу с Китаем и Россией. К востоку от Кореи находятся Японские острова."
    }
];

// Функция активации админа из веб-консоли (F12)
window.admin = function(status) {
    if (status === 'enabled' || status === enabled) {
        isAdminMode = true;
        console.log("%c[SYSTEM]: Режим администратора активирован. Доступна секретная строка 'cmd'.", "color: #00ff41; font-weight: bold; font-size: 12px;");
        return "ADMIN_MODE_ENABLED";
    } else {
        isAdminMode = false;
        return "INVALID_COMMAND";
    }
};

// Поддержка команды setAdmin() без параметров
window.setAdmin = function() {
    isAdminMode = true;
    console.log("%c[SYSTEM]: Режим администратора активирован через setAdmin(). Доступна секретная строка 'cmd'.", "color: #00ff41; font-weight: bold; font-size: 12px;");
    return "ADMIN_MODE_ENABLED";
};

window.enabled = 'enabled'; // Фикс синтаксиса для вызова без кавычек

// Получение базы данных (с GitHub Pages или из бэкапа)
async function getDatabase() {
    try {
        const response = await fetch('hacks.json');
        if (response.ok) return await response.json();
    } catch (err) {
        // Локальный запуск на ПК
    }
    return backupDatabase;
}

// Проверка главного инпута
async function processHackId() {
    const inputId = document.getElementById('hack-id').value.trim();
    const statusDiv = document.getElementById('status-message');

    if (!inputId) return;

    // Секретный вход в CMD
    if (inputId.toLowerCase() === 'cmd') {
        if (isAdminMode) {
            statusDiv.classList.add('hidden');
            document.getElementById('search-screen').classList.add('hidden');
            document.getElementById('cmd-screen').classList.remove('hidden');
            document.getElementById('cmd-input').focus();
        } else {
            statusDiv.className = "status-msg error";
            statusDiv.innerText = "Не удалось найти ID";
            statusDiv.classList.remove('hidden');
        }
        return;
    }

    statusDiv.className = "status-msg loading";
    statusDiv.innerText = "Подключение к прокси... Чтение JSON...";
    statusDiv.classList.remove('hidden');

    await new Promise(resolve => setTimeout(resolve, 500));

    const hacksDatabase = await getDatabase();
    const foundHack = hacksDatabase.find(item => item["Hack ID"] === inputId);

    if (foundHack) {
        statusDiv.innerText = "Доступ получен! Разбор пакетов данных...";
        showResultScreen(foundHack);
    } else {
        statusDiv.className = "status-msg error";
        statusDiv.innerText = "Не удалось найти ID";
        statusDiv.classList.remove('hidden');
    }
}

// Отображение карточки страны
function showResultScreen(data) {
    document.getElementById('res-country').innerText = data.country;
    document.getElementById('res-owner').innerText = data.owner;
    document.getElementById('res-description').innerText = data.description;
    document.getElementById('res-flag').src = data.flag;
    document.getElementById('res-flag').alt = `Флаг ${data.country}`;

    setTimeout(() => {
        document.getElementById('search-screen').classList.add('hidden');
        document.getElementById('cmd-screen').classList.add('hidden');
        document.getElementById('result-screen').classList.remove('hidden');
        document.getElementById('status-message').classList.add('hidden');
    }, 400);
}

// Обработка встроенной командной строки (cmd)
async function executeCmdCommand() {
    const cmdInput = document.getElementById('cmd-input');
    const cmdLog = document.getElementById('cmd-log');
    const fullCommand = cmdInput.value.trim();

    if (!fullCommand) return;

    // Выводим саму команду в логи терминала
    cmdLog.innerHTML += `<br><span style="color: #88ff88;">> ${fullCommand}</span>`;

    const spaceIndex = fullCommand.indexOf(' ');
    const command = spaceIndex !== -1 ? fullCommand.substring(0, spaceIndex).toLowerCase() : fullCommand.toLowerCase();
    const argument = spaceIndex !== -1 ? fullCommand.substring(spaceIndex + 1).trim() : '';

    if (command === 'todo') {
        cmdLog.innerHTML += `<br>Обрабатываю...`;
        cmdLog.innerHTML += `<br><span style="color: #ffff33;">СДЕЛАНО</span>`;
    } 
    else if (command === 'openid') {
        if (!argument) {
            cmdLog.innerHTML += `<br><span style="color: #ff3333;">Ошибка: Укажите Hack ID. Пример: openid 1234</span>`;
        } else {
            cmdLog.innerHTML += `<br>Поиск ID ${argument} в базе данных...`;
            const database = await getDatabase();
            const hackData = database.find(item => item["Hack ID"] === argument);

            if (hackData) {
                cmdLog.innerHTML += `<br><span style="color: #ffff33;">ID найден. Перенаправление...</span>`;
                setTimeout(() => {
                    showResultScreen(hackData);
                    cmdInput.value = '';
                }, 600);
                return;
            } else {
                cmdLog.innerHTML += `<br><span style="color: #ff3333;">Ошибка: ID ${argument} не найден.</span>`;
            }
        }
    } 
    else if (command === 'deladmin') {
        isAdminMode = false;
        cmdLog.innerHTML += `<br><span style="color: #ff3333;">Права root аннулированы. Выход...</span>`;
        setTimeout(() => {
            closeCmd();
        }, 800);
    }
    else if (command === 'clear') {
        // Полностью очищаем экран логов терминала
        cmdLog.innerHTML = `Терминал очищен. Жду команд...<br>`;
    }
    else if (command === 'scan') {
        cmdLog.innerHTML += `<br>Сканирование доступных целей в базе данных...`;
        const database = await getDatabase();
        database.forEach(item => {
            cmdLog.innerHTML += `<br> -> [ID: <span style="color: #ffff33;">${item["Hack ID"]}</span>] Сектор: ${item.country}`;
        });
    }
    else if (command === 'help') {
        cmdLog.innerHTML += `<br><br><span style="color: #ffff33; font-weight: bold;">ДОСТУПНЫЕ КОМАНДЫ:</span><br>` +
                             ` - <span>help</span> : Вывести этот список инструкций<br>` +
                             ` - <span>scan</span> : Найти и вывести все Hack ID из базы данных<br>` +
                             ` - <span>todo [текст]</span> : Отправить задачу на обработку симуляции<br>` +
                             ` - <span>openid [ID]</span> : Форсировать взлом и открыть карточку страны<br>` +
                             ` - <span>clear</span> : Полностью стереть логи с экрана терминала<br>` +
                             ` - <span>deladmin</span> : Сбросить root-права администратора и выйти<br>`;
    }
    else {
        cmdLog.innerHTML += `<br>Неизвестная команда: "${command}". Введите <span style="color: #ffff33;">help</span> для списка доступных директив.`;
    }

    cmdLog.scrollTop = cmdLog.scrollHeight;
    cmdInput.value = '';
}

// Закрыть окно CMD
function closeCmd() {
    document.getElementById('cmd-input').value = '';
    document.getElementById('cmd-screen').classList.add('hidden');
    document.getElementById('search-screen').classList.remove('hidden');
}

// Сброс и возврат в поиск ID
function resetTerminal() {
    document.getElementById('hack-id').value = '';
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('search-screen').classList.remove('hidden');
}

// Привязка клавиши Enter
document.getElementById('hack-id').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') processHackId();
});

document.getElementById('cmd-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') executeCmdCommand();
});
