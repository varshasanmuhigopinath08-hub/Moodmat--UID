let selectedMood = "";
let moodChart;
let bubbleInterval = null;
let bubbleTimeouts = [];
let gameRunning = false;

// SIGN UP
function signup() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;
    let confirm = document.getElementById("confirm").value;

    if (pass !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    let user = { name, email, pass };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Signup successful!");
    window.location.href = "login.html";
}

// LOGIN
function login() {
    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("loginPassword").value;

    let storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser && email === storedUser.email && pass === storedUser.pass) {
        localStorage.setItem("loggedInUser", storedUser.name);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid login!");
    }
}

// LOAD USER
function loadUser() {
    let name = localStorage.getItem("loggedInUser");

    if (!name) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("welcome").innerText = "Hello, " + name + " 👋";
}

// SET MOOD
function setMood(mood) {
    selectedMood = mood;
    showQuote(mood);

    // remove previous highlight
    document.querySelectorAll(".moods button")
        .forEach(btn => btn.classList.remove("active"));

    // highlight clicked button
    event.target.classList.add("active");

    // background color change
    if (mood === "Happy") document.body.style.background = "#fff7b0";
    else if (mood === "Sad") document.body.style.background = "#cfe2ff";
    else if (mood === "Angry") document.body.style.background = "#d87373";
    else if (mood === "Neutral") document.body.style.background = "#e6e6e6";
    else if (mood === "Tired") document.body.style.background = "#e0d4ff";
    else if (mood === "Stress") document.body.style.background = "#b7fabe";
    else if (mood === "cool") document.body.style.background = "#b0f0ff";
    else if (mood === "lovely") document.body.style.background = "#ffccf0";
    showGameForMood(mood);

    createPop(event);
    const emoji = document.createElement("div");
  emoji.innerText = moodEmoji(mood);
  emoji.style.position = "fixed";
  emoji.style.fontSize = "60px";
  emoji.style.top = "50%";
  emoji.style.left = "50%";
  emoji.style.transform = "translate(-50%,-50%)";
  emoji.style.animation = "pop 1s ease";

  document.body.appendChild(emoji);

 setTimeout(()=>emoji.remove(),1000);
 if(mood==="Happy" || mood==="Lovely"){
    confetti();
}
}

// SAVE MOOD
function saveMood() {
    let note = document.getElementById("note").value;

    let moodEntry = {
        mood: selectedMood,
        note: note,
        date: new Date().toLocaleDateString()
    };

    let user = localStorage.getItem("loggedInUser");

    let moods = JSON.parse(localStorage.getItem("moods_" + user)) || [];
    moods.push(moodEntry);

    localStorage.setItem("moods_" + user, JSON.stringify(moods));

    updateCalendar();
    showHistory();
}

