var month_abr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
var days_names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

var date = new Date();
var current_date = new Date();
var left_button = document.getElementById("left_button");
var right_button = document.getElementById("right_button");
var notificationsBtn = document.getElementById("notifications");
var user_uid;
var notificationsInitialized = false;
var userOnPage = true;
var manager = false;


var firebaseConfig = {
    apiKey: "AIzaSyB1gProVLbu5cTJFZgCXz5qX1ckeno-f9s",
    authDomain: "task-dispencer.firebaseapp.com",
    databaseURL: "https://task-dispencer-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "task-dispencer",
    storageBucket: "task-dispencer.appspot.com",
    messagingSenderId: "1021029715894",
    appId: "1:1021029715894:web:af1096f3633ad27d5bbb17",
    measurementId: "G-RLBR93SMMN"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Verify user's login status
firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        setUserName();
        // firebaseUser.updateProfile({displayName: "Emp", photoURL: "t9remkZwmSZePNqpmK5qYRmjVTf2.jpg"});
        console.log(firebaseUser.uid)
        user_uid = firebaseUser.uid;
        start();
        firebase.database().ref().child("users/" + user_uid).get().then((snapshot) => {
            if (snapshot != null) {
                manager = snapshot.val()["manager"];
                if (manager) {
                    document.getElementById("admin").classList.remove("hide");
                }
                notificationBadgeHandler(snapshot.val()["notifications"]);
            } else {
                manager= false;
            }
        })
        displayDate();
    } else {
        window.location.href = "login.html";
    }
});

function notificationBadgeHandler(not) {
    firebase.database().ref("users/"+user_uid+"/notifications/").on('value', (snapshot) => {
        if(snapshot != null) {
            var label = document.getElementById("notification_label");
            var count = 0;
                for (var notification in snapshot.val()) {
                    if (snapshot.val()[notification]["new"] === true) {
                        count++;
                    }
                }

            if (count !== 0) {

                label.innerHTML += "<span class=\"badge\" id=\"notification_number\">"+count+"</span>";
            } else {
                var el = document.getElementById("notification_number");
                if (el) {
                    el.remove();
                }
            }
        }
    });

}

function notifyMe() {
    if (!("Notification" in window)) {
        alert("This browser does not support system notifications");
    }
    else if (Notification.permission === "granted") {
        notify();
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                notify();
            }
        });
    }

    function notify() {
        var notification = new Notification('TITLE OF NOTIFICATION', {
            icon: 'http://carnes.cc/jsnuggets_avatar.jpg',
            body: "Hey! You are on notice!",
        });

        notification.onclick = function () {
            window.open("http://carnes.cc");
        };
        setTimeout(notification.close.bind(notification), 7000);
    }

}
notifyMe();


function notificationPresenterHandler(val) {
// if (userOnPage) {
    displayDate();
    var body = document.createElement("div");body.classList.add("notification_tag");body.id = "notification_body";body.setAttribute("onClick", "console.log(\"test\");");
    document.getElementsByTagName("body")[0].appendChild(body);
    var closeBtn = document.createElement("span");closeBtn.textContent = "x";
    var taskTitle = document.createElement("p");
    var taskDescription = document.createElement("p");
    var details = "<p style=\"cursor:pointer;\" onclick=\"showBoldNotificaiton(\'"+val+"\')\">Click here for more details</p>"
    body.innerHTML = "<span id=\"notification_close\" onclick=\"this.parentElement.remove();\">x</span>"
    body.innerHTML += "<h3>You have a new task</h3>";
    firebase.database().ref("tasks/details/"+val).get().then((snapshot) => {
       if (snapshot != null) {
           taskTitle.textContent = snapshot.val()["task_title"];body.appendChild(taskTitle);
           taskDescription.textContent = snapshot.val()["task_description"];body.appendChild(taskDescription);
            body.innerHTML += details;
       }
    });

// }
}

function start () {
    var listener = firebase.database().ref("users/" + user_uid + "/notifications");
    const startKey = listener.push().key;
    listener.orderByKey().startAt(startKey).on('child_added', (snapshot) => {
        notificationPresenterHandler(snapshot.val()["ticketID"]);
    });
}

function setUserName() {
    const authRef = firebase.auth().currentUser;
    // console.log(authRef.photoURL)
    firebase.storage().ref().child("users_avatar").child(authRef.photoURL).getDownloadURL().then((url) => {
        document.getElementById("avatar_img").src = url != null ? url : "";
    });
    document.getElementById("avatar_name").innerText = authRef.displayName;
}

document.getElementById("signOut_button").addEventListener('click', e => {
    firebase.auth().signOut();
});

