/**
 * Pet class definition and pet-specific methods
 * Happy Paws Pet Shop - Database Edition
 */

class Pet {
    constructor(data) {
        Object.assign(this, data);
    }

    /**
     * Feed the pet - decreases hunger and increases happiness
     */
    feed() {
        if (this.isSold) {
            logActivity(`${this.name} has been sold and is no longer in the shop.`);
            return;
        }
        
        const oldHunger = this.hunger;
        const oldHappiness = this.happiness;
        
        this.hunger = Math.max(0, this.hunger - 20);
        this.happiness = Math.min(100, this.happiness + 10);
        
        // Update in database
        db.updatePet(this.id, { 
            hunger: this.hunger, 
            happiness: this.happiness 
        });
        db.recordTransaction(this.id, 'feed', 0);
        
        logActivity(`${this.name} has been fed! Hunger: ${oldHunger}→${this.hunger}, Happiness: ${oldHappiness}→${this.happiness}`);
        updateDisplay();
    }

    /**
     * Play with the pet - increases happiness and slightly increases hunger
     */
    play() {
        if (this.isSold) {
            logActivity(`${this.name} has been sold and is no longer in the shop.`);
            return;
        }
        
        const oldHunger = this.hunger;
        const oldHappiness = this.happiness;
        
        this.happiness = Math.min(100, this.happiness + 50);
        this.hunger = Math.min(100, this.hunger + 5);
        
        // Update in database
        db.updatePet(this.id, { 
            hunger: this.hunger, 
            happiness: this.happiness 
        });
        db.recordTransaction(this.id, 'play', 0);
        
        logActivity(`You played with ${this.name}! Happiness: ${oldHappiness}→${this.happiness}, Hunger: ${oldHunger}→${this.hunger}`);
        updateDisplay();
    }

    /**
     * Sell the pet - marks as sold and records transaction
     * @returns {boolean} True if successfully sold, false if already sold
     */
    sell() {
        if (this.isSold) {
            logActivity(`${this.name} has already been sold!`);
            return false;
        }

        this.isSold = true;
        
        // Update in database
        db.updatePet(this.id, { isSold: true });
        db.recordTransaction(this.id, 'sale', this.price);
        
        logActivity(`${this.name} the ${this.type} has been sold for $${this.price}!`);
        updateDisplay();
        return true;
    }

    /**
     * Delete the pet from the database
     * @returns {boolean} True if successfully deleted, false otherwise
     */
    delete() {
        if (db.deletePet(this.id)) {
            logActivity(`${this.name} has been removed from the database.`);
            updateDisplay();
            return true;
        }
        return false;
    }