// SHOW HISTORY
function showHistory() {
    let user = localStorage.getItem("loggedInUser");
    let moods = JSON.parse(localStorage.getItem("moods_" + user)) || [];
    let historyDiv = document.getElementById("history");

    historyDiv.innerHTML = "";

    moods.forEach(m => {
        historyDiv.innerHTML += `
            <p><b>${m.date}</b> - ${m.mood} <br> ${m.note}</p>
        `;
    });

    updateChart(moods);
    updateInsight(moods);
    updateStreak(moods);
}
// LOGOUT
function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}
function updateChart(moods) {
    let count = {
    Happy: 0,
    Neutral: 0,
    Sad: 0,
    Angry: 0,
    Tired: 0,
    Stress: 0,
    Cool: 0,
    Lovely: 0
};

    moods.forEach(m => {
        if (count[m.mood] !== undefined) {
            count[m.mood]++;
        }
    });

    let ctx = document.getElementById("moodChart");

    if (moodChart) moodChart.destroy();

    moodChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(count),
            datasets: [{
                label: "Mood Count",
                data: Object.values(count)
            }]
        }
    });
}
function toggleDark() {
    document.body.classList.toggle("dark-mode");
}
function generateEmojis() {

    const emojis = ["😄","😐","😢","😡","😴","✨","💖","🌈","😎","😰"];
    const bg = document.getElementById("emojiBg");

    if (!bg) return; // prevents crash if element missing

    for (let i = 0; i < 30; i++) {

        let span = document.createElement("span");
        span.className = "emoji";
        span.innerText = emojis[Math.floor(Math.random() * emojis.length)];

        span.style.left = Math.random() * 100 + "%";
        span.style.top = Math.random() * 100 + "%";
        span.style.animationDuration = (6 + Math.random() * 10) + "s";
        span.style.fontSize = (20 + Math.random() * 20) + "px";

        bg.appendChild(span);
    }
}
function createPop(e) {
    let pop = document.createElement("div");
    pop.className = "pop";
    pop.innerText = "✨";

    pop.style.left = e.clientX + "px";
    pop.style.top = e.clientY + "px";

    document.body.appendChild(pop);

    setTimeout(() => pop.remove(), 600);
}
function updateInsight(moods) {
    if (moods.length === 0) return;

    let count = {};

    moods.forEach(m => {
        count[m.mood] = (count[m.mood] || 0) + 1;
    });

    let topMood = Object.keys(count).reduce((a, b) =>
        count[a] > count[b] ? a : b
    );

    let text = `This week you mostly felt ${topMood}.`;

    document.getElementById("insightText").innerText = text;
}
function updateStreak(moods) {
    if (moods.length === 0) {
        document.getElementById("streakText").innerText = "0 days";
        return;
    }

    // sort by date
    moods.sort((a, b) => new Date(b.date) - new Date(a.date));

    let streak = 1;
    let prevDate = new Date(moods[0].date);

    for (let i = 1; i < moods.length; i++) {
        let currDate = new Date(moods[i].date);
        let diff = (prevDate - currDate) / (1000 * 60 * 60 * 24);

        if (Math.round(diff) === 1) {
            streak++;
            prevDate = currDate;
        } else {
            break;
        }
    }

    document.getElementById("streakText").innerText = streak + " day streak";
}
function showGameForMood(mood) {
    const area = document.getElementById("gameArea");
    area.innerHTML = "";

   if (mood === "Angry" || mood === "Stress") {
    area.innerHTML = `
        <p>Pop bubbles to relax 😌</p>
        <button onclick="startBubbleGame()">▶ Start Game</button>
    `;
}

    else if (mood === "Sad"|| mood === "cool" || mood === "lovely") {
        area.innerHTML = "<p>Memory boost game 🧠</p>";
        startMemoryGame();
    }

    else if (mood === "Neutral") {
    area.innerHTML = `
        <p>Test your reaction speed ⚡</p>
        <button onclick="startReactionGame()">▶ Start Game</button>
        <div id="reactArea"></div>
    `;
}

    else if (mood === "Tired") {
        area.innerHTML = `
            <p>Follow breathing… 🌬️</p>
            <h2 id="breath">Breathe In</h2>
        `;
        startBreathing();
    }

    else if (mood === "Happy") {
        area.innerHTML = `
            <p>Spread the joy! 🎉</p>
            <button onclick="createConfetti()">Click for Confetti</button>
        `;
    }
}
function startReactionGame() {

    const area = document.getElementById("reactArea");

    area.innerHTML = `
        <button id="reactBtn" disabled>Wait...</button>
        <p id="reactResult"></p>
    `;

    const btn = document.getElementById("reactBtn");
    const result = document.getElementById("reactResult");

    let startTime = 0;

    // shorter delay so user doesn't feel bored
    let delay = 1000 + Math.random() * 2000;

    setTimeout(() => {
        btn.innerText = "CLICK!";
        btn.disabled = false;
        btn.style.background = "#28a745";
        startTime = Date.now();
    }, delay);

    btn.onclick = () => {
        if (!startTime) return; // safety check

        let time = Date.now() - startTime;
        result.innerText = "Your reaction: " + time + " ms";
        btn.disabled = true;
    };
}
function startBubbleGame() {
    const area = document.getElementById("gameArea");

    // reset
    stopBubbleGame();

    gameRunning = true;
    let score = 0;
    let timeLeft = 20; // 20-second game

    area.innerHTML = `
        <p>Smash the stress balls! 💥</p>
        <p>Score: <span id="score">0</span></p>
        <p>Time: <span id="timeLeft">${timeLeft}</span>s</p>
        <button onclick="stopBubbleGame()">🛑 End Game</button>
        <div id="bubbleField" style="position:relative;height:120px;"></div>
    `;

    const field = document.getElementById("bubbleField");

    function spawnBall() {
        if (!gameRunning) return;

        let ball = document.createElement("div");
        ball.className = "bubble";
        ball.style.background = "#ff7676";

        ball.style.left = Math.random() * (field.clientWidth - 50) + "px";
        ball.style.top = Math.random() * (field.clientHeight - 50) + "px";

        ball.onclick = () => {
            score++;
            document.getElementById("score").innerText = score;
            ball.remove();
        };

        field.appendChild(ball);

        let t = setTimeout(() => ball.remove(), 2000);
        bubbleTimeouts.push(t);
    }

    // spawn loop
    bubbleInterval = setInterval(spawnBall, 800);

    // countdown timer
    let timer = setInterval(() => {
        if (!gameRunning) {
            clearInterval(timer);
            return;
        }

        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            stopBubbleGame();
        }
    }, 1000);
}

