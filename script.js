// Price and cash-in-drawer variables (using let for testing flexibility)
let price = 19.5;
let cid = [
  ["PENNY", 1.01],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100]
];

// Currency unit values in cents to avoid floating point issues
const currencyValues = {
  "PENNY": 1,
  "NICKEL": 5,
  "DIME": 10,
  "QUARTER": 25,
  "ONE": 100,
  "FIVE": 500,
  "TEN": 1000,
  "TWENTY": 2000,
  "ONE HUNDRED": 10000
};

// Currency display names
const currencyNames = {
  "PENNY": "Pennies",
  "NICKEL": "Nickels", 
  "DIME": "Dimes",
  "QUARTER": "Quarters",
  "ONE": "Ones",
  "FIVE": "Fives",
  "TEN": "Tens",
  "TWENTY": "Twenties",
  "ONE HUNDRED": "Hundreds"
};

// DOM elements
const cashInput = document.getElementById('cash');
const purchaseBtn = document.getElementById('purchase-btn');
const changeDueElement = document.getElementById('change-due');
const priceDisplay = document.getElementById('price-display');
const drawerDisplay = document.getElementById('drawer-display');

// Initialize the display
function init() {
  updatePriceDisplay();
  updateDrawerDisplay();
  
  // Add event listeners
  purchaseBtn.addEventListener('click', handlePurchase);
  cashInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handlePurchase();
    }
  });
}

// Update price display
function updatePriceDisplay() {
  priceDisplay.textContent = `$${price.toFixed(2)}`;
}

// Update cash drawer display
function updateDrawerDisplay() {
  drawerDisplay.innerHTML = '';
  
  // Display in reverse order (highest to lowest)
  const reversedCid = [...cid].reverse();
  
  reversedCid.forEach(([currency, amount]) => {
    const currencyItem = document.createElement('div');
    currencyItem.className = 'currency-item';
    
    currencyItem.innerHTML = `
      <div class="currency-name">${currencyNames[currency]}</div>
      <div class="currency-amount">$${amount.toFixed(2)}</div>
    `;
    
    drawerDisplay.appendChild(currencyItem);
  });
}

// Handle purchase button click
function handlePurchase() {
  const cash = parseFloat(cashInput.value);
  
  // Validate cash input
  if (isNaN(cash) || cash < 0) {
    alert('Please enter a valid cash amount');
    return;
  }
  
  // Check if customer has enough money
  if (cash < price) {
    alert('Customer does not have enough money to purchase the item');
    return;
  }
  
  // Check if exact change
  if (cash === price) {
    updateChangeDisplay('No change due - customer paid with exact cash', 'success');
    return;
  }
  
  // Calculate change
  const changeDue = cash - price;
  const result = calculateChange(changeDue);
  
  if (result.status === 'INSUFFICIENT_FUNDS') {
    updateChangeDisplay('Status: INSUFFICIENT_FUNDS', 'error');
  } else if (result.status === 'CLOSED') {
    updateChangeDisplay(`Status: CLOSED ${formatChange(result.change)}`, 'success');
  } else if (result.status === 'OPEN') {
    updateChangeDisplay(`Status: OPEN ${formatChange(result.change)}`, 'success');
  }
}

// Calculate change due
function calculateChange(changeDue) {
  // Convert to cents to avoid floating point issues
  let changeDueCents = Math.round(changeDue * 100);
  
  // Calculate total cash in drawer
  let totalCidCents = 0;
  cid.forEach(([currency, amount]) => {
    totalCidCents += Math.round(amount * 100);
  });
  
  // If cash in drawer is less than change due
  if (totalCidCents < changeDueCents) {
    return { status: 'INSUFFICIENT_FUNDS' };
  }
  
  // If cash in drawer equals change due
  if (totalCidCents === changeDueCents) {
    return { 
      status: 'CLOSED', 
      change: cid.filter(([currency, amount]) => amount > 0)
    };
  }
  
  // Calculate change breakdown
  const change = [];
  const cidCopy = [...cid].reverse(); // Work from highest to lowest denomination
  
  for (let [currency, available] of cidCopy) {
    const currencyValueCents = currencyValues[currency];
    const availableCents = Math.round(available * 100);
    
    if (changeDueCents >= currencyValueCents && availableCents > 0) {
      const maxUnits = Math.floor(availableCents / currencyValueCents);
      const neededUnits = Math.floor(changeDueCents / currencyValueCents);
      const unitsToGive = Math.min(maxUnits, neededUnits);
      
      if (unitsToGive > 0) {
        const amountToGive = unitsToGive * currencyValueCents;
        change.push([currency, amountToGive / 100]);
        changeDueCents -= amountToGive;
      }
    }
  }
  
  // If we couldn't make exact change
  if (changeDueCents > 0) {
    return { status: 'INSUFFICIENT_FUNDS' };
  }
  
  return { status: 'OPEN', change: change };
}

// Format change for display
function formatChange(change) {
  return change
    .map(([currency, amount]) => `${currency}: $${amount.toFixed(2)}`)
    .join(' ');
}

// Update change display with styling
function updateChangeDisplay(message, type = '') {
  changeDueElement.textContent = message;
  changeDueElement.className = `change-display ${type}`;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);