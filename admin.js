import { db } from "./firebase-config.js";
import { collection, doc, setDoc, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. Save Popup Ad
document.getElementById('saveAdBtn').addEventListener('click', async () => {
    const imageUrl = document.getElementById('adImageUrl').value;
    const buttonName = document.getElementById('adButtonName').value;
    const buttonUrl = document.getElementById('adButtonUrl').value;

    try {
        await setDoc(doc(db, "settings", "popupAd"), {
            imageUrl,
            buttonName,
            buttonUrl,
            footerText: "ADS BY Hexa Solutions",
            updatedAt: new Date()
        });
        alert('Popup Ad updated successfully!');
    } catch (error) {
        console.error("Error saving ad: ", error);
        alert('Failed to save ad.');
    }
});

// 2. Save YouTube Video Guide
document.getElementById('saveYtBtn').addEventListener('click', async () => {
    const practical = document.getElementById('practicalSelect').value;
    const ytUrl = document.getElementById('ytVideoUrl').value;

    try {
        await setDoc(doc(db, "videoGuides", practical), {
            url: ytUrl,
            updatedAt: new Date()
        });
        alert('YouTube guide attached successfully!');
    } catch (error) {
        console.error("Error saving video guide: ", error);
        alert('Failed to attach video guide.');
    }
});

// 3. Load Feedbacks
async function loadFeedbacks() {
    const tbody = document.getElementById('feedbackTableBody');
    tbody.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, "feedbacks"));
        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No feedback found.</td></tr>`;
            return;
        }
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>⭐ ${data.rating} / 5</td>
                <td>${data.feedback || 'No comment'}</td>
                <td>${data.date ? new Date(data.date.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading feedbacks:", error);
    }
}

// 4. Analytics Chart & Export
let viewsChart;
async function initAnalytics() {
    const ctx = document.getElementById('viewsChart').getContext('2d');
    
    // Sample data structure or fetch real counts from Firestore
    const labels = ["Micrometer Gauge", "Vernier Caliper", "Simple Pendulum", "Forces Simulator", "Spherometer Lab"];
    const dataCounts = [120, 95, 150, 80, 60];

    viewsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Practical Views Count',
                data: dataCounts,
                borderColor: '#177D81',
                backgroundColor: 'rgba(23, 125, 129, 0.1)',
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

// PDF Export Handler
document.getElementById('exportPdfBtn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const docPdf = new jsPDF();
    
    docPdf.setFontSize(18);
    docPdf.text("ScienceLab - Practical Views Analytics Report", 14, 20);
    docPdf.setFontSize(11);
    docPdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const canvasElement = document.getElementById('viewsChart');
    const canvasImage = canvasElement.toDataURL('image/png', 1.0);
    
    docPdf.addImage(canvasImage, 'PNG', 15, 40, 180, 90);
    docPdf.save("analytics-report.pdf");
});

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadFeedbacks();
    initAnalytics();
});