// function setDNandP(userId) {
//     const dbRef = firebase.auth().currentUser;
//     // const sRef = firebase.storage().ref().child("users_avatar/" + userId + ".jpeg");
//     dbRef.updateProfile({
//         displayName: "Timotei Ghencian",
//         photoURL: "yajBqtvRL0Vba1rWuQjE6qUoiiF3.jpeg"
//     })
// }

function showBoldNotificaiton(idTask) {
    document.getElementById("notification_popup").style.display = "block";
    var box = document.getElementsByClassName("notifications_box")[0];
    var txt = document.createTextNode("You don't have any notifications.");
    firebase.database().ref().get().then((snapshot) => {
        let not = snapshot.child("users/"+user_uid+"/notifications").val();
        let tickets = snapshot.child("tasks/details").val();

        if (not == null) {
            box.appendChild(txt);
        } else {
            box.innerHTML = "<table id=\"notifications_table\">\n" +
                "          <tr>\n" +
                "            <th>Date of Creation</th>\n" +
                "            <th>Ticket</th>\n" +
                "            <th>Details</th>\n" +
                "          </tr>\n" +
                "        </table>";
            var table = document.getElementById("notifications_table");
            for (i in not) {
                var date = new Date(not[i]["date_of_creation"] * 1000);
                var row = document.createElement("tr"); row.id = i;
                var col_t = document.createElement("td");
                var col_d = document.createElement("td");
                var details = document.createElement("td");
                // var deleteBtn = document.createElement("a");deleteBtn.href = "#";deleteBtn.classList.add("material-icons"); deleteBtn.setAttribute("style", "margin-right: 1rem; font-size: 20px;");deleteBtn.innerText = "delete";
                // deleteBtn.onclick = test();
                // details.appendChild(deleteBtn);
                var checkBtn = document.createElement("a");
                details.innerHTML = "<a onClick=\"removeNotification(\'"+i+"\')\" href=\"#\" class=\"material-icons\" style=\"margin-right: 1rem; font-size: 20px;\">delete</a>";
                details.innerHTML += "<a onClick=\"markReadNotification(\'"+i+"\')\" href=\"#\" class=\"material-icons\" style=\"font-size: 20px;\">check_circle</a>";
                col_t.appendChild(document.createTextNode(tickets[not[i]["ticketID"]]["task_title"]))
                col_d.appendChild(document.createTextNode(date.getDate() + " " + month_abr[date.getMonth()] + " " + date.getFullYear()));
                row.appendChild(col_d);
                row.appendChild(col_t);
                row.appendChild(details);
                if (not[i]["new"]) {
                    row.classList.add("notifications_box_unread");
                }
                table.appendChild(row);

            }
        }
    });
}

notificationsBtn.onclick = function () {
    document.getElementById("notification_popup").style.display = "block";
    var box = document.getElementsByClassName("notifications_box")[0];
    var txt = document.createTextNode("You don't have any notifications.");
    firebase.database().ref().get().then((snapshot) => {
        let not = snapshot.child("users/"+user_uid+"/notifications").val();
        let tickets = snapshot.child("tasks/details").val();

        if (not == null) {
            box.appendChild(txt);
        } else {
            box.innerHTML = "<table id=\"notifications_table\">\n" +
                "          <tr>\n" +
                "            <th>Date of Creation</th>\n" +
                "            <th>Ticket</th>\n" +
                "            <th>Details</th>\n" +
                "          </tr>\n" +
                "        </table>";
            var table = document.getElementById("notifications_table");
            for (i in not) {
                var date = new Date(not[i]["date_of_creation"] * 1000);
                var row = document.createElement("tr"); row.id = i;
                var col_t = document.createElement("td");
                var col_d = document.createElement("td");
                var details = document.createElement("td");
                // var deleteBtn = document.createElement("a");deleteBtn.href = "#";deleteBtn.classList.add("material-icons"); deleteBtn.setAttribute("style", "margin-right: 1rem; font-size: 20px;");deleteBtn.innerText = "delete";
                // deleteBtn.onclick = test();
                // details.appendChild(deleteBtn);
                var checkBtn = document.createElement("a");
                details.innerHTML = "<a onClick=\"removeNotification(\'"+i+"\')\" href=\"#\" class=\"material-icons\" style=\"margin-right: 1rem; font-size: 20px;\">delete</a>";
                details.innerHTML += "<a onClick=\"markReadNotification(\'"+i+"\')\" href=\"#\" class=\"material-icons\" style=\"font-size: 20px;\">check_circle</a>";
                col_t.appendChild(document.createTextNode(tickets[not[i]["ticketID"]]["task_title"]))
                col_d.appendChild(document.createTextNode(date.getDate() + " " + month_abr[date.getMonth()] + " " + date.getFullYear()));
                row.appendChild(col_d);
                row.appendChild(col_t);
                row.appendChild(details);
                if (not[i]["new"]) {
                    row.classList.add("notifications_box_unread");
                }
                table.appendChild(row);

            }
        }
    });
}
document.getElementById("close_notifications").onclick = function () {
    document.getElementById("notification_popup").style.display = "none";
}
function removeNotification(id) {
    var ref = firebase.database().ref().child("users/"+user_uid+"/notifications/"+id);
    ref.remove()
    document.getElementById(id).remove();
};

