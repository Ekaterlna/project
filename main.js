"use strict;"
/*создать форму для ввода имени и возраста человека.
    на форме добавить кнопки сохранить, самый старый, самый молодой
 Введенные данные должны сохраняться произвольно
 */
/*Добавить кнопки сохранить  на сервере, загрузить с сервера. Для сервера использовать модуль экспресс нод js. сайт может открываться сразу с сервера
либо данные с сайта могут отправляться на сервер
1. Запустить сервер. Проверить, что он работает
2. Попробовать сохранить файл на комп
3. Отправить данные с основного сайта и сохранить их на сервере


создать папку с проектом 
проинициализировать в ней новый проект
установить экспресс
создать файл индексjs написать код для запуска тестового сервера
запустить тестовый сервер
сохранить тестовый файл на комп при обращении к серверу 

как отправить данные с сайта на сервер

*/

let users = [];


$('#buttSave').attr("disabled", "disabled");

function checkParams() {
    let name = document.getElementById('name').value;
    let years = new Date(document.getElementById('years').value);
    let save = document.getElementById('buttSave');
    let todaydate = new Date();
    if (years > todaydate) {
        return true,
            document.getElementById('buttSave').disabled = true,
            alert('Введите дату меньше или равную ' + todaydate.toLocaleDateString('en-US'))
    }
    if (name.length != 0 && years.length != 0) {
        save.removeAttribute("disabled");
    }


}

function ucFirst(str) {
    if (!str) return str;
    return str[0].toUpperCase() + str.slice(1);
}


document.getElementById('buttSave').onclick = function() {
    // users.concat(users)
    let name = document.getElementById('name').value;
    let dateYears = new Date(document.getElementById('years').value);
    let nowYears = new Date();
    let result = (nowYears - dateYears) / 31536000000;
    let years = result;
    name = ucFirst(name);
    if (users.includes(name)) {
        return true,
            document.getElementById('buttSave').disabled = true,
            alert('Такое имя уже есть в списке. Пожалуйста, введите другое имя.')
    }
    users.push(name);
    users.push(years);
    users.push(dateYears.toLocaleDateString('en-US'));
    document.getElementById("table1").innerHTML += `<tr id="t">
    <td>${name}</td>
    <td>${dateYears.toLocaleDateString().replace(/\//g, ".")}</td>
    <td>${Math.floor(years)}</td>
    <td><button>Удалить</button></td>
    <td><input class='delOneUser' type='button' value='Удалить с сервера' disabled></input></td>
    </tr>`;
    if (users.length > 1) {
        $("#old").prop('disabled', false);
        $("#young").prop('disabled', false);
        $("#buttPost").prop('disabled', false);
        $("#buttClear").prop('disabled', false);
        $("#buttClearServer").prop('disabled', false);
    };

    console.log(users);
    let table = document.getElementById('table1')
    table.onclick = function(event) {
        let target = event.target; // где был клик?
        if (target.tagName != 'BUTTON') return;
        let tr = target.parentNode.parentNode;
        let childrenTr = tr.childNodes[1].textContent;
        let el = users.indexOf(childrenTr);

        function deleteUser(idRemove) {
            users.splice(idRemove, 3)
        }
        deleteUser(el);
        console.log(users);
        target.parentNode.parentNode.remove();
    };
    document.getElementById('name').value = '';;
    document.getElementById('years').value = '';;
    $('#buttSave').attr("disabled", "disabled");
};



document.getElementById('old').onclick = function() {
    let max = 0;
    let nameMax;
    for (let key in users) {
        if (typeof users[key] == 'number') {
            if (users[key] > max) {
                max = users[key];
                nameMax = users[key - 1];
            }
        };
    }
    console.log(users)
    document.getElementById('strOld').innerHTML = nameMax + ": " + Math.floor(max);
};

document.getElementById('young').onclick = function() {
    let min = users[1];
    let nameMin;
    for (let key in users) {
        if (typeof users[key] == 'number') {
            if (users[key] <= min) {
                min = users[key];
                nameMin = users[key - 1];
            }
        }
    };
    document.getElementById('strYoung').innerHTML = nameMin + ": " + Math.floor(min);
};

document.getElementById('buttPost').onclick = async function() {
    console.log(JSON.stringify(users))
    const response = await fetch('http://localhost:3000/send', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'no-cors', // no-cors, *cors, same-origin
        // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit
        body: JSON.stringify(users),
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    });
    document.getElementById('buttGet').disabled = false;
};

