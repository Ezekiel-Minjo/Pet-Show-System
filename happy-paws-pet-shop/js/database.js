// Database simulation using IndexedDB-like structure in memory
class PetShopDB {
    constructor() {
        this.pets = new Map();
        this.transactions = [];
        this.nextId = 1;
        this.loadFromStorage();
    }

    // Create a new pet record
    createPet(petData) {
        const id = this.nextId++;
        const pet = {
            id: id,
            name: petData.name,
            type: petData.type,
            age: petData.age,
            price: petData.price,
            happiness: 50,
            hunger: 30,
            isSold: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.pets.set(id, pet);
        this.saveToStorage();
        return pet;
    }

    // Read pet by ID
    readPet(id) {
        return this.pets.get(id);
    }

    // Update pet data
    updatePet(id, updates) {
        const pet = this.pets.get(id);
        if (pet) {
            Object.assign(pet, updates, { updatedAt: new Date().toISOString() });
            this.pets.set(id, pet);
            this.saveToStorage();
            return pet;
        }
        return null;
    }

    // Delete pet
    deletePet(id) {
        const deleted = this.pets.delete(id);
        if (deleted) {
            this.saveToStorage();
        }
        return deleted;
    }

    // Get all pets
    getAllPets() {
        return Array.from(this.pets.values());
    }

    // Get available pets
    getAvailablePets() {
        return this.getAllPets().filter(pet => !pet.isSold);
    }

    // Get sold pets
    getSoldPets() {
        return this.getAllPets().filter(pet => pet.isSold);
    }

    // Record transaction
    recordTransaction(petId, type, amount) {
        const transaction = {
            id: Date.now(),
            petId: petId,
            type: type, // 'sale', 'feed', 'play'
            amount: amount || 0,
            timestamp: new Date().toISOString()
        };
        this.transactions.push(transaction);
        this.saveToStorage();
        return transaction;
    }

    // Get total sales
    getTotalSales() {
        return this.transactions
            .filter(t => t.type === 'sale')
            .reduce((total, t) => total + t.amount, 0);
    }

    // Save to browser storage (using window object instead of localStorage)
    saveToStorage() {
        try {
            const data = {
                pets: Array.from(this.pets.entries()),
                transactions: this.transactions,
                nextId: this.nextId
            };
            window.petShopData = data;
            if (typeof logActivity === 'function') {
                logActivity(`💾 Data saved to storage (${this.pets.size} pets)`);
            }
        } catch (error) {
            if (typeof logActivity === 'function') {
                logActivity(`❌ Error saving to storage: ${error.message}`);
            }
        }
    }

    // Load from browser storage
    loadFromStorage() {
        try {
            const data = window.petShopData;
            if (data) {
                this.pets = new Map(data.pets);
                this.transactions = data.transactions || [];
                this.nextId = data.nextId || 1;
                if (typeof logActivity === 'function') {
                    logActivity(`📥 Data loaded from storage (${this.pets.size} pets)`);
                }
            }
        } catch (error) {
            if (typeof logActivity === 'function') {
                logActivity(`❌ Error loading from storage: ${error.message}`);
            }
        }
    }

    // Export data as JSON
    exportData() {
        const data = {
            pets: Array.from(this.pets.entries()),
            transactions: this.transactions,
            nextId: this.nextId,
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    // Import data from JSON
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.pets = new Map(data.pets);
            this.transactions = data.transactions || [];
            this.nextId = data.nextId || 1;
            this.saveToStorage();
            if (typeof logActivity === 'function') {
                logActivity(`📥 Data imported successfully (${this.pets.size} pets)`);
            }
            return true;
        } catch (error) {
            if (typeof logActivity === 'function') {
                logActivity(`❌ Error importing data: ${error.message}`);
            }
            return false;
        }
    }

    // Clear all data
    clearAll() {
        this.pets.clear();
        this.transactions = [];
        this.nextId = 1;
        window.petShopData = null;
        if (typeof logActivity === 'function') {
            logActivity(`🗑️ Database cleared`);
        }
    }

    // Initialize with sample data
    initializeSampleData() {
        if (this.getAllPets().length === 0) {
            const samplePets = [
                { name: "Buddy", type: "Dog", age: 2, price: 250 },
                { name: "Whiskers", type: "Cat", age: 1, price: 150 },
                { name: "Fluffy", type: "Rabbit", age: 1, price: 80 },
                { name: "Max", type: "Dog", age: 3, price: 300 },
                { name: "Tweety", type: "Bird", age: 1, price: 45 }
            ];

            samplePets.forEach(petData => {
                this.createPet(petData);
            });
            
            if (typeof logActivity === 'function') {
                logActivity("🐾 Sample pets loaded into database!");
            }
        }
    }
}