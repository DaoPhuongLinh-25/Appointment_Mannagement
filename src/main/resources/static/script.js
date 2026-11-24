
const STORAGE_KEY = "planify_appointments_v1";

let appointments = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

let currentView = "all";

const $ = id => document.getElementById(id);

// LƯU DỮ LIỆU

function save() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appointments)
    );
}

// ĐỊNH DẠNG NGÀY GIỜ

function formatDate(value) {
    return new Date(value).toLocaleDateString("vi-VN");
}

function formatTime(value) {
    return new Date(value).toLocaleTimeString(
        "vi-VN",
        { hour: "2-digit", minute: "2-digit" }
    );
}

function sameDay(a, b) {
    return new Date(a).toDateString() ===
        new Date(b).toDateString();
}

// KIỂM TRA TRẠNG THÁI

function statusOf(a) {
    const now = new Date();
    const start = new Date(a.start);
    const end = new Date(a.end);

    if (start <= now && end >= now) return "today";
    if (start > now) return "upcoming";

    return "past";
}

function statusLabel(status) {
    if (status === "today") return "Đang diễn ra";
    if (status === "upcoming") return "Sắp diễn ra";

    return "Đã qua";
}

// SẮP XẾP LỊCH HẸN

function sortedAppointments() {
    return [...appointments].sort(
        (a, b) => new Date(a.start) - new Date(b.start)
    );
}

// CHỐNG LỖI HIỂN THỊ HTML

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

// HIỂN THỊ DASHBOARD

function render() {
    const now = new Date();

    const today = appointments.filter(
        a => sameDay(a.start, now)
    );

    const upcoming = appointments.filter(
        a => new Date(a.end) >= now
    );

    const places = new Set(
        appointments.map(a => a.location.trim()).filter(Boolean)
    );

    $("totalStat").textContent = appointments.length;
    $("todayStat").textContent = today.length;
    $("upcomingStat").textContent = upcoming.length;
    $("placeStat").textContent = places.size;

    let data = sortedAppointments();

    const keyword = $("searchInput").value.toLowerCase();
    const filter = $("statusFilter").value;

    data = data.filter(a => {
        const content = (
            a.title + " " +
            a.location + " " +
            a.description
        ).toLowerCase();

        return content.includes(keyword) &&
            (filter === "all" || statusOf(a) === filter);
    });

    if (currentView === "today") {
        data = data.filter(a => sameDay(a.start, now));
    }

    if (currentView === "upcoming") {
        data = data.filter(a => new Date(a.end) >= now);
    }

    if (currentView === "calendar") {
        data = data.filter(
            a => sameDay(a.start, $("dayPicker").value)
        );
    }

    const rows = $("appointmentRows");

    if (data.length === 0) {
        rows.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:40px">
                    Chưa có lịch hẹn nào.
                </td>
            </tr>
        `;
    } else {
        rows.innerHTML = data.map(a => {
            const status = statusOf(a);

            return `
                <tr>
                    <td>
                        <div class="appt-title">
                            ${escapeHTML(a.title)}
                        </div>
                        <div class="subtext">
                            ${escapeHTML(a.description || "Không có mô tả")}
                        </div>
                    </td>

                    <td>
                        <div>${formatDate(a.start)}</div>
                        <div class="subtext">
                            ${formatTime(a.start)} - ${formatTime(a.end)}
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(a.location || "Chưa xác định")}
                    </td>

                    <td>
                        <span class="status ${status}">
                            ${statusLabel(status)}
                        </span>
                    </td>

                    <td>
                        <div class="actions">
                            <button class="icon-btn"
                                onclick="editAppointment('${a.id}')">
                                ✎
                            </button>

                            <button class="icon-btn delete"
                                onclick="deleteAppointment('${a.id}')">
                                ✕
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");
    }

    $("countLabel").textContent =
        `Hiển thị ${data.length} / ${appointments.length} lịch hẹn`;

    renderDay();
}

// MỞ FORM

function openModal(a = null) {
    $("appointmentForm").reset();

    $("formAlert").className = "alert";

    $("editId").value = a?.id || "";

    $("modalTitle").textContent = a
        ? "Chỉnh sửa lịch hẹn"
        : "Tạo lịch hẹn mới";

    if (a) {
        $("title").value = a.title;
        $("start").value = a.start;
        $("end").value = a.end;
        $("location").value = a.location;
        $("description").value = a.description;
    } else {
        const now = new Date();

        now.setMinutes(
            Math.ceil(now.getMinutes() / 15) * 15,
            0,
            0
        );

        const end = new Date(now.getTime() + 3600000);

        const localDate = date => new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString().slice(0, 16);

        $("start").value = localDate(now);
        $("end").value = localDate(end);
    }

    $("modalBackdrop").classList.add("show");
}