function markReadNotification(id) {
    var ref = firebase.database().ref().child("users/"+user_uid+"/notifications/"+id+"/new");
    ref.set(false);
    document.getElementById(id).classList.remove("notifications_box_unread");
};


Date.prototype.getWeek = function(){
    return [new Date(this.setDate(this.getDate()-this.getDay()))]
        .concat(
            String(Array(6)).split(',')
                .map ( function(){
                    return new Date(this.setDate(this.getDate()+1));
                }, this )
        );
}

function setDayToCurrent(i) {
    var div_vontainer = document.getElementsByClassName("calendar_days")[i];
    var date_field = document.getElementsByClassName("week_day_date")[i];
    var day_name = document.getElementsByClassName("week_day_name")[i];
    div_vontainer.setAttribute("style", "background-color:#eae2b7");
    date_field.setAttribute("style", "color:#2A9D8F");
    day_name.setAttribute("style", "color:#2A9D8F");
}
function setDayToOrdinarry(i) {
    var div_vontainer = document.getElementsByClassName("calendar_days")[i];
    var date_field = document.getElementsByClassName("week_day_date")[i];
    var day_name = document.getElementsByClassName("week_day_name")[i];
    div_vontainer.removeAttribute("style");
    day_name.removeAttribute("style");
    date_field.removeAttribute("style");
}
// usage


left_button.onclick = function () {
    date.setDate(date.getDate()-parseInt(7));
    displayDate();

};

right_button.onclick = function () {
    date.setDate(date.getDate()+parseInt(7));
    displayDate();
};

function displayDate() {
   firebase.database().ref().child("tasks").get().then((snapshot) => {
        for (var i = 0; i < 7; i++) {
            var span = document.getElementsByClassName("week_day_date")[i];
            var day = date.getWeek()[i];
            day.setDate(day.getDate() + 1);
            span.innerHTML = (day.getDate()).toString() + " " + month_abr[day.getMonth()];
            if (day.getDate() === current_date.getDate()  && day.getMonth() === current_date.getMonth() && day.getFullYear() === current_date.getFullYear()){
                setDayToCurrent(i);
            } else {
                setDayToOrdinarry(i);
            }
            displayDayHours(snapshot.val(),day);
        }
    });
}

document.addEventListener('visibilitychange', function() {
    if(document.hidden) {
        userOnPage = false;
    }else{
        userOnPage = true;

    }

});


