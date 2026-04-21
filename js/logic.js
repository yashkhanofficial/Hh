// Data Management & Calculation Logic

function updateStats() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const batches = JSON.parse(localStorage.getItem('batches') || '[]');
    const totalStock = batches.reduce((sum, b) => sum + b.quantity, 0);

    if(document.getElementById('total-p')) document.getElementById('total-p').innerText = products.length;
    if(document.getElementById('total-s')) document.getElementById('total-s').innerText = totalStock;
}

function processFIFOSale(productId) {
    let batches = JSON.parse(localStorage.getItem('batches') || '[]');
    // Sort by expiry: Earliest First
    const productBatches = batches
        .filter(b => b.productId == productId && b.quantity > 0)
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

    if(productBatches.length === 0) {
        alert("OUT OF STOCK!");
        return false;
    }

    const targetBatchId = productBatches[0].id;
    const batchIndex = batches.findIndex(b => b.id === targetBatchId);
    
    batches[batchIndex].quantity -= 1;
    localStorage.setItem('batches', JSON.stringify(batches));

    // Record Sale History
    const sales = JSON.parse(localStorage.getItem('sales') || '[]');
    sales.push({ id: Date.now(), productId, date: new Date().toISOString() });
    localStorage.setItem('sales', JSON.stringify(sales));
    
    return true;
}

function renderDashboardAlerts() {
    const batches = JSON.parse(localStorage.getItem('batches') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const now = new Date();

    batches.forEach(b => {
        const prod = products.find(p => p.id == b.productId);
        const exp = new Date(b.expiryDate);
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

        if(b.quantity > 0 && diff <= 30) {
            let containerId = "list-30";
            if(diff <= 3) containerId = "list-3";
            else if(diff <= 7) containerId = "list-7";

            const el = document.createElement('div');
            el.className = `alert-item border-${containerId.split('-')[1]}`;
            el.innerHTML = `<div><b>${prod ? prod.name : 'Unknown'}</b><br><small>Qty: ${b.quantity}</small></div><div>${diff} days</div>`;
            document.getElementById(containerId).appendChild(el);
        }
    });
}

function renderProductList() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const container = document.getElementById('p-list-container');
    container.innerHTML = products.map(p => `<div class="card"><b>${p.name}</b><br><small>Barcode: ${p.barcode}</small></div>`).join('');
}


// Local Database Helper
function getDB() {
    const raw = localStorage.getItem('he_pro_data');
    return raw ? JSON.parse(raw) : { products: [], stocks: [] };
}

function saveDB(db) {
    localStorage.setItem('he_pro_data', JSON.stringify(db));
}

function updateStats() {
    const db = getDB();
    document.getElementById('total-p').innerText = db.products.length;
    document.getElementById('total-s').innerText = db.stocks.length;
}

function renderDashboardAlerts() {
    const db = getDB();
    const container = document.getElementById('alert-container');
    const now = new Date();
    
    db.stocks.sort((a,b) => new Date(a.expiry) - new Date(b.expiry));

    db.stocks.forEach(s => {
        const exp = new Date(s.expiry);
        const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if(diff <= 30) {
            container.innerHTML += `
                <div class="alert-item ${diff <= 7 ? 'border-3' : 'border-30'}">
                    <div><b>${s.pName}</b><br><small>Code: ${s.code}</small></div>
                    <div class="text-critical">${diff} Days</div>
                </div>`;
        }
    });
}
