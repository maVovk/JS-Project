'use strict'

let cnt = 0;
let boardList = []

let databaseURL = 'http://37.77.104.246/api/jsonstorage/?id=d93ab1af658f726e9c8b9b81bd143050';
let logged = true;

class Task{
    constructor(task, parent){
        let tmp = document.createElement('p');
        tmp.innerHTML = task;
                
        tmp.addEventListener('click', function(e){
            e.target.classList.add('inactive');

            setTimeout(function(){
                let arr = boardList[0].listArray[parent.querySelector('h2').innerHTML].tasks;
                for(let i = 0; i < arr.length; i++){
                    if(arr[i] === e.target.innerHTML){
                        arr.splice(i, 1);
                        i--;
                    }
                }
                parent.querySelector('.inactive').remove();
            }, 1 * 1000);
        });

        parent.appendChild(tmp);
    }
}

class List{
    constructor(parent, _name, _position){
        this.tasks = [];

        //customElements.define('task-list', List);
        let newEl = document.createElement('div');
        //newEl.id = "list";
        newEl.classList.add('list');
        newEl.classList.add('listElement')
        newEl.classList.add('card');
    
        let smallCircle = document.createElement('div');
        smallCircle.classList.add('multi-button');
        let smallBtn = document.createElement('button');
        smallBtn.classList.add('gg-close-o');

        smallBtn.addEventListener('click', function(e){
            let elem = e.target.parentElement.parentElement;
            delete boardList[0].listArray[elem.querySelector('h2').innerHTML];
            elem.remove();
        });      

        this.Name = _name;
        let name = document.createElement('h2');
        name.innerHTML = _name;
    
        let inputField = document.createElement('input');
        inputField.id = "addTask";

        inputField.addEventListener('change', function(e){
            let parent = e.target.parentElement;
            if(e.target.value != ""){
                //console.log(boardList[0].listArray);
                boardList[0].listArray[parent.querySelector('h2').innerHTML].tasks.push(e.target.value);
                new Task(e.target.value, parent);
                e.target.value = "";
            }
            else{
                e.target.style.borderColor = 'red';
            }
        })
    
        
        smallCircle.appendChild(smallBtn);
        newEl.appendChild(name);
        newEl.appendChild(smallCircle);
        newEl.appendChild(inputField);
        parent.appendChild(newEl);
    }

    info(){
        let data = {
            name: this.Name,
            tasks: this.tasks,
        };

        return data;
    }

    addElements(data){
        for(let elem in data){
            boardList[0].listArray[document.querySelector('h2:nth-last-of-type(1)').innerHTML].tasks.push(data[elem]);
            new Task(data[elem], document.querySelector('.card:nth-last-of-type(1)'));
        }
    }
}

class Board{
    constructor(_name, _position){
        this.listArray = {};
        let newEl = document.createElement('div');
        newEl.id = "board";
        newEl.classList.add('boardEmpty');

        let listPlace = document.createElement('div');
        listPlace.classList.add('boardContainer');
    
        this.Name = _name;
        let name = document.createElement('h3');
        name.innerHTML = _name;
    
        let btn = document.createElement('button');
        btn.id = "createList";
        btn.innerHTML = "Добавить лист";
        
        btn.addEventListener('click', function(e){
            let elem = e.target.parentElement;
            let inputField = elem.querySelector('#listName');

            if(inputField.value != '' && !boardList[0].listArray[inputField.value]){

                boardList[0].listArray[inputField.value] = new List(elem.querySelector('.boardContainer'), inputField.value, boardList[0].listArray.length);

                inputField.value = '';
                inputField.style.borderColor = 'black';
            }
            else{
                inputField.style.borderColor = 'red';
            }
        });

        let inputField = document.createElement('input');
        inputField.id = "listName";

        inputField.addEventListener('change', function(e){
            let elem = e.target.parentElement;
            
            if(inputField.value != '' && !boardList[0].listArray[inputField.value]){
                 boardList[0].listArray[inputField.value] = new List(elem.querySelector('.boardContainer'), inputField.value, boardList[0].listArray.length)

                inputField.value = '';
                inputField.style.borderColor = 'black';
            }
            else{
                inputField.style.borderColor = 'red';
            }
        })
    
        newEl.appendChild(name);
        newEl.appendChild(inputField);
        newEl.appendChild(btn);
        newEl.appendChild(listPlace);
        document.body.appendChild(newEl);
    }

    getInfo(){
        let data = {
            name: this.Name,
            lists: []
        };

        for(let key in this.listArray){
            data['lists'].push(this.listArray[key].info());
        }

        return data;
    }

    addElements(data){
        for(let elem in data){
            boardList[0].listArray[data[elem]['name']] = new List(document.querySelector('.boardContainer'), data[elem]['name'], boardList[0].listArray.length)
            boardList[0].listArray[data[elem]['name']].addElements(data[elem]['tasks']);
        }
    }
}

