var month_abr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

var date = new Date();
var current_date = new Date();
var left_button = document.getElementById("left_button");
var right_button = document.getElementById("right_button");



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

        // window.location.href = "home_user.html";
    } else {
        window.location.href = "login.html";
    }
});


function setUserName() {

    const authRef = firebase.auth().currentUser;
    firebase.storage().ref().child("users_avatar").child(authRef.photoURL).getDownloadURL().then((url) => {
        document.getElementById("avatar_img").src = url;
    });
    document.getElementById("avatar_name").innerText = authRef.displayName;
}

document.getElementById("signOut_button").addEventListener('click', e => {
    firebase.auth().signOut();
});

function setDNandP(userId) {
    const dbRef = firebase.auth().currentUser;
    // const sRef = firebase.storage().ref().child("users_avatar/" + userId + ".jpeg");
    dbRef.updateProfile({
        displayName: "Timotei Ghencian",
        photoURL: "yajBqtvRL0Vba1rWuQjE6qUoiiF3.jpeg"
    })
}

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
    for (var i = 0; i < 7; i++) {
        var span = document.getElementsByClassName("week_day_date")[i];
        var day = date.getWeek()[i];
        span.innerHTML = (day.getDate()).toString() + " " + month_abr[day.getMonth()];
        if (day.getDate() === current_date.getDate() && day.getMonth() === current_date.getMonth() && day.getFullYear() === current_date.getFullYear()){
            setDayToCurrent(i);
        } else {
            setDayToOrdinarry(i);
        }
        displayDayHours(day);
    }
}
displayDate();

function displayDayHours(day) {
    console.log(day.getHours());

    for (var i = 0; i < 24; i++) {
        var hour = document.createElement("P");
        var hour_text = document.createTextNode((i < 10 ? "0" + (i).toString() : (i).toString()) + ":00");
        var task = document.createElement("P");
        var task_label = document.createTextNode("task " + (i).toString());
        var container = document.createElement("DIV");
        hour.appendChild(hour_text);
        task.appendChild(task_label);
        task.setAttribute("class", "task_label");
        container.setAttribute("class", "calendar_hours");
        container.appendChild(hour);
        container.appendChild(task);
        if (day.getDate() === current_date.getDate() && day.getMonth() === current_date.getMonth() && day.getFullYear() === current_date.getFullYear() && i === current_date.getHours()){
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