function displayDayHours(snapshotVal,day) {
    // console.log(day);
    var auxDate = day;
    auxDate.setMinutes(0); auxDate.setSeconds(0);auxDate.setHours(0);
    firebase.database().ref().child("tasks").get().then((snapshot) => {
        if (snapshot.val()["progress"][user_uid] != null) {
            for (var i = 0; i < 24; i++) {
                var hour = document.createElement("P");
                var cTime = i < 10 ? "0" + (i).toString() : (i).toString();
                var hour_text = document.createTextNode(cTime + ":00");
                var container = document.createElement("DIV");
                var newDay = day;
                //var currentTask = getTaskForCurrentTime(tasks, newDay.setHours(cTime));
                var currentTask = null;
                if (snapshot.val()["progress"][user_uid][Math.floor(auxDate/1000)] != null) {
                    var taskUid = snapshot.val()["progress"][user_uid][Math.floor(auxDate/1000)];
                    currentTask = snapshot.val()["details"][taskUid];
                }
                hour.appendChild(hour_text);
                auxDate.setHours(i);
                container.setAttribute("class", "calendar_hours");
                container.setAttribute("onclick", "displayTaskDetailsFromCalendar(" + JSON.stringify(currentTask) +")");
                container.appendChild(hour);
                if (currentTask) {
                    var task = document.createElement("P");

                    var task_label = document.createTextNode(currentTask["task_title"]);
                    task.appendChild(task_label);
                    task.setAttribute("class", "task_label");
                    container.classList.add("prio" + currentTask["priority"]);
                    container.appendChild(task);
                }
                if (day.getDate() === current_date.getDate() && day.getMonth() === current_date.getMonth() && day.getFullYear() === current_date.getFullYear() && i === current_date.getHours()) {
                    container.classList.add("calendar_hours_current");
                } else {
                    container.classList.remove("calendar_hours_ordinarry");
                }
                if (i > 0) {
                    console.log(day.get);
                    document.getElementsByClassName("calendar_hours_days")[day.getDay() == 0 ? 6 : day.getDay() - 1].appendChild(container);
                } else {
                    document.getElementsByClassName("calendar_hours_days")[day.getDay() == 0 ? 6 : day.getDay() - 1].innerText = "";
                    document.getElementsByClassName("calendar_hours_days")[day.getDay() == 0 ? 6 : day.getDay() - 1].appendChild(container);
                }
            }
        } else {
            for (var i = 0; i < 24; i++) {
                var hour = document.createElement("P");
                var hour_text = document.createTextNode((i < 10 ? "0" + (i).toString() : (i).toString()) + ":00");
                var container = document.createElement("DIV");
                hour.appendChild(hour_text);
                auxDate.setHours(i);
                container.setAttribute("class", "calendar_hours");
                container.appendChild(hour);
                if (day.getDate() === current_date.getDate() && day.getMonth() === current_date.getMonth() && day.getFullYear() === current_date.getFullYear() && i === current_date.getHours()) {
                    container.classList.add("calendar_hours_current");
                } else {
                    container.classList.remove("calendar_hours_ordinarry");
                }
                if (i > 0) {
                    document.getElementsByClassName("calendar_hours_days")[day.getDay()].appendChild(container);
                } else {
                    document.getElementsByClassName("calendar_hours_days")[day.getDay()].innerText = "";
                    document.getElementsByClassName("calendar_hours_days")[day.getDay()].appendChild(container);
                }
            }
        }
    });
}

function getTaskForCurrentTime (tasks, currentTime){
    for (const task in tasks) {
        var currentFormattedTime = new Date(currentTime);
        var currentFormattedTaskTime = getFormatTime(tasks[task].start_time);
        if((currentFormattedTime.toLocaleDateString() === currentFormattedTaskTime.toLocaleDateString()) && (currentFormattedTime.toLocaleTimeString() === currentFormattedTaskTime.toLocaleTimeString())){
            //console.log(tasks[task]);
            return tasks[task];
        } else {
            return false;
        }
    }
}


var searchBar = document.getElementById("search_bar");

var searchBtn = document.getElementById("searchBtn");

var closeBtn = document.getElementsByClassName("close")[0];

searchBtn.onclick = function () {
    searchBar.style.display = "block";
    searchBar.style.position = "absolute";
    //console.log("test")
};

closeBtn.onclick = function() {
    searchBar.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == searchBar) {
        searchBar.style.display = "none";
    }
}

var addTaskWrapper = document.getElementById("addTaskWrapper");

var closeTaskDetailsBtn = document.querySelector(".addTaskWrapper-container .close");
closeTaskDetailsBtn.onclick = function() {
    addTaskWrapper.style.display = "none";
}

var tasks=[];
var tasksref = firebase.database().ref('tasks/details/');
tasksref.once('value').then(function(data) {

    data.forEach(function (test) {
        tasks.push(test.val());
    })
    console.log(tasks)
    autocomplete_tasks(document.getElementById("tasks"), tasks);
});

function autocomplete_tasks(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        if (!val) { return false;}
        currentFocus = -1;
        emptyMyTaskDetails();
        a = document.createElement("DIV");
        a.setAttribute("id", this.value + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
            if (arr[i].task_title.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                var myTaskObject = JSON.stringify(arr[i]);
                b.innerHTML += "<div onclick='displayTaskDetails(" + myTaskObject +")'>" + arr[i].task_title + "</div>";
                a.appendChild(b);
            }
        }
    });

    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { //up
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}


function emptyMyTaskDetails() {

    var popupSearch = document.getElementsByClassName("popupSearch");
    var taskTitle = document.getElementById("taskTitle");
    var taskDescription = document.getElementById("taskDescription");
    var responsibleUser = document.getElementById("responsibleUser");
    var necessarySkills = document.getElementById("necessarySkills");
    var deadlineDate = document.getElementById("deadlineDate");
    var startTime = document.getElementById("startTime");
    var priority = document.getElementById("priority");
    var noHoursToWork = document.getElementById("noHoursToWork");
    var progress = document.getElementById("progress");
    var tasks = document.getElementById("tasks");

    taskTitle.textContent = "";
    taskDescription.textContent = "";
    responsibleUser.textContent = "";
    necessarySkills.textContent = "";
    deadlineDate.textContent = "";
    startTime.textContent = "";
    priority.textContent = "";
    noHoursToWork.textContent = "";
    progress.textContent = "";
    tasks.textContent = "";

    popupSearch[0].style.display = "none";
    popupSearch[0].style.display = "none";
}


