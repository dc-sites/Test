import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDAmDO7bqtDKaE7ALi8HwqLU-ibIkpir4A",
    authDomain: "sciencelab-9f2b7.firebaseapp.com",
    projectId: "sciencelab-9f2b7",
    storageBucket: "sciencelab-9f2b7.firebasestorage.app",
    messagingSenderId: "838123936919",
    appId: "1:838123936919:web:b32270c89a9127c4739dd2",
    measurementId: "G-PBE0VLK57X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Popup Ad Handler
document.getElementById('adForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageUrl = document.getElementById('adImageUrl').value;
    const buttonName = document.getElementById('adButtonName').value;
    const buttonUrl = document.getElementById('adButtonUrl').value;
    const remindLater = document.getElementById('adRemindLater').checked;

    try {
        await setDoc(doc(db, "settings", "popupAd"), {
            imageUrl,
            buttonName,
            buttonUrl,
            remindLater,
            footerText: "ADS BY Hexa solutions.",
            updatedAt: Timestamp.now()
        });
        alert('Popup ad successfully saved to Firebase!');
    } catch (err) {
        console.error("Error saving ad: ", err);
        alert('Failed to save ad.');
    }
});

// 2. Video Guide Handler
document.getElementById('videoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const practicalId = document.getElementById('practicalSelect').value;
    const youtubeUrl = document.getElementById('youtubeUrl').value;

    try {
        await setDoc(doc(db, "practicalVideos", practicalId), {
            practicalId,
            youtubeUrl,
            updatedAt: Timestamp.now()
        });
        alert('YouTube video guide assigned successfully!');
    } catch (err) {
        console.error("Error saving video: ", err);
        alert('Failed to save video guide.');
    }
});

// 3. Load Feedbacks from rate.html
async function loadFeedbacks() {
    const tbody = document.querySelector('#feedbackTable tbody');
    try {
        const q = query(collection(db, "feedbacks"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        tbody.innerHTML = '';
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No feedback recorded yet.</td></tr>';
            return;
        }
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const dateStr = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td><span class="value-tag">⭐ ${data.rating} / 5</span></td>
                <td>${data.feedback || 'No comment'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error loading feedbacks:", err);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Failed to load feedbacks.</td></tr>';
    }
}

// 4. Analytics & Chart.js Line Graph
let viewsChart = null;

async function loadAnalytics() {
    try {
        const querySnapshot = await getDocs(collection(db, "practicalViews"));
        const labels = [];
        const dataCounts = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            labels.push(data.practicalName || docSnap.id);
            dataCounts.push(data.views || 0);
        });

        const ctx = document.getElementById('viewsChart').getContext('2d');
        if (viewsChart) viewsChart.destroy();

        viewsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['Micrometer Gauge', 'Vernier Caliper', 'Simple Pendulum', 'Helical Spring'],
                datasets: [{
                    label: 'Practical Views Count',
                    data: dataCounts.length ? dataCounts : [145, 110, 215, 88],
                    borderColor: '#177D81',
                    backgroundColor: 'rgba(23, 125, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } }
            }
        });
    } catch (err) {
        console.error("Error loading analytics:", err);
    }
}

// PDF Export Handler
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF();
    
    docPdf.setFontSize(18);
    docPdf.setTextColor(23, 125, 129);
    docPdf.text("ScienceLab - Analytics & Views Report", 14, 20);
    
    docPdf.setFontSize(11);
    docPdf.setTextColor(78, 108, 109);
    docPdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    
    const canvasElement = document.getElementById('viewsChart');
    const canvasImage = canvasElement.toDataURL('image/png', 1.0);
    docPdf.addImage(canvasImage, 'PNG', 14, 35, 180, 90);
    
    docPdf.text("ADS BY Hexa solutions.", 14, 135);
    docPdf.save("ScienceLab_Analytics_Report.pdf");
});

window.addEventListener('DOMContentLoaded', () => {
    loadFeedbacks();
    loadAnalytics();
});
