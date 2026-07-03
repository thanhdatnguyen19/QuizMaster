// 1. NGÂN HÀNG CÂU HỎI ĐA DẠNG MỞ RỘNG (Gồm 10 câu hỏi mẫu ban đầu)
let quizDatabase = JSON.parse(localStorage.getItem('quizDB')) || [
    {
        id: 1, topic: "JavaScript", level: "easy",
        question: "Từ khóa nào dùng để khai báo biến không thể tái gán giá trị trong ES6?",
        options: ["var", "let", "const", "define"], correct: 2
    },
    {
        id: 2, topic: "JavaScript", level: "medium",
        question: "Kết quả của biểu thức `typeof []` trong JavaScript là gì?",
        options: ["'array'", "'object'", "'list'", "'undefined'"], correct: 1
    },
    {
        id: 3, topic: "JavaScript", level: "hard",
        question: "Phương thức nào tạo ra một mảng mới với các phần tử vượt qua kiểm tra của một hàm cho trước?",
        options: ["map()", "forEach()", "filter()", "reduce()"], correct: 2
    },
    {
        id: 4, topic: "HTML", level: "easy",
        question: "Thẻ HTML nào được sử dụng để hiển thị một hình ảnh trên trang web?",
        options: ["&lt;picture&gt;", "&lt;image&gt;", "&lt;img&gt;", "&lt;src&gt;"], correct: 2
    },
    {
        id: 5, topic: "HTML", level: "medium",
        question: "Thuộc tính nào dùng để xác định text thay thế cho ảnh nếu ảnh không load được?",
        options: ["title", "alt", "desc", "src"], correct: 1
    },
    {
        id: 6, topic: "CSS", level: "easy",
        question: "Thuộc tính nào điều chỉnh màu nền của một phần tử trong CSS?",
        options: ["color", "background-color", "text-color", "bg-color"], correct: 1
    },
    {
        id: 7, topic: "CSS", level: "medium",
        question: "Thuộc tính nào dùng để căn giữa dọc (cross axis) các item trong Flexbox container?",
        options: ["justify-content", "align-items", "align-content", "text-align"], correct: 1
    },
    {
        id: 8, topic: "React", level: "medium",
        question: "Hook nào dùng để quản lý state nội bộ của một Functional Component?",
        options: ["useEffect", "useContext", "useState", "useReducer"], correct: 2
    },
    {
        id: 9, topic: "React", level: "hard",
        question: "Mục đích chính của thuộc tính 'key' khi render một danh sách các phần tử là gì?",
        options: ["Để tăng độ bảo mật", "Để định dạng CSS dễ hơn", "Giúp React nhận biết phần tử nào đã thay đổi, thêm hoặc xóa", "Để lưu trữ ID của phần tử"], correct: 2
    },
    {
        id: 10, topic: "SQL", level: "medium",
        question: "Câu lệnh nào dùng để loại bỏ các hàng trùng lặp khỏi kết quả truy vấn?",
        options: ["SELECT UNIQUE", "SELECT DISTINCT", "SELECT DIFFERENT", "SELECT REMOVE"], correct: 1
    }
];

// 2. MẢNG LƯU TRỮ LỊCH SỬ THÍ SINH LÀM BÀI
let examHistory = JSON.parse(localStorage.getItem('examHistory')) || [];

// Lưu dữ liệu vào localStorage
function updateLocalStorage() {
    localStorage.setItem('quizDB', JSON.stringify(quizDatabase));
    localStorage.setItem('examHistory', JSON.stringify(examHistory));
}

// Đối tượng thí sinh hiện tại
let currentStudent = JSON.parse(sessionStorage.getItem('currentStudent')) || null;
let currentActiveQuestions = [];

// Chuyển tab giao diện
function switchTab(tabId) {
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if(tabId === 'public-view') {
        checkStudentSession();
    } else if(tabId === 'admin-view') {
        renderAdminTable();
        renderHistoryTable();
    }
}

/* ------------------ HỆ THỐNG XÁC THỰC NGƯỜI DÙNG ------------------ */
function checkStudentSession() {
    const loginBox = document.getElementById('user-login-box');
    const workspace = document.getElementById('quiz-workspace');

    if (currentStudent) {
        loginBox.style.display = 'none';
        workspace.style.display = 'block';
        document.getElementById('user-badge').innerHTML = `<i class="fa-solid fa-user"></i> ${currentStudent.name} (${currentStudent.id})`;
        initPublicView();
    } else {
        loginBox.style.display = 'block';
        workspace.style.display = 'none';
    }
}

