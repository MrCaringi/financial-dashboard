// Tab Switcher Logic
function switchTab(event, tabId) {
  // Hide all panes
  const panes = document.querySelectorAll('.demo-pane');
  panes.forEach(pane => pane.classList.remove('active'));

  // Deactivate all tab buttons
  const buttons = document.querySelectorAll('.demo-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Show active pane and button
  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// Terminal Tab Switcher
function switchTerminal(event, tabId) {
  const panes = document.querySelectorAll('.terminal-pane');
  panes.forEach(pane => pane.classList.remove('active'));

  const buttons = document.querySelectorAll('.terminal-tab');
  buttons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');
  event.currentTarget.classList.add('active');
}

// Safe-To-Spend Interactive Simulator
function updateSpendCalculation() {
  const bankBal = parseFloat(document.getElementById('slider-bank-bal').value);
  const bills = parseFloat(document.getElementById('slider-bills').value);
  const cc = parseFloat(document.getElementById('slider-cc').value);

  // Safe to Spend = Bank Balance - Bills - Credit Card Balance
  const safeToSpend = Math.max(0, bankBal - bills - cc);

  // Update visual text elements
  document.getElementById('spend-total-val').textContent = safeToSpend.toFixed(2);
  document.getElementById('label-bank-bal').textContent = '£' + bankBal.toLocaleString();
  document.getElementById('label-bills').textContent = '£' + bills.toLocaleString();
  document.getElementById('label-cc').textContent = '£' + cc.toFixed(2);
}

// Uncategorized Queue Interactive Demo
let queueItemsCount = 3;

function categorizeItem(itemId, category) {
  const item = document.getElementById(itemId);
  if (!item) return;

  // Add slide out animation class
  item.classList.add('sliding-out');

  // After animation transition, remove from DOM and decrease count
  setTimeout(() => {
    item.remove();
    queueItemsCount--;

    // Update queue badge count
    const badge = document.getElementById('inbox-badge-count');
    if (queueItemsCount > 0) {
      badge.textContent = `${queueItemsCount} item${queueItemsCount > 1 ? 's' : ''}`;
    } else {
      badge.textContent = '0 items';
      badge.style.color = 'var(--primary)';
      
      // Show finished success screen
      document.getElementById('empty-queue-msg').style.display = 'block';
      document.getElementById('demo-queue').style.display = 'none';
    }
  }, 500);
}

function resetDemoQueue() {
  const queueHtml = `
    <div class="queue-item" id="item-1">
      <div class="item-info">
        <h4>Sainsburys Supermarket</h4>
        <p>Yesterday • -£32.40</p>
      </div>
      <div class="tag-container">
        <button class="tag-btn" onclick="categorizeItem('item-1', 'Groceries')">Groceries</button>
        <button class="tag-btn" onclick="categorizeItem('item-1', 'Home')">Home</button>
      </div>
    </div>
    
    <div class="queue-item" id="item-2">
      <div class="item-info">
        <h4>Uber Eats Delivery</h4>
        <p>Today • -£18.50</p>
      </div>
      <div class="tag-container">
        <button class="tag-btn" onclick="categorizeItem('item-2', 'Dining Out')">Dining</button>
        <button class="tag-btn" onclick="categorizeItem('item-2', 'Leisure')">Leisure</button>
      </div>
    </div>

    <div class="queue-item" id="item-3">
      <div class="item-info">
        <h4>Shell Petrol Station</h4>
        <p>3 days ago • -£45.00</p>
      </div>
      <div class="tag-container">
        <button class="tag-btn" onclick="categorizeItem('item-3', 'Transport')">Transport</button>
        <button class="tag-btn" onclick="categorizeItem('item-3', 'Holiday')">Holiday</button>
      </div>
    </div>
  `;

  document.getElementById('demo-queue').innerHTML = queueHtml;
  document.getElementById('demo-queue').style.display = 'flex';
  document.getElementById('empty-queue-msg').style.display = 'none';
  
  const badge = document.getElementById('inbox-badge-count');
  badge.textContent = '3 items';
  badge.style.color = 'oklch(0.7 0.18 40)';
  queueItemsCount = 3;
}

// CC JSON Generator Preview
function updateJsonPreview() {
  const strategy = document.getElementById('mock-cc-strategy').value;
  const statementDay = parseInt(document.getElementById('mock-cc-statement-day').value) || 15;
  const dueDay = parseInt(document.getElementById('mock-cc-due-day').value) || 28;

  const jsonConfig = {
    statement_day: statementDay,
    payment_due_day: dueDay,
    strategy: strategy
  };

  document.getElementById('json-preview').textContent = JSON.stringify(jsonConfig, null, 2);
}

// Copy Code Clipboard Utility
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Optional copy feedback (alert or visual trigger)
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'var(--primary)';
    toast.style.color = 'oklch(0.05 0.01 250)';
    toast.style.padding = '0.5rem 1.5rem';
    toast.style.borderRadius = '9999px';
    toast.style.fontSize = '0.8rem';
    toast.style.fontFamily = 'var(--font-display)';
    toast.style.fontWeight = '700';
    toast.style.boxShadow = '0 10px 20px var(--primary-glow)';
    toast.style.zIndex = '9999';
    toast.textContent = 'Command copied!';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => toast.remove(), 500);
    }, 2000);
  });
}
