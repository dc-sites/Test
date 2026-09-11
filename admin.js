import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addClause } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace with your Firebase project config credentials
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let viewsChart = null;

// Handle Login State Check
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('adminLoginModal').style.display = 'none';
        initAdminDashboard();
    } else {
        document.getElementById('adminLoginModal').style.display = 'flex';
    }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;
    const errEl = document.getElementById('loginError');
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        errEl.style.display = 'block';
        errEl.innerText = error.message;
    }
});

window.switchTab = function(tabId, el) {
    document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    el.classList.add('active');
    
    const titles = { ads: 'Popup Ads Manager', analytics: 'Practical Views & PDF', feedbacks: 'Student Feedbacks', videos: 'YouTube Guides' };
    document.getElementById('pageHeaderTitle').innerText = titles[tabId];
    if(tabId === 'analytics') loadAnalyticsData();
    if(tabId === 'feedbacks') loadFeedbacksData();
};

function initAdminDashboard() {
    loadAdConfig();
}

// Save Popup Ad Config
document.getElementById('saveAdConfigBtn').addEventListener('click', async () => {
    const adData = {
        imageUrl: document.getElementById('adImageUrl').value,
        btnName: document.getElementById('adBtnName').value,
        btnUrl: document.getElementById('adBtnUrl').value,
        remindOption: document.getElementById('adRemindOption').value,
        footerText: "ADS BY Hexa solutions."
    };
    await setDoc(doc(db, "settings", "popupAd"), adData);
    alert('Popup ad settings published successfully!');
});

async function loadAdConfig() {
    const snap = await getDoc(doc(db, "settings", "popupAd"));
    if (snap.exists()) {
        const d = snap.data();
        document.getElementById('adImageUrl').value = d.imageUrl || '';
        document.getElementById('adBtnName').value = d.btnName || '';
        document.getElementById('adBtnUrl').value = d.btnUrl || '';
        document.getElementById('adRemindOption').value = d.remindOption || 'enabled';
    }
}

// Load Feedbacks from Firestore (populated by rate.html)
async function loadFeedbacksData() {
    const tbody = document.getElementById('feedbackTableBody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Loading feedbacks...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "feedbacks"));
        tbody.innerHTML = '';
        if(querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No feedbacks found yet.</td></tr>';
            return;
        }
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.date || 'N/A'}</td>
                <td><i class="fa-solid fa-star" style="color:var(--accent-yellow);"></i> ${data.rating} / 5</td>
                <td>${data.feedback || ''}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Failed to load feedbacks.</td></tr>';
    }
}

// Load Practical Views & Line Graph
async function loadAnalyticsData() {
    // Mock sample analytics dataset or fetch from Firestore collection 'practical_views'
    const practicalNames = ['Micrometer Gauge', 'Vernier Caliper', 'Travelling Microscope', 'Simple Pendulum', 'Helical Spring'];
    const viewCounts = [1420, 1150, 980, 1840, 1320]; // Replace with dynamic DB queries if available

    const ctx = document.getElementById('viewsLineGraph').getContext('2d');
    if(viewsChart) viewsChart.destroy();

    viewsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: practicalNames,
            datasets: [{
                label: 'Total Views',
                data: viewCounts,
                borderColor: '#177D81',
                backgroundColor: 'rgba(23, 125, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Export PDF Report handler
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF();
    
    docPdf.setFontSize(18);
    docPdf.setTextColor(23, 125, 129);
    docPdf.text("ScienceLab Practical Analytics Report", 14, 20);
    
    docPdf.setFontSize(10);
    docPdf.setTextColor(78, 108, 109);
    docPdf.text(`Generated Date: ${new Date().toLocaleDateString()} | ADS BY Hexa solutions.`, 14, 28);

    docPdf.autoTable({
        startY: 35,
        head: [['Practical Simulator', 'Total Views', 'Status']],
        body: [
            ['Micrometer Screw Gauge', '1,420', 'Active'],
            ['Vernier Caliper', '1,150', 'Active'],
            ['Travelling Microscope', '980', 'Active'],
            ['Simple Pendulum', '1,840', 'Active'],
            ['Helical Spring', '1,320', 'Active']
        ],
        theme: 'grid',
        headStyles: { fillColor: [23, 125, 129] }
    });

    docPdf.save("ScienceLab_Analytics_Report.pdf");
});

// Save YouTube Guide mapping
document.getElementById('saveVideoGuideBtn').addEventListener('click', async () => {
    const practical = document.getElementById('practicalSelect').value;
    const ytLink = document.getElementById('ytVideoLink').value;
    
    await setDoc(doc(db, "video_guides", practical), { link: ytLink, updatedAt: new Date().toISOString() });
    alert('YouTube video guide assigned successfully!');
});
