import { getData, saveData, deleteItem, filterData, exportToCSV } from './storage-utils.js';

// track farmer
let editingFarmerId = null; 
let lastFarmerId = 0;

function loadFarmersSection() {
    let farmers = getData('farmers') || [];

    
    if (farmers.length > 0) {
        lastFarmerId = Math.max(...farmers.map(farmer => farmer.id));
    }

    const farmersContainer = document.getElementById('farmers-container');

    farmersContainer.innerHTML = `
        <h3>Manage Farmers</h3>
        <form id="add-farmer-form">
            <label for="farmer-name">Name:</label>
            <input type="text" id="farmer-name" required>

            <label for="farmer-contact">Contact:</label>
            <input type="text" id="farmer-contact" required>

            <label for="farmer-location">Location:</label>
            <input type="text" id="farmer-location" required>

            <button type="submit" id="add-update-button">Add Farmer</button>
        </form>

        <div>
            <input type="text" id="search-name-query" placeholder="Search by name">
            <button id="search-name-button">Search by Name</button>
            <input type="text" id="search-location-query" placeholder="Search by location">
            <button id="search-location-button">Search by Location</button>
            <button id="export-button">Export to CSV</button>
        </div>

        <ul id="farmers-list"></ul>
    `;

    const addFarmerForm = document.getElementById('add-farmer-form');
    const addUpdateButton = document.getElementById('add-update-button');
    const farmersList = document.getElementById('farmers-list');

    addFarmerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('farmer-name').value;
        const contact = document.getElementById('farmer-contact').value;
        const location = document.getElementById('farmer-location').value;

        if (editingFarmerId) {
            // update farmer
            const farmer = farmers.find(farmer => farmer.id === editingFarmerId);
            if (farmer) {
                farmer.name = name;
                farmer.contact = contact;
                farmer.location = location;
                saveData('farmers', farmers);
                updateFarmersList(farmersList, farmers);
                addFarmerForm.reset();
                editingFarmerId = null;
                addUpdateButton.textContent = 'Add Farmer';
            }
        } else {
            // add new farmer
            lastFarmerId++; // increment before creating the farmer
            const newFarmer = { 
                id: lastFarmerId, 
                name, 
                contact, 
                location 
            };
            farmers.push(newFarmer);
            saveData('farmers', farmers);
            updateFarmersList(farmersList, farmers);
            addFarmerForm.reset();
        }
    });
    document.getElementById('search-name-button').addEventListener('click', () => {
        const query = document.getElementById('search-name-query').value.trim();
        let farmers = getData('farmers');
        
        if (!query) {
            updateFarmersList(farmersList, farmers);
            return;
        }
    
        const filteredFarmers = farmers.filter(farmer => farmer.name.toLowerCase().includes(query.toLowerCase()));
        updateFarmersList(farmersList, filteredFarmers);
    });
    document.getElementById('search-location-button').addEventListener('click', () => {
        const query = document.getElementById('search-location-query').value.trim();
        let farmers = getData('farmers');

        if (!query) {
            const farmers = getData('farmers');
            updateFarmersList(farmersList, farmers);
            return;
        }
    
        const filteredFarmers = farmers.filter(farmer => farmer.location.toLowerCase().includes(query.toLowerCase()));
        updateFarmersList(farmersList, filteredFarmers);
    });
    document.getElementById('export-button').addEventListener('click', () => {
        exportToCSV('farmers', 'farmers.csv');
    });

    updateFarmersList(farmersList, farmers);
}

function updateFarmersList(container, farmers) {
    container.innerHTML = ''; // clean the list

    if (!farmers || farmers.length === 0) {
        console.log('No farmers to display');
        container.innerHTML = '<li>No farmers found</li>';
        return;
    }

    farmers.forEach((farmer) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ID: ${farmer.id}, Name: ${farmer.name}, Contact: ${farmer.contact}, Location: ${farmer.location}
            <button class="edit-button" data-id="${farmer.id}">Edit</button>
            <button class="delete-button" data-id="${farmer.id}">Delete</button>
        `;
        container.appendChild(listItem);
    });

    // edit button for farmers
    container.querySelectorAll('.edit-button').forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            const farmer = farmers.find(farmer => farmer.id === id);
            if (farmer) {
                document.getElementById('farmer-name').value = farmer.name;
                document.getElementById('farmer-contact').value = farmer.contact;
                document.getElementById('farmer-location').value = farmer.location;

                editingFarmerId = farmer.id;
                document.getElementById('add-update-button').textContent = "Update Farmer";
            }
        });
    });

    // delete button for farmers
    container.querySelectorAll('.delete-button').forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            farmers = farmers.filter(farmer => farmer.id !== id); // find farmer
            saveData('farmers', farmers); // save data 
            updateFarmersList(container, farmers); // totally updated list
        });
    });
}


// load the farmers section 
document.addEventListener('DOMContentLoaded', loadFarmersSection);

export { loadFarmersSection };