createBoard.addEventListener('click', function(){
    let name = boardName.value;

    if(name == "") name = "Доска " + (cnt + 1);

    console.log(currentData);
    boardList.push(new Board(name, boardList.length));
    boardName.remove();
    createBoard.remove();
    cnt++;
});

boardName.addEventListener('change', function(){
    let name = boardName.value;

    if(name == "") name = "Доска " + (cnt + 1);

    boardList.push(new Board(name, boardList.length));
    boardName.remove();
    createBoard.remove();
    cnt++;
});

function check(login, password, base){
    //console.log(base);
    for(let elem in base){
        //console.log(base[elem]);
        if(base[elem]['name'] == login && base[elem]['password'] == password){
            return true;
        }
    }
    
    return false;
}

function apply(login, password, base){
    for(let elem in base){
        if(base[elem]['name'] == login && base[elem]['password'] == password){
            let data = base[elem]['data'];
            console.log(data);
            if(!data['name']) return;
            boardList.push(new Board(data['name'], 0));

            boardList[0].addElements(data['lists']);
        }
    }

    boardName.remove();
    createBoard.remove();
}

function update(login, password, dataBase){
    console.log("Updating...");
    let request = dataBase;
    if(boardList[0]){
        let generalData = boardList[0].getInfo();

        let tmpXhr = new XMLHttpRequest;
        tmpXhr.open('PUT', databaseURL, true);

        for(let elem in request){
            if(request[elem]['name'] == login && request[elem]['password'] == password){
                console.log(request[elem]);
                request[elem]['data'] = generalData;
            }
        }

        tmpXhr.send(JSON.stringify(request));
        console.log("Data was sent");
    }
    else{
        console.log("Data wasn't sent");
    }
}

function addNewUser(login, password, base){
    let tmpXhr = new XMLHttpRequest;
    tmpXhr.open('PUT', databaseURL, true);
    let newUser = {
        'name': login,
        'password': password,
        'data': {}
    };
    base.push(newUser);

    console.log(base);
    setInterval(update, 5 * 1000, login, password, base);

    tmpXhr.send(base);
}

signIn.onclick = function(){
    //console.log(boardList[0].getInfo());
    let xhr = new XMLHttpRequest;
    if(login.value != "" && password.value != ""){
        xhr.open('GET', databaseURL, true);
        
        xhr.responseType = 'json';
        xhr.send();

        let loginDatabase;
        let log = login.value, pass = password.value;

        let authed = false;

        xhr.addEventListener('readystatechange', function(){
            if(xhr.status == 200 && xhr.response != null){
                loginDatabase = xhr.response;
                console.log(loginDatabase);
                if(check(log, pass, loginDatabase) && !authed){
                    authed = true;
                    if(!boardList[0]){
                        apply(log, pass, loginDatabase);
                    }
                    setInterval(update, 5 * 1000, log, pass, loginDatabase);
                    console.log("SUCCESSFUL AUTH");
                    let checkIcon = document.createElement('div');
                    checkIcon.classList.add('gg-check-o1');
                    document.querySelector('main').appendChild(checkIcon);
                    document.querySelector('.signing').remove();
                }
                else{
                    alert("Неверные данные");
                    console.log("UNSUCCESSFUL AUTH");
                }
            }
        });

        login.style.borderColor = 'black';
        password.style.borderColor = 'black';

        login.value = "";
        password.value = "";
    }
    else{
        if(login.value == "") login.style.borderColor = 'red';
        if(password.value == "") password.style.borderColor = 'red';
    }
}

let newUserLog = false;

signUp.addEventListener('click', function(){
    let xhr = new XMLHttpRequest;
    if(login.value != "" && password.value != ""){
        xhr.open('GET', databaseURL, true);
        
        xhr.responseType = 'json';
        xhr.send();

        let loginDatabase;
        let log = login.value, pass = password.value;
        
        newUserLog = true;

        xhr.addEventListener('readystatechange', function(){
            if(xhr.status == 200 && xhr.response != null && newUserLog){
                loginDatabase = xhr.response;
                //console.log(loginDatabase);
                let unique = true;
                for(let elem in loginDatabase){
                    if(loginDatabase[elem]['name'] == log && loginDatabase[elem]['password'] == pass){
                        alert("Пользователь уже существует");
                        unique = false;
                        break;
                    }
                    else if(loginDatabase[elem]['name'] == log && loginDatabase[elem]['password'] != pass){
                        alert('Неправильный пароль');
                        unique = false;
                        break;
                    }
                }

                if(unique){
                    addNewUser(log, pass, loginDatabase);
                    let checkIcon = document.createElement('div');
                    checkIcon.classList.add('gg-check-o1');
                    document.querySelector('main').appendChild(checkIcon);
                    document.querySelector('.signing').remove();
                }

                newUserLog = false;
            }
        });

        login.style.borderColor = 'black';
        password.style.borderColor = 'black';

        login.value = "";
        password.value = "";
    }
    else{
        if(login.value == "") login.style.borderColor = 'red';
        if(password.value == "") password.style.borderColor = 'red';
    }
});