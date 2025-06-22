/**
 * Main application logic for Happy Paws Pet Shop
 * DOM manipulation, event handlers, and UI updates
 */

// Global variables
let activityLog = [];
let db; // Database instance will be initialized from database.js

/**
 * Initialize the application
 */
function initializeApp() {
    // Database should be initialized in database.js
    if (typeof PetShopDB === 'undefined') {
        console.error('Database class not found. Make sure database.js is loaded first.');
        return;
    }
    
    db = new PetShopDB();
    
    // Load sample data if database is empty
    if (db.getAllPets().length === 0) {
        loadSampleData();
    }
    
    // Initialize activity log
    logActivity("🐾 Pet Shop Database System initialized!");
    
    // Initial display update
    updateDisplay();
    
    // Set up periodic updates for pet well-being
    setInterval(simulateTimePassage, 60000); // Every minute
    
    // Set up form validation
    setupFormValidation();
}

/**
 * Load sample pets into the database
 */
function loadSampleData() {
    const samplePets = [
        { name: "Buddy", type: "Dog", age: 2, price: 250 },
        { name: "Whiskers", type: "Cat", age: 1, price: 150 },
        { name: "Fluffy", type: "Rabbit", age: 1, price: 80 },
        { name: "Max", type: "Dog", age: 3, price: 300 },
        { name: "Tweety", type: "Bird", age: 1, price: 45 }
    ];

    samplePets.forEach(petData => {
        db.createPet(petData);
    });
    
    logActivity("🐾 Sample pets loaded into database!");
}

/**
 * Set up form validation and input handlers
 */
function setupFormValidation() {
    const form = document.querySelector('.add-pet-form');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });
}

/**
 * Validate the add pet form
 */
function validateForm() {
    const name = document.getElementById('pet-name').value.trim();
    const type = document.getElementById('pet-type').value;
    const age = parseInt(document.getElementById('pet-age').value);
    const price = parseFloat(document.getElementById('pet-price').value);
    
    const addButton = document.querySelector('.add-pet-form .db-btn');
    const validation = PetUtils.validatePetData({ name, type, age, price });
    
    if (validation.isValid) {
        addButton.disabled = false;
        addButton.style.opacity = '1';
    } else {
        addButton.disabled = true;
        addButton.style.opacity = '0.6';
    }
}

/**
 * Log activity to the activity log
 * @param {string} message - Activity message to log
 */
function logActivity(message) {
    const timestamp = new Date().toLocaleTimeString();
    activityLog.unshift({ message, timestamp });
    if (activityLog.length > 15) activityLog.pop();
    updateActivityLog();
}

/**
 * Update the activity log display
 */
function updateActivityLog() {
    const logContainer = document.getElementById('activity-log');
    if (!logContainer) return;
    
    logContainer.innerHTML = activityLog.map(entry => 
        `<div class="log-entry">
            <span class="timestamp">[${entry.timestamp}]</span> ${entry.message}
        </div>`
    ).join('');
}

/**
 * Create HTML for a pet card
 * @param {object} pet - Pet data object
 * @returns {string} HTML string for pet card
 */
function createPetCard(pet) {
    const statusClass = pet.isSold ? 'status-sold' : 'status-available';
    const statusText = pet.isSold ? 'SOLD' : 'Available';
    const petEmoji = PetUtils.getTypeEmoji(pet.type);
    const wellBeingScore = new Pet(pet).getWellBeingScore();
    const needsAttention = pet.hunger > 80 || pet.happiness < 30;
    
    return `
        <div class="pet-card ${needsAttention ? 'needs-attention' : ''}">
            <div class="pet-header">
                <div>
                    <div class="pet-name">${petEmoji} ${pet.name}</div>
                    <div class="pet-id">ID: ${pet.id}</div>
                </div>
                <div class="pet-type">${pet.type}</div>
                <div class="${statusClass}">${statusText}</div>
            </div>
            <div class="pet-details">
                <div class="detail-item">
                    <span class="detail-label">Age:</span>
                    <span class="detail-value">${pet.age} years</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Price:</span>
                    <span class="detail-value">$${pet.price}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Happiness:</span>
                    <span class="detail-value">${pet.happiness}/100</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Hunger:</span>
                    <span class="detail-value">${pet.hunger}/100</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Well-being:</span>
                    <span class="detail-value">${wellBeingScore}/100</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Days in shop:</span>
                    <span class="detail-value">${new Pet(pet).getDaysInShop()}</span>
                </div>
            </div>
            <div>
                <div style="margin-bottom: 10px;">
                    <small style="color: #666;">Happiness - ${new Pet(pet).getMood()}</small>
                    <div class="progress-bar">
                        <div class="progress-fill happiness-bar" style="width: ${pet.happiness}%"></div>
                    </div>
                </div>
                <div>
                    <small style="color: #666;">Hunger - ${new Pet(pet).getHungerStatus()}</small>
                    <div class="progress-bar">
                        <div class="progress-fill hunger-bar" style="width: ${pet.hunger}%"></div>
                    </div>
                </div>
            </div>
            <div class="pet-actions">
                <button class="btn btn-feed" onclick="feedPet(${pet.id})" ${pet.isSold ? 'disabled' : ''}>
                    🍖 Feed
                </button>
                <button class="btn btn-play" onclick="playWithPet(${pet.id})" ${pet.isSold ? 'disabled' : ''}>
                    🎾 Play
                </button>
                <button class="btn btn-sell" onclick="sellPet(${pet.id})" ${pet.isSold ? 'disabled' : ''}>
                    💰 Sell
                </button>
                <button class="btn btn-delete" onclick="deletePet(${pet.id})">
                    🗑️ Delete
                </button>
            </div>
            ${needsAttention && !pet.isSold ? '<div class="attention-alert">⚠️ Needs Attention!</div>' : ''}
        </div>
    `;
}

