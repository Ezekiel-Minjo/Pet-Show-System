// Pet Constructor Function
function Pet(name, type, age, price) {
    this.name = name;
    this.type = type;
    this.age = age;
    this.price = price;
    this.happiness = 50; // Starting happiness level (0-100)
    this.hunger = 30; // Starting hunger level (0-100, higher = more hungry)
    this.isSold = false // Track if pet is sold


    // Method to feed the pet
    this.feed = function() {
        if (this.isSold) {
        console.log(`${ this.name } has been sold and is no longer in the shop.`);
        return;
        }

    this.hunger = Math.max(0, this.hunger-20); // Reduces hunger
    this.happiness = Math.min(100, this.happiness + 10); // Increase happiness
    console.log(`${ this.name } has been fed! Hunger: ${ this.hunger}, Happiness: ${ this.happiness }`);
    };

    // Method to play with the pet
    this.play = function() {
        if (this.isSold) {
        console.log(`${this.name} has been sold and is no longer in the shop.`);
        return;
        }   

    this.happiness = Math.min(100, this.happiness + 50); // Increase happiness
    this.hunger = Math.min(100, this.hunger + 5); // playing makes them a bit hungry
    console.log(`You played with ${this.name}! Happiness: ${this.happiness}, Hunger: ${this.hunger}`);
    };

    // Method to sell the pet
    this.sell = function() {
        if (this.isSold) {
            console.log(`${this.name} has already been sold!`);
            return false;
        }

        this.isSold = true;
        console.log(`${this.name} the ${this.type} has been sold for $${this.price}!`);
        return true;
    };

    // Method to display pet information
    this.displayInfo = function() {
        const status = this.isSold ? "SOLD" : "Available";
        console.log(`
            Pet: ${this.name}
            Type: ${this.type}
            Age: ${this.age} years old
            Price: ${this.price}
            Happiness: ${this.happiness}/100
            Hunger: ${this.hunger}/100
            Status: ${status}
        `);
    };
}

// Pet Shop Constructor to manage inventory
function PetShop(shopName) {
    this.shopName = shopName;
    this.pets =[];
    this.totalSales = 0;
    this.soldPets = [];
    // Add a pet to the shop
    this.addPet = function(pet) {
        this.pets.push(pet);
        console.log(`${pet.name} the ${pet.type} has been added to ${this.shopName}!`);
    };

    // Remove sold pets from available inventory
    this.updateInventory = function() {
        for (let i = this.pets.length -1; i >= 0; i--) {
            if (this.pets[i].isSold) {
                this.soldPets.push(this.pets[i]);
                this.totalSales += this.pets[i].price;
                this.pets.splice(i, 1);
            }
        }
    };

    // Display all available pets
    this.showAvailablePets = function() {
        console.log(`\n=== ${this.shopName} - Availabe Pets ===`);
        if (this.pets.length === 0) {
            console.log("No pets available");
            return;
        }

        this.pets.forEach((pets, index) => {
            console.log(`${index + 1}. ${pets.name} (${pets.type}) - $${pets.price}`);
        });
    };

    // Show shop statistics
    this.showStats = function() {
        console.log(`\n=== ${this.shopName} Statistics===`);
        console.log(`Available pets: ${this.pets.length}`);
        console.log(`Pets sold:${this.soldPets.length}`);
        console.log(`Total sales: $${this.totalSales}`);

        if (this.soldPets.length > 0) {
            console.log("\nSold pets:");
            this.soldPets.forEach(pet => {
                console.log(`- ${pet.name} (${pet.type}) - $${pet.price}`);
            });
        }
    };
    // Find pets by type
    this.findPetsByType = function(type) {
        const foundPets = this.pets.filter(pet =>
            pet.type.toLowerCase() === type.toLowerCase()
        );

        if (foundPets.length === 0) {
            console.log(`No ${type}s available.`);
            return;
        }

        console.log(`\n${type}s available:`);
        foundPets.forEach(pet => {
            console.log(`- ${pet.name} (${pet.age} years old) - $${pet.price}`);
        });
    };
}

console.log("🐾 Welcome to the Pet Shop System Demo! 🐾\n");

// Create a pet shop
const happyPaws = new PetShop("Happy Paws Pet Shop");

// Create some pets
const dog1 = new Pet("Buddy", "Dog", 2, 250);
const cat1 = new Pet("Whiskers", "Cat", 1, 150);
const rabbit1 = new Pet("Fluffy", "Rabbit", 1, 80);
const dog2 = new Pet("Max", "Dog", 3, 300);
const bird1 = new Pet("Tweety", "Bird", 1, 45);

// Add pets to the shop
happyPaws.addPet(dog1);
happyPaws.addPet(cat1);
happyPaws.addPet(rabbit1);
happyPaws.addPet(dog2);
happyPaws.addPet(bird1);

console.log("\n" + "=".repeat(50));

// Show available pets
happyPaws.showAvailablePets();

console.log("\n" + "=".repeat(50));

// Interact with pets
console.log("\n🎮 Let's interact with some pets!");
dog1.displayInfo();
dog1.feed();
dog1.play();
dog1.feed();

console.log("\n" + "-".repeat(30));

cat1.displayInfo();
cat1.play();
cat1.play();

console.log("\n" + "=".repeat(50));

// Sell some pets
console.log("\n💰 Time to make some sales!");
dog1.sell();
cat1.sell();
rabbit1.sell();

// Update inventory after sales
happyPaws.updateInventory();

console.log("\n" + "=".repeat(50));

// Show updated inventory and stats
happyPaws.showAvailablePets();
happyPaws.showStats();

console.log("\n" + "=".repeat(50));

// Try to interact with sold pets
console.log("\n❌ Trying to interact with sold pets:");
dog1.feed(); // Should show error message
cat1.play(); // Should show error message

console.log("\n" + "=".repeat(50));

// Search for specific pet types
console.log("\n🔍 Searching for specific pets:");
happyPaws.findPetsByType("Dog");
happyPaws.findPetsByType("Cat");