function startMemoryGame() {
    const area = document.getElementById("gameArea");
    area.innerHTML = `
    <p>Memory boost game 🧠</p>
    <button onclick="startMemoryGame()">▶ Start Game</button>
`;

    const emojis = ["🌸","⭐","💖","🌈","🌸","⭐","💖","🌈"];
    emojis.sort(() => Math.random() - 0.5);

    let first = null;
    let lock = false;
    let matched = 0;

    emojis.forEach(e => {
        let card = document.createElement("div");
        card.className = "card";
        card.innerText = "?";

        card.onclick = () => {
            if (lock || card.innerText !== "?") return;

            card.innerText = e;

            if (!first) {
                first = card;
                return;
            }

            if (first.innerText === card.innerText) {
                matched += 2;
                first = null;

                if (matched === emojis.length) {
                    setTimeout(() => {
                        area.innerHTML += "<p>🎉 Great job!</p>";
                    }, 300);
                }
            } else {
                lock = true;
                setTimeout(() => {
                    first.innerText = "?";
                    card.innerText = "?";
                    first = null;
                    lock = false;
                }, 700);
            }
        };

        area.appendChild(card);
    });
}
let breathInterval;

function startBreathing() {

    let el = document.getElementById("breath");
    let state = true;

    if (breathInterval) clearInterval(breathInterval);

    el.innerText = "Breathe In";

    breathInterval = setInterval(() => {
        el.innerText = state ? "Breathe Out" : "Breathe In";
        state = !state;
    }, 2000);
}
function createConfetti() {
    for (let i = 0; i < 15; i++) {
        createPop({
            clientX: Math.random() * window.innerWidth,
            clientY: Math.random() * window.innerHeight
        });
    }
}
function startReactionGame() {

    const area = document.getElementById("reactArea");

    area.innerHTML = `
        <button id="reactBtn" disabled>Wait...</button>
        <p id="reactResult"></p>
    `;

    const btn = document.getElementById("reactBtn");
    const result = document.getElementById("reactResult");

    let startTime;

    setTimeout(() => {
        btn.innerText = "CLICK!";
        btn.disabled = false;
        btn.style.background = "green";
        startTime = Date.now();
    }, 2000 + Math.random() * 2000);

    btn.onclick = () => {
        let time = Date.now() - startTime;
        result.innerText = "Your reaction: " + time + " ms";
        btn.disabled = true;
    };
}
function stopBubbleGame() {
    gameRunning = false;

    if (bubbleInterval) {
        clearInterval(bubbleInterval);
        bubbleInterval = null;
    }

    // clear pending removals
    bubbleTimeouts.forEach(t => clearTimeout(t));
    bubbleTimeouts = [];

    const area = document.getElementById("gameArea");
    if (!area) return;

    const scoreEl = document.getElementById("score");
    if (scoreEl) {
        area.innerHTML += `<p>🏁 Game Over! Final Score: ${scoreEl.innerText}</p>`;
    }
}
window.addEventListener("DOMContentLoaded", () => {
    generateEmojis();
    updateCalendar();
});
const quotes = {
    Happy: "Happiness grows when shared 😊",
    Sad: "Tough days don’t last forever 🌈",
    Angry: "Take a deep breath and relax 😌",
    Stress: "You’re stronger than your stress 💪",
    Cool: "Stay cool and keep shining 😎",
    Lovely: "Spread love everywhere 💖",
    Neutral: "Every day is a new chance ✨",
    Tired: "Rest today, rise stronger tomorrow 💤"
};

function showQuote(mood){
    document.getElementById("quote").innerText = quotes[mood] || "";
}
function updateCalendar(){

    const cal = document.getElementById("calendar");
    if(!cal) return;   // prevents error if element not found

    cal.innerHTML = "";

    let user = localStorage.getItem("loggedInUser");
    let moods = JSON.parse(localStorage.getItem("moods_" + user)) || [];

    moods.slice(-7).forEach(entry => {

        let div = document.createElement("div");
        div.className = "day";
        div.innerText = entry.mood;

        cal.appendChild(div);

    });
}
function confetti(){

    for(let i=0;i<30;i++){

        let piece = document.createElement("div");
        piece.innerText = "🎉";
        piece.style.position="fixed";
        piece.style.left=Math.random()*100+"vw";
        piece.style.top="-20px";
        piece.style.fontSize="20px";
        piece.style.animation="fall 3s linear";

        document.body.appendChild(piece);

        setTimeout(()=>piece.remove(),3000);
    }
}
