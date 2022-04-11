"use strict;"
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.text());
const fs = require("fs");
const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '30071999',
    database: 'postgres'
});
client.connect();



const cors = require('cors');
const { type } = require("express/lib/response");
app.use(cors());


app.get("/get", function(req, res) {
    let a = client.query('select users.username, users.useryears, users.userdate from users', (err, resSql) => {
        //получение значений из массива объектов в массив
        let test = [];
        resSql = resSql.rows;
        for (let i = 0; i < resSql.length; i++) {
            let a = Object.values(resSql[i]);
            test = test.concat(a);
        }

        //присваивание перменной типа дата
        for (let j = 0; j < test.length; j++) {

            if (typeof test[j] == 'number') {
                test[j + 1] = new Date(`${test[j + 1]}`);
                let y = test[j + 1].getFullYear();
                let m = test[j + 1].getMonth() + 1;
                let d = test[j + 1].getDate();
                test[j + 1] = m + '.' + d + '.' + y;
                console.log(test[j + 1])
            }

        }

        if (err) {
            console.log(err.stack)
            res.send('ошибка');
        } else {
            res.set('Content-Type', 'text/plain; charset=UTF-8');
            res.send(test);
        }
    });

});

app.post("/send", async function(req, res) {
    let str = '';
    let massivUsers = JSON.parse(req.body);

    //изменение формата даты для фильтрации
    for (let i = 0; i < massivUsers.length; i++) {
        if (typeof massivUsers[i] == 'number') {
            massivUsers[i + 1] = new Date(`${massivUsers[i+1]}`);
        };
    };

    //фильтр массива с сайта
    let filterarr = [];
    filterarr = massivUsers.filter((item, index) => {
        if (typeof massivUsers[index] === 'string') {
            if (massivUsers.indexOf(item) !== index) {
                massivUsers.splice(index, 2)
            }
        }
        return massivUsers.indexOf(item) === index;
    });

    //получение массива из базы данных
    let b = await client.query('select users.username, users.useryears, users.userdate from users');
    b = b.rows;
    let test2 = [];
    for (let i = 0; i < b.length; i++) {
        let a = Object.values(b[i]);
        test2 = test2.concat(a);
    };
    let length = test2.length;

    //соединение массивов и фильтрация
    test2 = test2.concat(filterarr);

    let filterarr2 = [];
    filterarr2 = test2.filter((item, index) => {
        if (test2.indexOf(item) !== index) {
            test2.splice(index, 2)
        }

        return test2.indexOf(item) === index;
    });

    //обрезание массива
    filterarr2.splice(0, length);

    //округление возраста
    // for (let i = 0; i < filterarr2.length; i++) {
    //     if (typeof filterarr2[i] == 'number') {
    //         filterarr2[i] = Math.floor(filterarr2[i])
    //     }
    // };

    //приведение даты к нужному формату и обрезка последней запятой
    for (let i = 0; i < filterarr2.length; i = i + 3) {
        let date = new Date(`'${filterarr2[i+2]}'`);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        let ymd = y + '-' + m + '-' + d;
        str += `('${filterarr2[i]}', ${filterarr2[i+1]}, '${ymd}'),`
    };
    let str2 = str.substring(0, str.length - 1);

    client.query(`insert into users (username, useryears, userdate) values ${str2}`, (err, resSql) => {
        if (err) {
            console.log(err)
            res.send('ошибка');
        } else {
            console.log(str2)
            res.set('Content-Type', 'text/plain; charset=UTF-8');
            res.send(resSql.rows);
        }
    });

});

app.post("/update", async function(req, res) {
    let str = '';
    let massivUsers = JSON.parse(req.body);

    //изменение формата даты для фильтрации
    for (let i = 0; i < massivUsers.length; i++) {
        if (typeof massivUsers[i] == 'number') {
            massivUsers[i + 1] = new Date(`${massivUsers[i+1]}`);
        };
    };

    //фильтр массива с сайта
    let filterarr = [];
    filterarr = massivUsers.filter((item, index) => {
        if (typeof massivUsers[index] == 'string') {
            if (massivUsers.indexOf(item) !== index) {
                massivUsers.splice(index, 2)
            }
        }
        return massivUsers.indexOf(item) === index;
    });

    //получение массива из базы данных
    let b = await client.query('select users.username, users.useryears, users.userdate from users');
    b = b.rows;
    let test2 = [];
    for (let i = 0; i < b.length; i++) {
        let a = Object.values(b[i]);
        test2 = test2.concat(a);
    };
    let length = test2.length;

    //соединение массивов
    test2 = test2.concat(filterarr);

    //обрезание массива
    test2.splice(0, length);

    //округление возраста
    // for (let i = 0; i < test2.length; i++) {
    //     if (typeof test2[i] == 'number') {
    //         test2[i] = Math.floor(test2[i])
    //     }
    // };

    //приведение даты к нужному формату и обрезка последней запятой
    for (let i = 0; i < test2.length; i = i + 3) {
        let date = new Date(`'${test2[i+2]}'`);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        let ymd = y + '-' + m + '-' + d;
        str += `('${test2[i]}', ${test2[i+1]}, '${ymd}'),`
    };
    let str2 = str.substring(0, str.length - 1);

    client.query('delete from users', (err, resSql) => {
        if (err) {
            console.log(err.stack)
        } else {
            console.log(resSql.rows)
        }
    });

    client.query(`insert into users (username, useryears, userdate) values ${str2}`, (err, resSql) => {
        if (err) {
            console.log(err)
            res.send('ошибка');
        } else {
            console.log(str2)
            res.set('Content-Type', 'text/plain; charset=UTF-8');
            res.send(resSql.rows);
        }
    });

});


app.delete('/users', function(req, res) {
    client.query('delete from users', (err, resSql) => {
        if (err) {
            console.log(err)
            res.send('ошибка');
        } else {
            console.log(resSql.rows)
            res.set('Content-Type', 'text/plain; charset=UTF-8');
            res.send('Got a DELETE request at /users');
        }
    });
});

app.post('/user', function(req, res) {
    let user = req.body;
    console.log(user);
    client.query(`delete from users where username='${user}'`, (err, resSql) => {
        if (err) {
            console.log(err)
            res.send('ошибка');
        } else {
            console.log(resSql.rows)
            res.set('Content-Type', 'text/plain; charset=UTF-8');
            res.send('Got a DELETE request at /user');
        }
    });
});

// app.delete('/user', function(req, res) {
//     fs.writeFileSync("test.json", '', 'utf8');
//     res.send('Got a DELETE request at /user');
// });

app.listen(3000);