    /**
     * Get pet's current status summary
     * @returns {object} Object containing pet status information
     */
    getStatus() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            age: this.age,
            price: this.price,
            happiness: this.happiness,
            hunger: this.hunger,
            isSold: this.isSold,
            needsAttention: this.hunger > 80 || this.happiness < 30
        };
    }

    /**
     * Check if pet needs immediate attention
     * @returns {boolean} True if pet needs attention (very hungry or unhappy)
     */
    needsAttention() {
        return this.hunger > 80 || this.happiness < 30;
    }

    /**
     * Get pet's mood based on happiness level
     * @returns {string} Mood description
     */
    getMood() {
        if (this.happiness >= 80) return 'Very Happy';
        if (this.happiness >= 60) return 'Happy';
        if (this.happiness >= 40) return 'Content';
        if (this.happiness >= 20) return 'Sad';
        return 'Very Sad';
    }

    /**
     * Get pet's hunger status
     * @returns {string} Hunger status description
     */
    getHungerStatus() {
        if (this.hunger <= 20) return 'Well Fed';
        if (this.hunger <= 40) return 'Satisfied';
        if (this.hunger <= 60) return 'Peckish';
        if (this.hunger <= 80) return 'Hungry';
        return 'Starving';
    }

    /**
     * Calculate pet's overall well-being score
     * @returns {number} Score from 0-100
     */
    getWellBeingScore() {
        const happinessWeight = 0.6;
        const hungerWeight = 0.4;
        const hungerScore = Math.max(0, 100 - this.hunger);
        
        return Math.round(
            (this.happiness * happinessWeight) + 
            (hungerScore * hungerWeight)
        );
    }

    /**
     * Auto-decay happiness and increase hunger over time
     * This could be called periodically to simulate natural pet needs
     */
    simulateTimePassage() {
        if (this.isSold) return;

        const happinessDecay = Math.random() * 5; // 0-5 points
        const hungerIncrease = Math.random() * 3; // 0-3 points

        this.happiness = Math.max(0, this.happiness - happinessDecay);
        this.hunger = Math.min(100, this.hunger + hungerIncrease);

        // Update in database
        db.updatePet(this.id, { 
            hunger: this.hunger, 
            happiness: this.happiness 
        });
    }

    /**
     * Get formatted creation date
     * @returns {string} Formatted date string
     */
    getFormattedCreatedDate() {
        return new Date(this.createdAt).toLocaleDateString();
    }

    /**
     * Get formatted last updated date
     * @returns {string} Formatted date string
     */
    getFormattedUpdatedDate() {
        return new Date(this.updatedAt).toLocaleDateString();
    }

    /**
     * Get days since creation
     * @returns {number} Number of days since pet was added
     */
    getDaysInShop() {
        const now = new Date();
        const created = new Date(this.createdAt);
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Pet utility functions
const PetUtils = {
    /**
     * Get emoji for pet type
     * @param {string} type - Pet type
     * @returns {string} Emoji representation
     */
    getTypeEmoji(type) {
        const emojis = {
            'Dog': '🐕',
            'Cat': '🐱',
            'Rabbit': '🐰',
            'Bird': '🐦',
            'Fish': '🐠',
            'Hamster': '🐹'
        };
        return emojis[type] || '🐾';
    },

    /**
     * Get color for pet type
     * @param {string} type - Pet type
     * @returns {string} CSS color value
     */
    getTypeColor(type) {
        const colors = {
            'Dog': '#8B4513',
            'Cat': '#FF6347',
            'Rabbit': '#DDA0DD',
            'Bird': '#87CEEB',
            'Fish': '#00CED1',
            'Hamster': '#F4A460'
        };
        return colors[type] || '#667eea';
    },

    /**
     * Generate random pet name based on type
     * @param {string} type - Pet type
     * @returns {string} Random name
     */
    generateRandomName(type) {
        const names = {
            'Dog': ['Buddy', 'Max', 'Charlie', 'Cooper', 'Rocky', 'Bear', 'Duke', 'Zeus'],
            'Cat': ['Whiskers', 'Shadow', 'Luna', 'Mittens', 'Tiger', 'Smokey', 'Oliver', 'Milo'],
            'Rabbit': ['Fluffy', 'Snowball', 'Cocoa', 'Pepper', 'Cotton', 'Nibbles', 'Bunny', 'Hop'],
            'Bird': ['Tweety', 'Sunny', 'Sky', 'Robin', 'Blue', 'Chirpy', 'Feather', 'Wing'],
            'Fish': ['Nemo', 'Bubbles', 'Splash', 'Finn', 'Aqua', 'Coral', 'Wave', 'Pearl'],
            'Hamster': ['Peanut', 'Chip', 'Squeaky', 'Tiny', 'Fuzzy', 'Marble', 'Cheese', 'Pip']
        };
        
        const typeNames = names[type] || ['Pet'];
        return typeNames[Math.floor(Math.random() * typeNames.length)];
    },

    /**
     * Validate pet data before creation
     * @param {object} petData - Pet data to validate
     * @returns {object} Validation result with isValid and errors
     */
    validatePetData(petData) {
        const errors = [];
        
        if (!petData.name || petData.name.trim().length === 0) {
            errors.push('Pet name is required');
        }
        
        if (!petData.type) {
            errors.push('Pet type is required');
        }
        
        if (!petData.age || petData.age < 0 || petData.age > 20) {
            errors.push('Pet age must be between 0 and 20 years');
        }
        
        if (!petData.price || petData.price < 0) {
            errors.push('Pet price must be a positive number');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};