
const $ = (id) => document.getElementById(id);

// ==========================================
// VACANTE - COE 102 CLASS SCHEDULE
// ==========================================

const schedule = [
  {
    start: "07:00",
    end: "08:00",
    subject: "ENGSCI3",
    room: "COE 102",
    type: "class"
  },
  {
    start: "09:00",
    end: "10:00",
    subject: "GEC 104",
    room: "COE 102",
    type: "class"
  },
  {
    start: "11:00",
    end: "12:00",
    subject: "CAD CCS",
    room: "COE 102",
    type: "class"
  },
  {
    start: "12:00",
    end: "14:00",
    subject: "VACANT TIME",
    room: "COE 102",
    type: "free"
  },
  {
    start: "15:00",
    end: "16:00",
    subject: "ENGSCI 1",
    room: "COE 102",
    type: "class"
  }
];

// Schedule display runs from 7 AM to 6 PM
const DAY_START = 7 * 60;
const DAY_END = 18 * 60;

// ==========================================
// TIME FUNCTIONS
// ==========================================

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

// ==========================================
// CLOCK
// ==========================================

function updateClock() {
  const now = new Date();

  if ($("clock")) {
    $("clock").textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  if ($("today-label")) {
    $("today-label").textContent = now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  if ($("schedule-date")) {
    $("schedule-date").textContent = now.toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
}

// ==========================================
// SCHEDULE DISPLAY
// ==========================================

function renderSchedule() {
  const list = $("schedule-list");
  if (!list) return;

  list.innerHTML = "";

  const sessions = [...schedule].sort((a, b) =>
    a.start.localeCompare(b.start)
  );

  let previousEnd = DAY_START;
  let freeCount = 0;
  let classCount = 0;

  sessions.forEach((item) => {
    const start = timeToMinutes(item.start);
    const end = timeToMinutes(item.end);

    // Automatically display free time between sessions
    if (start > previousEnd) {
      freeCount++;

      addScheduleItem({
        title: "VACANT",
        time: `${formatTime(minutesToTime(previousEnd))} – ${formatTime(item.start)}`,
        details: "COE 102 • Available Classroom",
        type: "free"
      });
    }

    // Display the scheduled class or specified vacant period
    if (item.type === "class") {
      classCount++;
    } else {
      freeCount++;
    }

    addScheduleItem({
      title: item.subject,
      time: `${formatTime(item.start)} – ${formatTime(item.end)}`,
      details: `${item.room} • ${item.type === "class" ? "Scheduled Class" : "Available Classroom"}`,
      type: item.type
    });

    previousEnd = Math.max(previousEnd, end);
  });

  // Display free time after the last session
  if (previousEnd < DAY_END) {
    freeCount++;

    addScheduleItem({
      title: "VACANT",
      time: `${formatTime(minutesToTime(previousEnd))} – ${formatTime(minutesToTime(DAY_END))}`,
      details: "COE 102 • Available Classroom",
      type: "free"
    });
  }

  if ($("class-count")) {
    $("class-count").textContent = classCount;
  }

  if ($("free-count")) {
    $("free-count").textContent = freeCount;
  }
}

function addScheduleItem(item) {
  const list = $("schedule-list");
  if (!list) return;

  const row = document.createElement("div");
  row.className = `schedule-item ${item.type}`;

  const time = document.createElement("div");
  time.className = "schedule-time";
  time.textContent = item.time;

  const info = document.createElement("div");
  info.className = "schedule-info";

  const title = document.createElement("div");
  title.className = "schedule-subject";
  title.textContent = item.title;

  const details = document.createElement("div");
  details.className = "schedule-meta";
  details.textContent = item.details;

  info.appendChild(title);
  info.appendChild(details);

  row.appendChild(time);
  row.appendChild(info);

  list.appendChild(row);
}

// ==========================================
// OCCUPANCY STATUS
// ==========================================

function updateStatus(data) {
  const statusIcon = $("status-icon");
  const statusTitle = $("status-title");
  const statusDescription = $("status-description");

  function setSensorLabels(message) {
    if ($("sensor-source")) {
      $("sensor-source").textContent = message;
    }

    if ($("sensor-status")) {
      $("sensor-status").textContent = message;
    }
  }

  // Server error or unavailable data
  if (!data || data.ok !== true) {
    if (statusIcon) {
      statusIcon.textContent = "!";
      statusIcon.className = "status-icon unknown";
    }

    if (statusTitle) {
      statusTitle.textContent = "SENSOR UNAVAILABLE";
    }

    if (statusDescription) {
      statusDescription.textContent =
        "Unable to retrieve sensor information. Please check the server and Blynk connection.";
    }

    setSensorLabels("Unavailable");

    if ($("connection-label")) {
      $("connection-label").textContent = "Disconnected";
    }

    if ($("data-source")) {
      $("data-source").textContent = "Unavailable";
    }

    if ($("demo-panel")) {
      $("demo-panel").hidden = true;
    }

    return;
  }

  const isDemo = data.source === "demo";
  const hardwareConnected = data.hardwareConnected === true;
  const occupied = data.occupied === true;
  const motion = data.motion === true;

  // Connection indicator
  if ($("connection-label")) {
    $("connection-label").textContent = isDemo
      ? "Demo Mode"
      : hardwareConnected
        ? "Hardware Connected"
        : "Hardware Disconnected";
  }

  // Data source
  if ($("data-source")) {
    $("data-source").textContent =
      isDemo ? "Demo Mode" : "Blynk Cloud";
  }

  // Last checked
  if ($("last-checked")) {
    const checkedAt = data.checkedAt
      ? new Date(data.checkedAt)
      : new Date();

    $("last-checked").textContent =
      checkedAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
  }

  // Hardware unavailable
  if (!isDemo && !hardwareConnected) {
    if (statusIcon) {
      statusIcon.textContent = "!";
      statusIcon.className = "status-icon unknown";
    }

    if (statusTitle) {
      statusTitle.textContent = "SENSOR UNAVAILABLE";
    }

    if (statusDescription) {
      statusDescription.textContent =
        "No recent ESP32 heartbeat detected. Check the hardware, Wi-Fi, and Blynk connection.";
    }

    setSensorLabels("Hardware offline");

    if ($("demo-panel")) {
      $("demo-panel").hidden = true;
    }

    return;
  }

  // OCCUPIED
  if (occupied) {
    if (statusIcon) {
      statusIcon.textContent = "●";
      statusIcon.className = "status-icon busy";
    }

    if (statusTitle) {
      statusTitle.textContent = "OCCUPIED";
    }

    if (statusDescription) {
      statusDescription.textContent = motion
        ? "Motion detected. COE 102 is currently marked occupied."
        : "No current movement. Waiting for the 15-second inactivity delay.";
    }
  }

  // UNOCCUPIED
  else {
    if (statusIcon) {
      statusIcon.textContent = "○";
      statusIcon.className = "status-icon free";
    }

    if (statusTitle) {
      statusTitle.textContent = "UNOCCUPIED";
    }

    if (statusDescription) {
      statusDescription.textContent =
        "No movement detected for 15 seconds. COE 102 is marked unoccupied.";
    }
  }

  setSensorLabels(
    motion ? "Motion detected" : "No current motion"
  );

  // Show demo controls only in demo mode
  if ($("demo-panel")) {
    $("demo-panel").hidden = !isDemo;
  }
}

// ==========================================
// GET LIVE SENSOR DATA
// ==========================================

async function pollStatus() {
  try {
    const response = await fetch("/api/status", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    updateStatus(data);

  } catch (error) {
    console.error("Unable to retrieve sensor status:", error);

    updateStatus({
      ok: false
    });
  }
}

// ==========================================
// DEMO CONTROLS
// ==========================================

async function setDemoMotion(motion) {
  try {
    const response = await fetch("/api/demo/motion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ motion })
    });

    if (!response.ok) {
      throw new Error("Demo control request failed.");
    }

    await pollStatus();

  } catch (error) {
    console.error("Demo control error:", error);

    alert("Unable to update demo motion. Check the server.");
  }
}

// ==========================================
// INITIALIZE DASHBOARD
// ==========================================

function initializeDashboard() {
  updateClock();
  renderSchedule();
  pollStatus();

  // Update sensor status every 3 seconds
  setInterval(pollStatus, 3000);

  // Update clock every second
  setInterval(updateClock, 1000);

  // Demo buttons
  if ($("demo-motion")) {
    $("demo-motion").addEventListener("click", () => {
      setDemoMotion(true);
    });
  }

  if ($("demo-clear")) {
    $("demo-clear").addEventListener("click", () => {
      setDemoMotion(false);
    });
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
