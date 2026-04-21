import { db } from './firebase.js';
import { collection, getDocs, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadAlerts() {
    const now = new Date();
    const snap = await getDocs(query(collection(db, "batches"), where("quantity", ">", 0)));
    
    let red = 0, yellow = 0;

    snap.forEach(doc => {
        const data = doc.data();
        const exp = data.expiryDate.toDate();
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        
        let listId = "";
        if (diff <= 3) { listId = "list-3-days"; red++; }
        else if (diff <= 7) { listId = "list-7-days"; yellow++; }
        else if (diff <= 30) { listId = "list-30-days"; }

        if (listId) {
            const item = document.createElement('div');
            item.className = `alert-item border-${listId.split('-')[1]}`;
            item.innerHTML = `<div><b>${data.productName}</b><br><small>${data.quantity} units</small></div><div class="text-critical">${diff} days left</div>`;
            document.getElementById(listId).appendChild(item);
        }
    });
    document.getElementById('count-red').innerText = red;
    document.getElementById('count-yellow').innerText = yellow;
}
loadAlerts();
