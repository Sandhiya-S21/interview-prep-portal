// ========================================
// Interview Practice Portal
// HTML + CSS + JavaScript + LocalStorage
// ========================================

const questions = [
    {
        id: 1, topic: "HR", type: "HR",
        question: "Tell me about yourself.",
        options: [
            "Talk only about personal hobbies.",
            "Introduce your education, skills, projects, and career goals.",
            "Discuss your family members in detail.",
            "Say that you have no skills."
        ],
        answer: 1,
        explanation: "Give a short introduction covering your education, technical skills, projects, strengths, and career goals."
    },
    {
        id: 2, topic: "HR", type: "HR",
        question: "Why should we hire you?",
        options: [
            "Because I need a job.",
            "Because I am better than everyone.",
            "I am willing to learn, adapt, and contribute using my skills.",
            "I do not have any weaknesses."
        ],
        answer: 2,
        explanation: "Explain your relevant skills, willingness to learn, adaptability, and how you can contribute to the company."
    },
    {
        id: 3, topic: "JavaScript", type: "Technical",
        question: "Which keyword declares a block-scoped variable that can be reassigned?",
        options: ["const", "let", "static", "define"],
        answer: 1,
        explanation: "The let keyword declares a block-scoped variable that can be reassigned."
    },
    {
        id: 4, topic: "JavaScript", type: "Technical",
        question: "What does === check in JavaScript?",
        options: ["Only the value", "Only the data type", "Both value and data type", "Whether a variable exists"],
        answer: 2,
        explanation: "The strict equality operator (===) compares both value and data type without automatic type conversion."
    },
    {
        id: 5, topic: "Python", type: "Technical",
        question: "Which keyword defines a function in Python?",
        options: ["function", "func", "def", "create"],
        answer: 2,
        explanation: "Python uses the def keyword to define a function."
    },
    {
        id: 6, topic: "Python", type: "Technical",
        question: "What is the output of print(2 ** 3)?",
        options: ["6", "8", "9", "5"],
        answer: 1,
        explanation: "The ** operator performs exponentiation. Therefore, 2 ** 3 equals 8."
    },
    {
        id: 7, topic: "SQL", type: "Technical",
        question: "Which SQL command retrieves data from a table?",
        options: ["UPDATE", "DELETE", "SELECT", "INSERT"],
        answer: 2,
        explanation: "SELECT retrieves data from one or more database tables."
    },
    {
        id: 8, topic: "SQL", type: "Technical",
        question: "Which clause filters grouped SQL results?",
        options: ["ORDER BY", "HAVING", "INSERT", "DISTINCT"],
        answer: 1,
        explanation: "HAVING filters groups after GROUP BY has been applied."
    },
    {
        id: 9, topic: "Python", type: "Technical",
        question: "Which Python data type stores unique elements?",
        options: ["list", "tuple", "set", "string"],
        answer: 2,
        explanation: "A set stores unique elements and removes duplicate values."
    },
    {
        id: 10, topic: "HR", type: "HR",
        question: "What is your greatest strength?",
        options: [
            "I never make mistakes.",
            "I am a quick learner and enjoy solving problems.",
            "I do not like teamwork.",
            "I avoid learning new things."
        ],
        answer: 1,
        explanation: "Choose a genuine strength and support it with a real example from your studies or projects."
    },
    {
        id: 11, topic: "JavaScript", type: "Technical",
        question: "Which method adds an item to the end of a JavaScript array?",
        options: ["push()", "pop()", "shift()", "join()"],
        answer: 0,
        explanation: "The push() method adds one or more elements to the end of an array."
    },
    {
        id: 12, topic: "SQL", type: "Technical",
        question: "Which clause sorts query results?",
        options: ["GROUP BY", "WHERE", "ORDER BY", "HAVING"],
        answer: 2,
        explanation: "ORDER BY sorts results in ascending or descending order."
    },
    {
        id: 13, topic: "HTML/CSS", type: "Technical",
        question: "Which HTML tag creates a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        answer: 1,
        explanation: "The <a> (anchor) tag creates hyperlinks, using the href attribute for the destination."
    },
    {
        id: 14, topic: "HTML/CSS", type: "Technical",
        question: "Which CSS property changes the text color of an element?",
        options: ["font-color", "text-style", "color", "foreground"],
        answer: 2,
        explanation: "The color property sets the text color of an element."
    }
];

