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

// Функция вывода текста в терминал CMD
function printOnCmd(text) {
    const cmdLog = document.getElementById('cmd-log');
    cmdLog.innerHTML += `<br>${text}`;
    cmdLog.scrollTop = cmdLog.scrollHeight; // Автоматический скролл вниз
}

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

// ==========================================
// ФУНКЦИИ ДЛЯ ХАКЕРСКИХ КОМАНД TERMINALA
// ==========================================

function cmdHelp() {
    printOnCmd(`<br><span style="color: #ffff33; font-weight: bold;">ДОСТУПНЫЕ КОМАНДЫ:</span><br>` +
               ` - <span>help</span> : Вывести этот список инструкций<br>` +
               ` - <span>scan</span> : Найти и вывести все Hack ID из базы данных<br>` +
               ` - <span>todo [текст]</span> : Отправить задачу на обработку симуляции<br>` +
               ` - <span>openid [ID]</span> : Форсировать взлом и открыть карточку страны<br>` +
               ` - <span>clear</span> : Полностью стереть логи с экрана терминала<br>` +
               ` - <span>deladmin</span> : Сбросить root-права администратора и выйти<br>`);
}

async function cmdScan() {
    printOnCmd(`Сканирование доступных целей в базе данных...`);
    const database = await getDatabase();
    database.forEach(item => {
        printOnCmd(` -> [ID: <span style="color: #ffff33;">${item["Hack ID"]}</span>] Сектор: ${item.country}`);
    });
}

function cmdTodo(argument) {
    printOnCmd(`Обрабатываю задачу: "${argument || 'Без описания'}"...`);
    printOnCmd(`<span style="color: #ffff33;">СДЕЛАНО</span>`);
}

async function cmdOpenId(argument) {
    if (!argument) {
        printOnCmd(`<span style="color: #ff3333;">Ошибка: Укажите Hack ID. Пример: openid 1234</span>`);
        return;
    }
    printOnCmd(`Поиск ID ${argument} в зашифрованных секторах базы...`);
    const database = await getDatabase();
    const hackData = database.find(item => item["Hack ID"] === argument);

    if (hackData) {
        printOnCmd(`<span style="color: #ffff33;">ID найден. Инициализация перенаправления экрана...</span>`);
        setTimeout(() => {
            showResultScreen(hackData);
            document.getElementById('cmd-input').value = '';
        }, 500);
    } else {
        printOnCmd(`<span style="color: #ff3333;">Ошибка: ID ${argument} не зарегистрирован в системе.</span>`);
    }
}

function cmdClear() {
    const cmdLog = document.getElementById('cmd-log');
    cmdLog.innerHTML = `Терминал очищен. Жду команд...<br>`;
}

function cmdDelAdmin() {
    isAdminMode = false;
    printOnCmd(`<span style="color: #ff3333;">Права root аннулированы. Закрытие терминала...</span>`);
    setTimeout(() => {
        closeCmd();
    }, 600);
}

// ==========================================
// СПИСОК РАЗРЕШЕННЫХ КОМАНД (МАРШРУТИЗАТОР)
// ==========================================
const allowedCommands = {
    'help': cmdHelp,
    'scan': cmdScan,
    'todo': cmdTodo,
    'openid': cmdOpenId,
    'clear': cmdClear,
    'deladmin': cmdDelAdmin
};

// Главный обработчик встроенной командной строки
function executeCmdCommand() {
    const cmdInput = document.getElementById('cmd-input');
    const fullCommand = cmdInput.value.trim();

    if (!fullCommand) return;

    // Сразу пишем саму команду, которую ввел пользователь
    printOnCmd(`<span style="color: #88ff88;">> ${fullCommand}</span>`);

    // Извлекаем саму команду и аргументы
    const spaceIndex = fullCommand.indexOf(' ');
    const command = spaceIndex !== -1 ? fullCommand.substring(0, spaceIndex).toLowerCase() : fullCommand.toLowerCase();
    const argument = spaceIndex !== -1 ? fullCommand.substring(spaceIndex + 1).trim() : '';

    // Ищем команду в списке разрешенных команд
    if (command in allowedCommands) {
        // Если команда найдена, вызываем привязанную к ней функцию
        allowedCommands[command](argument);
    } else {
        // Если команды нет в списке разрешенных
        printOnCmd(`Неизвестная команда: "${command}". Введите <span style="color: #ffff33;">help</span> для получения списка.`);
    }

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