/**
 * Update the main display with current pet data
 */
function updateDisplay() {
    if (!db) return;
    
    const availablePets = db.getAvailablePets();
    const soldPets = db.getSoldPets();
    
    // Update available pets
    const availablePetsContainer = document.getElementById('available-pets');
    if (availablePetsContainer) {
        if (availablePets.length === 0) {
            availablePetsContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pets available</p>';
        } else {
            availablePetsContainer.innerHTML = availablePets.map(pet => createPetCard(pet)).join('');
        }
    }

    // Update sold pets
    const soldPetsContainer = document.getElementById('sold-pets');
    if (soldPetsContainer) {
        if (soldPets.length === 0) {
            soldPetsContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No pets sold yet</p>';
        } else {
            soldPetsContainer.innerHTML = soldPets.map(pet => createPetCard(pet)).join('');
        }
    }

    // Update statistics
    updateStatistics();
    
    // Update database status
    updateDatabaseStatus();
}

/**
 * Update statistics display
 */
function updateStatistics() {
    if (!db) return;
    
    const availablePets = db.getAvailablePets();
    const soldPets = db.getSoldPets();
    const totalSales = db.getTotalSales();
    const totalRecords = db.getAllPets().length;
    
    // Update stat displays
    const availableCountEl = document.getElementById('available-count');
    const soldCountEl = document.getElementById('sold-count');
    const totalSalesEl = document.getElementById('total-sales');
    const dbRecordsEl = document.getElementById('db-records');
    
    if (availableCountEl) availableCountEl.textContent = availablePets.length;
    if (soldCountEl) soldCountEl.textContent = soldPets.length;
    if (totalSalesEl) totalSalesEl.textContent = `$${totalSales}`;
    if (dbRecordsEl) dbRecordsEl.textContent = totalRecords;
}

/**
 * Update database status indicator
 */
function updateDatabaseStatus() {
    const statusEl = document.getElementById('db-status');
    if (statusEl) {
        const recordCount = db ? db.getAllPets().length : 0;
        statusEl.innerHTML = `🟢 Database Connected (${recordCount} records)`;
    }
}

/**
 * Pet interaction functions
 */
function feedPet(id) {
    const petData = db.readPet(id);
    if (petData) {
        const pet = new Pet(petData);
        pet.feed();
    }
}

function playWithPet(id) {
    const petData = db.readPet(id);
    if (petData) {
        const pet = new Pet(petData);
        pet.play();
    }
}

function sellPet(id) {
    const petData = db.readPet(id);
    if (petData) {
        const pet = new Pet(petData);
        if (pet.sell()) {
            // Show success animation or notification
            showNotification(`${pet.name} sold for $${pet.price}!`, 'success');
        }
    }
}

function deletePet(id) {
    if (confirm('Are you sure you want to delete this pet from the database?')) {
        const petData = db.readPet(id);
        if (petData) {
            const pet = new Pet(petData);
            if (pet.delete()) {
                showNotification(`${petData.name} has been removed`, 'info');
            }
        }
    }
}

/**
 * Add a new pet to the database
 */