function startQuizSession() {
    const name = document.getElementById('student-name').value.trim();
    const id = document.getElementById('student-id').value.trim();

    if (!name || !id) {
        alert("Vui lòng nhập đầy đủ họ tên và mã số học sinh!");
        return;
    }

    currentStudent = { name, id };
    sessionStorage.setItem('currentStudent', JSON.stringify(currentStudent));
    checkStudentSession();
}

function logoutStudent() {
    sessionStorage.removeItem('currentStudent');
    currentStudent = null;
    checkStudentSession();
}

/* ------------------ LUỒNG PUBLIC (LÀM BÀI & CHẤM ĐIỂM) ------------------ */
function initPublicView() {
    const topicFilter = document.getElementById('filter-topic');
    const topics = ['Tất cả', ...new Set(quizDatabase.map(q => q.topic))];
    topicFilter.innerHTML = topics.map(t => `<option value="${t}">${t}</option>`).join('');
    loadQuiz();
}

function loadQuiz() {
    const selectedTopic = document.getElementById('filter-topic').value || 'Tất cả';
    document.getElementById('result-box').style.display = 'none';
    document.getElementById('submit-quiz-btn').style.display = 'inline-flex';

    if (selectedTopic === 'Tất cả') {
        currentActiveQuestions = [...quizDatabase];
    } else {
        currentActiveQuestions = quizDatabase.filter(q => q.topic === selectedTopic);
    }

    renderQuizQuestions();
    renderNavigationGrid();
}