function timeDifference(startTime,endTime) {
    var differenceInSeconds = (endTime - startTime) / 1000;
    var differenceInMinutes = differenceInSeconds / 60;
    var differenceInHours = differenceInMinutes / 60;
    return differenceInHours;
}

function getFormatTime(d){
    const startTime = new Date(d * 1000);
    return startTime;
}

async function getUserTime(userID, startTime) {
    var progressText = '';

    var timesref = firebase.database().ref('tasks/progress/' + userID);
    await timesref.once('value').then(function(data) {
        for (var i in data.val()) {
            if(startTime == i) {
                progressText += "User started working at: "  + getFormatTime(i).toLocaleDateString() + " " + getFormatTime(i).toLocaleTimeString();
            } else {
                var timeWorkedOnTask = timeDifference(getFormatTime(startTime), getFormatTime(i));
                progressText += " - worked for: " + timeWorkedOnTask + " h, until " + getFormatTime(i).toLocaleDateString() + " " + getFormatTime(i).toLocaleTimeString();
            }
        }
    });
    return progressText;
}

async function displayTaskDetails (myTask) {

    var userTaskProgress = await getUserTime(myTask.responsible_user, myTask.start_time);

    var popupSearch = document.getElementsByClassName("popupSearch");
    var taskTitle = document.getElementById("taskTitle");
    var taskDescription = document.getElementById("taskDescription");
    var responsibleUser = document.getElementById("responsibleUser");
    var necessarySkills = document.getElementById("necessarySkills");
    var deadlineDate = document.getElementById("deadlineDate");
    var startTime = document.getElementById("startTime");
    var priority = document.getElementById("priority");
    var noHoursToWork = document.getElementById("noHoursToWork");
    var progress = document.getElementById("progress");
    var tasks = document.getElementById("tasks");

    var date = new Date(myTask.start_time*1000);
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    taskTitle.textContent = "Task title: " + myTask.task_title;
    taskDescription.textContent = "Task description: " + myTask.task_description;
    responsibleUser.textContent = "Responsible user: " + myTask.responsible_user;
    necessarySkills.textContent = "Necessary skills: " + myTask.necessary_skills;
    deadlineDate.textContent = "Deadline date: " + myTask.deadline_date.day + " " + myTask.deadline_date.month + " " + myTask.deadline_date.year;
    startTime.textContent = "Starting time: " + date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear();
    priority.textContent = "Priority: " + myTask.priority;
    noHoursToWork.textContent = "Number of hours to work: " + myTask.no_hours_to_work;
    progress.textContent = "Progress: " + userTaskProgress;
    tasks.value = myTask.task_title;

    popupSearch[0].style.display = "block";
}

function tasksDetailsPopup(){
    var popupSearch = document.getElementsByClassName("popupSearch");
    popupSearch.classList.toggle("show");
}

function displayTaskDetailsFromCalendar(currentTask) {

    var addTaskWrapper = document.getElementById("addTaskWrapper");
    addTaskWrapper.style.display = "block";
    addTaskWrapper.style.position = "absolute";

    var taskTitle = document.getElementById("taskTitleCalendar");
    var taskDescription = document.getElementById("taskDescriptionCalendar");
    var responsibleUser = document.getElementById("responsibleUserCalendar");
    var necessarySkills = document.getElementById("necessarySkillsCalendar");
    var deadlineDate = document.getElementById("deadlineDateCalendar");
    var priority = document.getElementById("priorityCalendar");
    var noHoursToWork = document.getElementById("noHoursToWorkCalendar");

    taskTitle.textContent = "Task title: " + currentTask.task_title;
    taskDescription.textContent = "Task description: " + currentTask.task_description;
    responsibleUser.textContent = "Responsible user: " + currentTask.responsible_user;
    necessarySkills.textContent = "Necessary skills: " + currentTask.necessary_skills;
    deadlineDate.textContent = "Deadline date: " + currentTask.deadline_date.day + " " + currentTask.deadline_date.month + " " + currentTask.deadline_date.year;
    priority.textContent = "Priority: " + currentTask.priority;
    noHoursToWork.textContent = "Number of hours to work: " + currentTask.no_hours_to_work;

}