function addNewPet() {
    const name = document.getElementById('pet-name').value.trim();
    const type = document.getElementById('pet-type').value;
    const age = parseInt(document.getElementById('pet-age').value);
    const price = parseFloat(document.getElementById('pet-price').value);

    // Validate input
    const validation = PetUtils.validatePetData({ name, type, age, price });
    if (!validation.isValid) {
        alert('Please fix the following errors:\\n' + validation.errors.join('\\n'));
        return;
    }

    const petData = { name, type, age, price };
    const newPet = db.createPet(petData);
    
    logActivity(`➕ Added new pet: ${newPet.name} (${newPet.type}) - ID: ${newPet.id}`);
    
    // Clear form
    clearAddPetForm();
    
    // Show success message
    showNotification(`${newPet.name} has been added to the shop!`, 'success');
    
    updateDisplay();
}

/**
 * Clear the add pet form
 */
function clearAddPetForm() {
    document.getElementById('pet-name').value = '';
    document.getElementById('pet-age').value = '';
    document.getElementById('pet-price').value = '';
    document.getElementById('pet-type').selectedIndex = 0;
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        backgroundColor: type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3',
        color: 'white',
        borderRadius: '8px',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Database management functions
 */
function saveToDatabase() {
    if (db) {
        db.saveToStorage();
        logActivity('💾 Manual save completed');
        showNotification('Data saved successfully!', 'success');
    }
}

function loadFromDatabase() {
    if (db) {
        db.loadFromStorage();
        updateDisplay();
        logActivity('📥 Data reloaded from storage');
        showNotification('Data loaded from storage', 'info');
    }
}

function exportData() {
    if (!db) return;
    
    const data = db.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `petshop_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('📤 Data exported successfully');
    showNotification('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                if (db.importData(e.target.result)) {
                    updateDisplay();
                    showNotification('Data imported successfully!', 'success');
                } else {
                    showNotification('Failed to import data. Please check the file format.', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function clearDatabase() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
        if (db) {
            db.clearAll();
            updateDisplay();
            showNotification('Database cleared', 'info');
        }
    }
}

/**
 * Simulate time passage for all pets
 */
function simulateTimePassage() {
    if (!db) return;
    
    const availablePets = db.getAvailablePets();
    let petsNeedingAttention = 0;
    
    availablePets.forEach(petData => {
        const pet = new Pet(petData);
        pet.simulateTimePassage();
        
        if (pet.needsAttention()) {
            petsNeedingAttention++;
        }
    });
    
    if (petsNeedingAttention > 0) {
        logActivity(`⚠️ ${petsNeedingAttention} pet(s) need attention!`);
    }
    
    // Update display every 5 minutes or if pets need attention
    if (petsNeedingAttention > 0 || Date.now() % 300000 < 60000) {
        updateDisplay();
    }
}

/**
 * Search and filter functions
 */
function searchPets(query) {
    if (!db || !query) {
        updateDisplay();
        return;
    }
    
    const allPets = db.getAllPets();
    const filteredPets = allPets.filter(pet => 
        pet.name.toLowerCase().includes(query.toLowerCase()) ||
        pet.type.toLowerCase().includes(query.toLowerCase())
    );
    
    // Update display with filtered results
    displayFilteredPets(filteredPets);
}

function filterPetsByType(type) {
    if (!db) return;
    
    const allPets = db.getAllPets();
    const filteredPets = type === 'all' 
        ? allPets 
        : allPets.filter(pet => pet.type === type);
    
    displayFilteredPets(filteredPets);
}

function displayFilteredPets(pets) {
    const availablePets = pets.filter(pet => !pet.isSold);
    const soldPets = pets.filter(pet => pet.isSold);
    
    const availablePetsContainer = document.getElementById('available-pets');
    const soldPetsContainer = document.getElementById('sold-pets');
    
    if (availablePetsContainer) {
        availablePetsContainer.innerHTML = availablePets.length === 0 
            ? '<p style="color: #666; text-align: center; padding: 20px;">No matching pets found</p>'
            : availablePets.map(pet => createPetCard(pet)).join('');
    }
    
    if (soldPetsContainer) {
        soldPetsContainer.innerHTML = soldPets.length === 0 
            ? '<p style="color: #666; text-align: center; padding: 20px;">No matching sold pets found</p>'
            : soldPets.map(pet => createPetCard(pet)).join('');
    }
}

/**
 * Initialize app when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions globally available for HTML onclick handlers
window.feedPet = feedPet;
window.playWithPet = playWithPet;
window.sellPet = sellPet;
window.deletePet = deletePet;
window.addNewPet = addNewPet;
window.saveToDatabase = saveToDatabase;
window.loadFromDatabase = loadFromDatabase;
window.exportData = exportData;
window.importData = importData;
window.clearDatabase = clearDatabase;