function renderQuizQuestions() {
    const wrapper = document.getElementById('questions-wrapper');
    if(currentActiveQuestions.length === 0) {
        wrapper.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:2rem;">Chưa có câu hỏi nào.</p>`;
        document.getElementById('submit-quiz-btn').style.display = 'none';
        return;
    }

    wrapper.innerHTML = currentActiveQuestions.map((q, qIndex) => `
        <div class="card question-card" id="q-block-${qIndex}">
            <div class="question-meta">
                <span class="badge badge-easy">${q.topic}</span>
                <span class="badge badge-${q.level}">${q.level === 'easy' ? 'Dễ' : q.level === 'medium' ? 'Trung bình' : 'Khó'}</span>
            </div>
            <div class="question-text">Câu ${qIndex + 1}: ${q.question}</div>
            <div class="options-list">
                ${q.options.map((opt, oIndex) => `
                    <label class="option-item" id="label-${qIndex}-${oIndex}">
                        <input type="radio" name="question-${qIndex}" value="${oIndex}" onchange="markAsAnswered(${qIndex})">
                        ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderNavigationGrid() {
    const grid = document.getElementById('quiz-nav-grid');
    grid.innerHTML = currentActiveQuestions.map((_, index) => `
        <div class="nav-num" id="nav-num-${index}" onclick="scrollToQuestion(${index})">${index + 1}</div>
    `).join('');
}

function markAsAnswered(qIndex) {
    document.getElementById(`nav-num-${qIndex}`).classList.add('answered');
}

function scrollToQuestion(index) {
    document.getElementById(`q-block-${index}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function submitQuiz() {
    let score = 0;
    const total = currentActiveQuestions.length;
    const selectedTopic = document.getElementById('filter-topic').value || 'Tất cả';

    currentActiveQuestions.forEach((q, qIndex) => {
        const selectedOpt = document.querySelector(`input[name="question-${qIndex}"]:checked`);
        const correctAnswerIndex = q.correct;

        for(let i=0; i<4; i++) {
            const label = document.getElementById(`label-${qIndex}-${i}`);
            if(label) label.classList.remove('correct', 'wrong');
        }

        document.getElementById(`label-${qIndex}-${correctAnswerIndex}`).classList.add('correct');

        if (selectedOpt) {
            const userAns = parseInt(selectedOpt.value);
            if (userAns === correctAnswerIndex) {
                score++;
            } else {
                document.getElementById(`label-${qIndex}-${userAns}`).classList.add('wrong');
            }
        }
    });

    document.getElementById('score-display').innerText = `${score} / ${total}`;
    document.getElementById('result-box').style.display = 'block';
    document.getElementById('submit-quiz-btn').style.display = 'none';
    document.getElementById('result-box').scrollIntoView({ behavior: 'smooth' });

    // LƯU LẠI KẾT QUẢ VÀO NHẬT KÝ HỆ THỐNG (Lịch sử làm bài)
    const logTime = new Date().toLocaleString('vi-VN');
    const performancePercent = ((score / total) * 100).toFixed(0) + '%';
    
    examHistory.unshift({
        time: logTime,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        topic: selectedTopic,
        score: `${score}/${total}`,
        percent: performancePercent
    });

    updateLocalStorage();
}

/* ------------------ LUỒNG ADMIN (BẢNG QUẢN TRỊ VIÊN) ------------------ */
function renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    if (examHistory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Chưa có thí sinh nào nộp bài.</td></tr>`;
        return;
    }
    tbody.innerHTML = examHistory.map(log => `
        <tr>
            <td>${log.time}</td>
            <td><code>${log.studentId}</code></td>
            <td><strong>${log.studentName}</strong></td>
            <td><span class="badge badge-easy">${log.topic}</span></td>
            <td><b style="color:var(--secondary);">${log.score}</b></td>
            <td><span class="user-display-badge" style="background:#fef3c7; color:#b45309;">${log.percent}</span></td>
        </tr>
    `).join('');
}

function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = quizDatabase.map(q => `
        <tr>
            <td><strong>${q.question}</strong></td>
            <td><span class="badge badge-easy">${q.topic}</span></td>
            <td><span class="badge badge-${q.level}">${q.level}</span></td>
            <td>
                <button class="actions-btn btn-edit" onclick="editQuestion(${q.id})" title="Sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="actions-btn btn-delete" onclick="deleteQuestion(${q.id})" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function saveQuestion(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const questionText = document.getElementById('q-text').value;
    const topic = document.getElementById('q-topic').value;
    const level = document.getElementById('q-level').value;
    const correct = parseInt(document.querySelector('input[name="correct-ans"]:checked').value);
    
    const options = [
        document.getElementById('opt-0').value,
        document.getElementById('opt-1').value,
        document.getElementById('opt-2').value,
        document.getElementById('opt-3').value
    ];

    if(id) {
        const index = quizDatabase.findIndex(q => q.id == id);
        quizDatabase[index] = { id: parseInt(id), topic, level, question: questionText, options, correct };
    } else {
        const newId = quizDatabase.length > 0 ? Math.max(...quizDatabase.map(q => q.id)) + 1 : 1;
        quizDatabase.push({ id: newId, topic, level, question: questionText, options, correct });
    }

    updateLocalStorage();
    renderAdminTable();
    resetAdminForm();
    alert('Lưu dữ liệu thành công!');
}

function editQuestion(id) {
    const q = quizDatabase.find(item => item.id === id);
    if(!q) return;

    document.getElementById('edit-id').value = q.id;
    document.getElementById('q-text').value = q.question;
    document.getElementById('q-topic').value = q.topic;
    document.getElementById('q-level').value = q.level;
    
    q.options.forEach((opt, index) => {
        document.getElementById(`opt-${index}`).value = opt;
    });

    document.querySelector(`input[name="correct-ans"][value="${q.correct}"]`).checked = true;
    document.getElementById('form-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Sửa Câu Hỏi (ID: ${q.id})`;
}

function deleteQuestion(id) {
    if(confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
        quizDatabase = quizDatabase.filter(q => q.id !== id);
        updateLocalStorage();
        renderAdminTable();
    }
}

function resetAdminForm() {
    document.getElementById('question-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('form-title').innerHTML = `<i class="fa-solid fa-circle-plus"></i> Thêm Câu Hỏi Mới`;
}

// Khởi tạo chạy lần đầu
window.onload = function() {
    checkStudentSession();
};
// Đường dẫn Mock API của bạn
const API_URL = "http://localhost:3000/questions";

// Hàm gọi API để lấy danh sách câu hỏi
function getQuestions() {
    fetch(API_URL)
        .then(response => {
            // Chuyển đổi dữ liệu nhận được sang dạng JSON
            return response.json();
        })
        .then(data => {
            // Dữ liệu câu hỏi thật từ db.json sẽ nằm ở đây
            console.log("Danh sách câu hỏi:", data);
            
            // Ví dụ: Bạn có thể viết tiếp hàm hiển thị câu hỏi lên giao diện tại đây
            // renderQuiz(data);
        })
        .catch(error => {
            // Xử lý nếu chẳng may lỗi mạng hoặc server sập
            console.error("Lỗi khi lấy dữ liệu:", error);
        });
}

// Chạy hàm test thử
getQuestions();