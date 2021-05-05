
var popup = document.getElementById("add_new_task");
var btn = document.getElementById("add_task");
var span = document.getElementsByClassName("close")[0];
var deadline_input = document.getElementById("deadline_input");
var calendar_cont = document.getElementsByClassName("calendar")[0];
var submit_button = document.getElementById("submit_add_task");
var task_title = document.getElementById("task_title");
var task_description = document.getElementById("task_description");
var skills_necessary = document.getElementById("skills_necessary");
var responsible_user = document.getElementById("responsible_user");

var listOfSkills = [];
var user_name = [];
var user_uid = [];
var selected_user = "";

var deadline_date = {day: 0, month: 0, year: 0};

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

firebase.database().ref().child("skill").get().then((snapshot) => {
    if (snapshot.exists()) {
        listOfSkills = snapshot.val();
        autocomplete(document.getElementById("skills_necessary"), listOfSkills);
    } else {
        console.log("No data available");
    }
});


firebase.database().ref().child("users").get().then((snapshot) => {
    if (snapshot.exists()) {
        snapshot.forEach(function(user) {
            user_name.push(user.key);
            user_name.push(user.val()["first_name"] + " " + user.val()["last_name"]);
        });


        // snapshot.on('first_name', s => console.log(s));
        // listOfSkills = snapshot.val();
        autocomplete(document.getElementById("responsible_user"), user_name);
    } else {
        console.log("No data available");
    }
});




//Verify user's login status
firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        // setUserName();

        // window.location.href = "home_user.html";
    } else {
        window.location.href = "login.html";
    }
});

btn.onclick = function () {
    popup.style.display = "block";
};

span.onclick = function() {
    popup.style.display = "none";
};

deadline_input.onclick = function () {
    // console.log("test");
    calendar_cont.setAttribute("style", "display: block");
};



window.onclick = function(event) {
    if (event.target == popup) {
        popup.style.display = "none";
    }
};

window.onclick = function(e) {
    var day = "";
    var month = "";
    var year = "";
    if (e.target.className === "calendar-day-hover") {
        day = e.target.innerHTML;
        month = document.getElementById("month-picker").innerText;
        year = document.getElementById("year").innerText;
        console.log(day);
        console.log(month);
        console.log(year);
        document.getElementById("deadline_input").value = day + " " + month + " " + year;
        calendar_cont.removeAttribute("style");
        deadline_date = {day: day, month: month, year: year};
    }
};

submit_button.onclick = function () {
    let task = {task_title: task_title.value, task_description: task_description.value, deadline_date: deadline_date, responsible_user:responsible_user.value, necessary_skills: skills_necessary.value};
    let ref = firebase.database().ref().child("tasks");
    ref.push().set(task);

};

//TODO: class for taks
//TODO: class for user