function closeModal() {
    $("modalBackdrop").classList.remove("show");
}

// KIỂM TRA TRÙNG LỊCH

function overlaps(start, end, a) {
    return new Date(start) < new Date(a.end) &&
        new Date(end) > new Date(a.start);
}

// THÊM / CẬP NHẬT LỊCH HẸN

$("appointmentForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const id = $("editId").value;

    const title = $("title").value.trim();
    const start = $("start").value;
    const end = $("end").value;
    const location = $("location").value.trim();
    const description = $("description").value.trim();

    const alert = $("formAlert");

    if (new Date(end) <= new Date(start)) {
        alert.className = "alert show error";
        alert.textContent =
            "Thời gian kết thúc phải sau thời gian bắt đầu.";
        return;
    }

    const conflicts = appointments.filter(a =>
        a.id !== id && overlaps(start, end, a)
    );

    if (conflicts.length > 0) {
        alert.className = "alert show warn";

        alert.textContent =
            "CẢNH BÁO: Lịch hẹn bị trùng với " +
            conflicts.map(a => a.title).join(", ");

        return;
    }

    const appointment = {
        id: id || String(Date.now()),
        title,
        start,
        end,
        location,
        description
    };

    if (id) {
        appointments = appointments.map(a =>
            a.id === id ? appointment : a
        );
    } else {
        appointments.push(appointment);
    }

    save();
    render();
    closeModal();

    showToast(
        id ? "Cập nhật lịch hẹn thành công!"
            : "Thêm lịch hẹn thành công!"
    );
});

// SỬA LỊCH HẸN

function editAppointment(id) {
    const appointment = appointments.find(a => a.id === id);

    if (appointment) {
        openModal(appointment);
    }
}

// XÓA LỊCH HẸN

function deleteAppointment(id) {
    const appointment = appointments.find(a => a.id === id);

    if (appointment && confirm(
        `Bạn có chắc muốn xóa lịch "${appointment.title}" không?`
    )) {
        appointments = appointments.filter(a => a.id !== id);

        save();
        render();

        showToast("Đã xóa lịch hẹn!");
    }
}

// LỊCH HẸN THEO NGÀY

function renderDay() {
    const selectedDate = $("dayPicker").value;

    if (!selectedDate) return;

    const data = sortedAppointments().filter(
        a => sameDay(a.start, selectedDate)
    );

    $("dayResult").innerHTML = data.length
        ? data.map(a => `
            <div style="padding:15px;border-bottom:1px solid #eee">
                <b>${escapeHTML(a.title)}</b>
                <p style="margin-top:8px;color:#4263eb">
                    ${formatTime(a.start)} - ${formatTime(a.end)}
                </p>
                <p>${escapeHTML(a.location || "Chưa có địa điểm")}</p>
            </div>
        `).join("")
        : "<p>Không có lịch hẹn trong ngày này.</p>";
}

// CHUYỂN MENU

function setView(view) {
    currentView = view;

    document.querySelectorAll(".nav").forEach(btn => {
        btn.classList.toggle(
            "active",
            btn.dataset.view === view
        );
    });

    const names = {
        all: "Tổng quan lịch hẹn",
        today: "Lịch hẹn hôm nay",
        upcoming: "Lịch hẹn sắp tới",
        calendar: "Lịch hẹn theo ngày"
    };

    $("pageTitle").textContent = names[view];

    $("dayPanel").style.display =
        view === "calendar" ? "block" : "none";

    render();
}

// THÔNG BÁO

function showToast(message) {
    $("toast").textContent = message;

    $("toast").classList.add("show");

    setTimeout(() => {
        $("toast").classList.remove("show");
    }, 2500);
}

// SỰ KIỆN

$("addBtn").onclick = () => openModal();

$("closeModal").onclick = closeModal;

$("cancelBtn").onclick = closeModal;

$("searchInput").addEventListener("input", render);

$("statusFilter").addEventListener("change", render);

$("dayPicker").addEventListener("change", render);

document.querySelectorAll(".nav").forEach(btn => {
    btn.onclick = () => setView(btn.dataset.view);
});

// KHỞI TẠO

$("todayLabel").textContent =
    new Date().toLocaleDateString("vi-VN");

$("dayPicker").value =
    new Date().toISOString().slice(0, 10);

render();