document.getElementById('buttGet').onclick = async function() {
    document.getElementById('buttGet').disabled = true;
    document.getElementById('buttClear').disabled = false;
    document.getElementById('buttClearServer').disabled = false;
    let response = await fetch('http://localhost:3000/get', {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: 'same-origin', // include, *same-origin, omit

    });
    let usersSer = await response.text();
    usersSer = JSON.parse(usersSer);
    console.log(usersSer)
    users = users.concat(usersSer);
    console.log(users)
    for (let i = 0; i < users.length; i++) {
        if (typeof users[i] == 'number') {
            users[i + 1] = new Date(`${users[i+1]}`);
        };
    };
    console.log(users)
    console.log(`${typeof users[0]} ${typeof users[1]} ${typeof users[2]}`)
    users = users.filter((item, index) => {
        if (typeof users[index] === 'string') {
            if (users.indexOf(item) !== index) {
                users.splice(index, 2);
                alert('Пользователь ' + `${item}` + ' уже есть в списке')
            }
        }
        return users.indexOf(item) === index;
    });
    console.log(users)
    for (let i = 0; i < users.length; i++) {
        if (typeof users[i] == 'number') {
            console.log(users[i + 1])
            let y = users[i + 1].getFullYear();
            let m = users[i + 1].getMonth() + 1;
            let d = users[i + 1].getDate();
            users[i + 1] = d + '.' + m + '.' + y;
            console.log(users[i + 1])
        };
    };
    console.log(users)
    if (users.length > 0) {
        document.getElementById("table1").innerHTML = `<tr>
            <th>Имя</th>
            <th>Дата рождения</th>
            <th>Возраст</th>
            </tr>`;
        for (let key = 0; key < users.length - 1; key = key + 3) {

            document.getElementById("table1").innerHTML += `<tr>
            <td>${users[key]}</td>
            <td>${users[key + 2]}</td>
            <td>${Math.floor(users[key + 1])}</td>
            <td><button>Удалить</button></td>
            <td class='delOneUser'><input type='button' value='Удалить с сервера'></input></td>
            </tr>`;
        }
    } else {
        alert('На сервере нет данных');
        document.getElementById('buttGet').disabled = true;
        document.getElementById('buttClearServer').disabled = true;
    };
    let table = document.getElementById('table1')
    table.onclick = function(event) {
        let target = event.target; // где был клик?
        // if (target.tagName != 'BUTTON') return;
        if (target.tagName == 'BUTTON') {
            let tr = target.parentNode.parentNode;
            let childrenTr = tr.childNodes[1].textContent;
            let el = users.indexOf(childrenTr);


            function deleteUser(idRemove) {
                users.splice(idRemove, 3)
            }
            deleteUser(el);
            console.log(users);
            target.parentNode.parentNode.remove();
        }
        // if (target.tagName != 'INPUT') return;
        if (target.tagName == 'INPUT') {
            let tr1 = target.parentNode.parentNode;
            let childrenTr1 = tr1.childNodes[1].textContent;
            console.log(childrenTr1);
            console.log(users);
            let response = fetch('http://localhost:3000/user', {
                method: 'POST',
                cache: 'no-cache',
                body: childrenTr1,
                headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
            });

        }

    };
};

document.getElementById('buttClear').onclick = function() {
    document.getElementById('buttClear').disabled = true;
    document.getElementById('buttPost').disabled = true;
    users = [];
    document.getElementById("table1").innerHTML = `<tr>
    <th>Имя</th>
    <th>Дата рождения</th>
    <th>Возраст</th>
    </tr>`;
}

document.getElementById('buttClearServer').onclick = async function() {
    document.getElementById('buttGet').disabled = true;
    document.getElementById('buttClearServer').disabled = true;
    let response = await fetch('http://localhost:3000/users', {
        method: 'DELETE',
        cache: 'no-cache',
    });
}

document.getElementById('buttUpdateServer').onclick = async function() {
    let response = await fetch('http://localhost:3000/update', {
        method: 'POST',
        cache: 'no-cache',
        body: JSON.stringify(users),
        headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
    });
}


async function getSer() {
    let a;
    let response = await fetch('http://localhost:3000/get', {
        method: 'GET',
        cache: 'no-cache',
    });
    a = await response.text();

    if (a.length > 0) {
        for (let key = 0; key < a.length - 1; key++) {
            document.getElementById('buttGet').disabled = false;
        }
    } else {
        document.getElementById('buttClear').disabled = true;
        document.getElementById('buttClearServer').disabled = true;
    }
}
getSer();