const QUIZ_LENGTH = 5;          // max questions per quiz
const SECONDS_PER_QUESTION = 30;

// ========================================
// LocalStorage
// ========================================

const STORAGE_KEY = "interviewPracticePortalData";

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
                history: Array.isArray(parsed.history) ? parsed.history : [],
                attempted: Array.isArray(parsed.attempted) ? parsed.attempted : []
            };
        }
    } catch (error) {
        console.error("Could not load saved data:", error);
    }
    return { bookmarks: [], history: [], attempted: [] };
}

let appData = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
        console.error("Could not save data:", error);
        showToast("Could not save progress in this browser.");
    }
}

// ========================================
// State
// ========================================

let currentQuestions = [];
let currentIndex = 0;
let selectedAnswer = null;
let answered = false;
let quizCorrect = 0;
let quizAnswers = [];
let quizStartTime = null;
let quizLabel = "Mixed";
let timerInterval = null;
let secondsRemaining = SECONDS_PER_QUESTION;
let activeTopic = "All";
let activeType = "All";
let searchText = "";

// ========================================
// Helpers
// ========================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return [...document.querySelectorAll(selector)];
}

function setText(selector, value) {
    const element = $(selector);
    if (element) element.textContent = value;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function formatClock(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
}

function showToast(message) {
    const toast = $("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2500);
}

// ========================================
// Navigation
// ========================================

const VIEW_IDS = {
    dashboard: "dashboardView",
    practice: "practiceView",
    bookmarks: "bookmarksView",
    history: "historyView",
    quiz: "quizView",
    results: "resultsView"
};

const PAGE_LABELS = {
    dashboard: "Dashboard",
    practice: "Practice Questions",
    bookmarks: "Bookmarks",
    history: "Quiz History",
    quiz: "Practice Quiz",
    results: "Quiz Results"
};

function showView(name) {
    if (name !== "quiz") stopTimer();

    Object.entries(VIEW_IDS).forEach(([key, id]) => {
        const element = document.getElementById(id);
        if (element) element.classList.toggle("active-view", key === name);
    });

    const navName = name === "quiz" || name === "results" ? "practice" : name;
    $$(".nav-link").forEach(button => {
        button.classList.toggle("active", button.dataset.view === navName);
    });

    setText("#pageLabel", PAGE_LABELS[name] || "Dashboard");
    closeSidebar();

    if (name === "dashboard") updateDashboard();
    if (name === "practice") renderQuestions();
    if (name === "bookmarks") renderBookmarks();
    if (name === "history") renderHistory();

    window.scrollTo(0, 0);
}

function closeSidebar() {
    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");
}

// ========================================
// Question list
// ========================================

function getFilteredQuestions() {
    return questions.filter(question => {
        const matchesTopic =
            activeTopic === "All" ||
            question.topic.toLowerCase() === activeTopic.toLowerCase();

        const matchesType =
            activeType === "All" ||
            question.type.toLowerCase() === activeType.toLowerCase();

        const matchesSearch =
            question.question.toLowerCase().includes(searchText) ||
            question.topic.toLowerCase().includes(searchText);

        return matchesTopic && matchesType && matchesSearch;
    });
}

function questionCardHTML(question, { showStatus, removeLabel }) {
    const bookmarked = appData.bookmarks.includes(question.id);
    const attempted = appData.attempted.includes(question.id);

    return `
        <article class="question-card">
            <div class="question-card-content">
                <span class="pill primary">${escapeHTML(question.topic)}</span>
                <h3>${escapeHTML(question.question)}</h3>
                ${showStatus ? `
                    <p>${escapeHTML(question.type)} question &middot;
                       ${attempted ? "Previously attempted" : "Not attempted yet"}</p>` : ""}
            </div>
            <div class="question-card-actions">
                <button class="primary-button" data-action="practice-question"
                        data-id="${question.id}">Practice</button>
                <button class="secondary-button" data-action="bookmark-question"
                        data-id="${question.id}">
                    ${removeLabel ? "Remove" : bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
                </button>
            </div>
        </article>
    `;
}

function renderQuestions() {
    const container = $("#questionList");
    if (!container) return;

    const filtered = getFilteredQuestions();
    setText("#resultCount",
        `${filtered.length} question${filtered.length === 1 ? "" : "s"}`);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No questions found. Try another search or filter.</p>
            </div>`;
        return;
    }

    container.innerHTML = filtered
        .map(question => questionCardHTML(question, { showStatus: true }))
        .join("");
}

// ========================================
// Bookmarks
// ========================================

function toggleBookmark(questionId) {
    if (appData.bookmarks.includes(questionId)) {
        appData.bookmarks = appData.bookmarks.filter(id => id !== questionId);
        showToast("Bookmark removed.");
    } else {
        appData.bookmarks.push(questionId);
        showToast("Question bookmarked.");
    }

    saveData();
    renderQuestions();
    renderBookmarks();
    updateBookmarkCount();
    updateQuizBookmarkButton();
}

function updateBookmarkCount() {
    setText("#bookmarkCount", appData.bookmarks.length);
}

function renderBookmarks() {
    const container = $("#bookmarkList");
    if (!container) return;

    const saved = questions.filter(q => appData.bookmarks.includes(q.id));

    if (saved.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>You haven't bookmarked any questions yet.</p>
            </div>`;
        return;
    }

    container.innerHTML = saved
        .map(question => questionCardHTML(question, { removeLabel: true }))
        .join("");
}

function updateQuizBookmarkButton() {
    const button = $("#bookmarkQuizQuestion");
    const question = currentQuestions[currentIndex];
    if (!button || !question) return;

    button.textContent = appData.bookmarks.includes(question.id)
        ? "★ Bookmarked"
        : "☆ Bookmark";
}

// ========================================
// Quiz
// ========================================

function startQuiz(list, label = "Mixed") {
    stopTimer();

    if (!list.length) {
        showToast("No questions available.");
        return;
    }

    currentQuestions = list.slice(0, QUIZ_LENGTH);
    currentIndex = 0;
    quizCorrect = 0;
    quizAnswers = [];
    quizLabel = label;
    quizStartTime = Date.now();

    setText("#quizTopicPill", label === "Mixed" ? "Practice Quiz" : label);
    setText("#quizTotal", currentQuestions.length);
    setText("#quizAnswered", 0);

    showView("quiz");
    showCurrentQuestion();
}

function showCurrentQuestion() {
    stopTimer();

    const question = currentQuestions[currentIndex];
    if (!question) {
        finishQuiz();
        return;
    }

    selectedAnswer = null;
    answered = false;
    secondsRemaining = SECONDS_PER_QUESTION;

    setText("#questionPosition",
        `Question ${currentIndex + 1} of ${currentQuestions.length}`);
    setText("#quizCategory", `${question.topic} · ${question.type}`);
    setText("#quizQuestion", question.question);

    const progress = $("#quizProgress");
    if (progress) {
        progress.style.width =
            `${((currentIndex + 1) / currentQuestions.length) * 100}%`;
    }

    const options = $("#answerOptions");
    if (options) {
        options.innerHTML = question.options.map((option, index) => `
            <button type="button" class="answer-option" data-answer="${index}">
                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                <span class="answer-text">${escapeHTML(option)}</span>
            </button>
        `).join("");
    }

    const feedback = $("#answerFeedback");
    if (feedback) {
        feedback.className = "feedback-box hidden";
        feedback.innerHTML = "";
    }

    const actionButton = $("#nextQuestion");
    if (actionButton) {
        actionButton.textContent = "Check Answer";
        actionButton.disabled = true;
    }

    updateQuizBookmarkButton();
    startTimer();
}

function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        secondsRemaining--;
        updateTimerDisplay();

        if (secondsRemaining <= 0) {
            stopTimer();
            submitAnswer(true);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const timer = $("#timer");
    if (!timer) return;

    timer.textContent = formatClock(Math.max(secondsRemaining, 0));
    timer.classList.toggle("warning", secondsRemaining <= 10);
}

function selectAnswer(index) {
    if (answered) return;

    selectedAnswer = Number(index);

    $$(".answer-option").forEach((button, buttonIndex) => {
        button.classList.toggle("selected", buttonIndex === selectedAnswer);
    });

    const actionButton = $("#nextQuestion");
    if (actionButton) actionButton.disabled = false;
}

function submitAnswer(timedOut = false) {
    if (answered) return;

    if (selectedAnswer === null && !timedOut) {
        showToast("Please select an answer first.");
        return;
    }

    answered = true;
    stopTimer();

    const question = currentQuestions[currentIndex];
    const isCorrect = selectedAnswer === question.answer;

    if (isCorrect) quizCorrect++;

    if (!appData.attempted.includes(question.id)) {
        appData.attempted.push(question.id);
    }

    quizAnswers.push({
        questionId: question.id,
        selectedAnswer,
        correct: isCorrect
    });

    $$(".answer-option").forEach((button, index) => {
        button.disabled = true;
        button.classList.remove("selected");

        if (index === question.answer) {
            button.classList.add("correct");
        } else if (index === selectedAnswer) {
            button.classList.add("incorrect");
        }
    });

    const feedback = $("#answerFeedback");
    if (feedback) {
        let heading;
        if (selectedAnswer === null) {
            heading = `Time's up! Correct answer: ${question.options[question.answer]}`;
        } else {
            heading = isCorrect ? "Correct!" : "Incorrect.";
        }

        feedback.className = `feedback-box ${isCorrect ? "correct" : "incorrect"}`;
        feedback.innerHTML = `
            <h3>${escapeHTML(heading)}</h3>
            <p>${escapeHTML(question.explanation)}</p>
        `;
    }

    setText("#quizAnswered", quizAnswers.length);

    const actionButton = $("#nextQuestion");
    if (actionButton) {
        actionButton.disabled = false;
        actionButton.textContent =
            currentIndex === currentQuestions.length - 1
                ? "View Results"
                : "Next Question";
    }

    saveData();
}

function nextQuestion() {
    currentIndex++;

    if (currentIndex >= currentQuestions.length) {
        finishQuiz();
    } else {
        showCurrentQuestion();
    }
}

function finishQuiz() {
    stopTimer();

    const total = currentQuestions.length;
    const elapsedSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
    const accuracy = total ? Math.round((quizCorrect / total) * 100) : 0;

    appData.history.unshift({
        date: new Date().toISOString(),
        topic: quizLabel,
        total,
        correct: quizCorrect,
        accuracy,
        duration: elapsedSeconds,
        answers: quizAnswers
    });
    appData.history = appData.history.slice(0, 50);
    saveData();

    setText("#finalScore", `${accuracy}%`);
    setText("#finalCorrect", `${quizCorrect} / ${total}`);
    setText("#finalTime", formatClock(elapsedSeconds));
    setText("#finalTopic", quizLabel);

    if (accuracy >= 80) {
        setText("#resultTitle", "Excellent Work!");
        setText("#resultSubtitle", "You're well prepared on these questions.");
    } else if (accuracy >= 50) {
        setText("#resultTitle", "Nice Work!");
        setText("#resultSubtitle", "Review the explanations to improve further.");
    } else {
        setText("#resultTitle", "Keep Practicing!");
        setText("#resultSubtitle", "Read the explanations and try again.");
    }

    const scoreCircle = $(".result-score");
    if (scoreCircle) {
        scoreCircle.style.setProperty("--score-angle", `${accuracy * 3.6}deg`);
    }

    showView("results");
}

// ========================================
// Dashboard
// ========================================

function updateDashboard() {
    const history = appData.history;
    const totalAnswered = history.reduce((sum, r) => sum + r.total, 0);
    const totalCorrect = history.reduce((sum, r) => sum + r.correct, 0);

    const averageScore = history.length
        ? Math.round(history.reduce((sum, r) => sum + r.accuracy, 0) / history.length)
        : null;

    const accuracy = totalAnswered
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : null;

    setText("#totalQuestions", questions.length);
    setText("#attemptedQuestions", appData.attempted.length);
    setText("#averageScore", averageScore === null ? "—" : `${averageScore}%`);
    setText("#accuracy", accuracy === null ? "—" : `${accuracy}%`);
    updateBookmarkCount();

    renderChart();
}

function renderChart() {
    const canvas = $("#scoreChart");
    const emptyMessage = $("#chartEmpty");
    if (!canvas) return;

    const hasData = appData.history.length > 0;

    if (emptyMessage) emptyMessage.classList.toggle("hidden", hasData);
    canvas.style.display = hasData ? "block" : "none";

    if (window.scoreChartInstance) {
        window.scoreChartInstance.destroy();
        window.scoreChartInstance = null;
    }

    if (!hasData || typeof Chart === "undefined") return;

    const recent = appData.history.slice(0, 7).reverse();
    const firstNumber = appData.history.length - recent.length + 1;

    window.scoreChartInstance = new Chart(canvas, {
        type: "line",
        data: {
            labels: recent.map((_, i) => `Quiz ${firstNumber + i}`),
            datasets: [{
                label: "Accuracy (%)",
                data: recent.map(r => r.accuracy),
                borderColor: "#5b5ce2",
                backgroundColor: "#5b5ce2",
                borderWidth: 2,
                tension: 0.3,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

// ========================================
// Quiz history
// ========================================

function renderHistory() {
    const body = $("#historyBody");
    const empty = $("#historyEmpty");
    if (!body) return;

    const hasHistory = appData.history.length > 0;
    if (empty) empty.classList.toggle("hidden", hasHistory);

    body.innerHTML = appData.history.map((record, index) => `
        <tr>
            <td>Quiz ${appData.history.length - index}
                (${escapeHTML(record.topic || "Mixed")})</td>
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.total}</td>
            <td class="score-text">${record.correct} / ${record.total}</td>
            <td>${record.accuracy}%</td>
        </tr>
    `).join("");
}

// ========================================
// Reset
// ========================================

function resetProgress() {
    stopTimer();
    appData = { bookmarks: [], history: [], attempted: [] };
    saveData();
    showToast("Your progress has been reset.");
    showView("dashboard");
}

// ========================================
// Events
// ========================================

document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    // Sidebar navigation
    if (button.dataset.view) {
        showView(button.dataset.view);
        return;
    }

    // Question cards
    const action = button.dataset.action;
    if (action === "practice-question") {
        const question = questions.find(q => q.id === Number(button.dataset.id));
        if (question) startQuiz([question], question.topic);
        return;
    }
    if (action === "bookmark-question") {
        toggleBookmark(Number(button.dataset.id));
        return;
    }

    // Answer choice
    if (button.classList.contains("answer-option")) {
        selectAnswer(button.dataset.answer);
        return;
    }

    // Topic shortcuts on dashboard
    if (button.dataset.topic) {
        const topic = button.dataset.topic;
        startQuiz(
            shuffle(questions.filter(q => q.topic === topic)),
            topic
        );
        return;
    }

    switch (button.id) {
        case "startFromDashboard":
        case "retryQuiz":
            startQuiz(shuffle(questions), "Mixed");
            break;

        case "startFilteredQuiz":
            startQuiz(
                shuffle(getFilteredQuestions()),
                activeTopic === "All" ? "Mixed" : activeTopic
            );
            break;

        case "nextQuestion":
            if (answered) nextQuestion();
            else submitAnswer();
            break;

        case "bookmarkQuizQuestion": {
            const question = currentQuestions[currentIndex];
            if (question) toggleBookmark(question.id);
            break;
        }

        case "exitQuiz":
            showView("dashboard");
            break;

        case "reviewQuestions":
            showView("practice");
            break;

        case "menuToggle":
            $("#sidebar")?.classList.toggle("open");
            break;

        case "resetData":
            $("#confirmDialog")?.showModal();
            break;

        case "cancelReset":
            $("#confirmDialog")?.close();
            break;

        case "confirmReset":
            $("#confirmDialog")?.close();
            resetProgress();
            break;

        case "closeDialog":
            $("#explanationDialog")?.close();
            break;
    }
});

function setupFilters() {
    $("#searchInput")?.addEventListener("input", event => {
        searchText = event.target.value.trim().toLowerCase();
        renderQuestions();
    });

    $("#topicFilter")?.addEventListener("change", event => {
        activeTopic = event.target.value;
        renderQuestions();
    });

    $("#typeFilter")?.addEventListener("change", event => {
        activeType = event.target.value;
        renderQuestions();
    });
}

// ========================================
// Initialize
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    setupFilters();
    showView("dashboard");
});