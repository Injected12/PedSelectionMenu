// NUI Event listener for messages from the client script
window.addEventListener('message', function(event) {
    const data = event.data;
    
    if (data.type === 'open') {
        // Set custom colors from config
        if (data.colors) {
            document.documentElement.style.setProperty('--primary-color', data.colors.primary);
            document.documentElement.style.setProperty('--secondary-color', data.colors.secondary);
            document.documentElement.style.setProperty('--tertiary-color', data.colors.tertiary);
            document.documentElement.style.setProperty('--text-color', data.colors.text);
            document.documentElement.style.setProperty('--highlight-color', data.colors.highlight);
        }
        
        // Show the menu
        document.body.classList.add('visible');
        
        // Populate categories
        populateCategories(data.categories);
    }
});

// For development/preview only - This will be removed in production
document.addEventListener('DOMContentLoaded', function() {
    // Set CSS color variables with the black and grey theme
    document.documentElement.style.setProperty('--primary-color', '#000000');     // Black
    document.documentElement.style.setProperty('--secondary-color', '#333333');   // Dark Grey
    document.documentElement.style.setProperty('--tertiary-color', '#666666');    // Light Grey
    document.documentElement.style.setProperty('--text-color', '#FFFFFF');        // White
    document.documentElement.style.setProperty('--highlight-color', '#888888');   // Highlight Grey
    
    // Sample data for development preview
    const sampleCategories = [
        {
            name: "Male",
            models: [
                { label: "Beach Male", hash: "a_m_m_beach_01" },
                { label: "Business Man", hash: "a_m_m_business_01" },
                { label: "Downtown Male", hash: "a_m_m_downtown_01" },
                { label: "Farmer Male", hash: "a_m_m_farmer_01" },
                { label: "FatLatin Male", hash: "a_m_m_fatlatin_01" },
                { label: "GenStreet Male", hash: "a_m_m_genstreet_01" },
                { label: "Golfer Male", hash: "a_m_m_golfer_01" },
                { label: "HasJew Male", hash: "a_m_m_hasjew_01" },
                { label: "Hillbilly Male", hash: "a_m_m_hillbilly_01" }
            ]
        },
        {
            name: "Female",
            models: [
                { label: "Beach Female", hash: "a_f_m_beach_01" },
                { label: "Business Female", hash: "a_f_m_business_02" },
                { label: "Downtown Female", hash: "a_f_m_downtown_01" },
                { label: "East SA Female", hash: "a_f_m_eastsa_01" },
                { label: "Tourist Female", hash: "a_f_m_tourist_01" },
                { label: "GenStreet Female", hash: "a_f_m_genstreet_01" },
                { label: "Jogger Female", hash: "a_f_y_jogger_01" },
                { label: "Skater Female", hash: "a_f_y_skater_01" },
                { label: "SouCent Female", hash: "a_f_y_soucent_01" }
            ]
        },
        {
            name: "Story Characters",
            models: [
                { label: "Michael", hash: "player_zero" },
                { label: "Franklin", hash: "player_one" },
                { label: "Trevor", hash: "player_two" },
                { label: "Amanda", hash: "ig_amandatownley" },
                { label: "Jimmy", hash: "ig_jimmyboston" },
                { label: "Tracy", hash: "ig_tracydisanto" },
                { label: "Lamar", hash: "ig_lamardavis" },
                { label: "Lester", hash: "ig_lestercrest" },
                { label: "Ron", hash: "ig_nervousron" }
            ]
        },
        {
            name: "Animals",
            models: [
                { label: "Boar", hash: "a_c_boar" },
                { label: "Cat", hash: "a_c_cat_01" },
                { label: "Chimp", hash: "a_c_chimp" },
                { label: "Cow", hash: "a_c_cow" },
                { label: "Coyote", hash: "a_c_coyote" },
                { label: "Deer", hash: "a_c_deer" },
                { label: "Husky", hash: "a_c_husky" },
                { label: "Pig", hash: "a_c_pig" },
                { label: "Rat", hash: "a_c_rat" }
            ]
        }
    ];
    
    // Show the menu for development purposes
    document.body.classList.add('visible');
    document.body.classList.add('preview-mode');
    
    // Add a message to the document body indicating preview mode
    const previewMessage = document.createElement('div');
    previewMessage.style.position = 'fixed';
    previewMessage.style.bottom = '10px';
    previewMessage.style.left = '10px';
    previewMessage.style.color = 'white';
    previewMessage.style.background = 'rgba(0,0,0,0.7)';
    previewMessage.style.padding = '5px 10px';
    previewMessage.style.borderRadius = '5px';
    previewMessage.style.fontSize = '12px';
    previewMessage.textContent = 'PREVIEW MODE - This is a simulation of how the menu would appear in FiveM';
    document.body.appendChild(previewMessage);
    
    // Populate with sample data
    populateCategories(sampleCategories);
});

// Global variables
let categories = [];
let currentCategory = null;
let currentModel = null;

// Elements
const categoryList = document.getElementById('category-list');
const modelList = document.getElementById('model-list');
const currentCategoryTitle = document.getElementById('current-category');
const previewInfo = document.getElementById('preview-info');
const selectButton = document.getElementById('select-button');
const searchInput = document.getElementById('search-input');
const closeButton = document.getElementById('close-button');

// Populate categories
function populateCategories(categoriesData) {
    categories = categoriesData;
    categoryList.innerHTML = '';
    
    categories.forEach((category, index) => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category-item');
        categoryElement.textContent = category.name;
        categoryElement.dataset.index = index;
        
        categoryElement.addEventListener('click', function() {
            selectCategory(parseInt(this.dataset.index));
        });
        
        categoryList.appendChild(categoryElement);
    });
    
    // Select first category by default
    if (categories.length > 0) {
        selectCategory(0);
    }
}

// Select category
function selectCategory(index) {
    // Remove active class from all categories
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected category
    document.querySelector(`.category-item[data-index="${index}"]`).classList.add('active');
    
    currentCategory = categories[index];
    currentCategoryTitle.textContent = currentCategory.name;
    
    // Populate models for this category
    populateModels(currentCategory.models);
}

// Populate models
function populateModels(models) {
    modelList.innerHTML = '';
    
    models.forEach(model => {
        const modelElement = document.createElement('div');
        modelElement.classList.add('model-item');
        modelElement.dataset.hash = model.hash;
        
        // Create icon element
        const iconElement = document.createElement('div');
        iconElement.classList.add('model-icon');
        
        // Choose icon based on category
        let iconClass = 'fas fa-user';
        if (currentCategory.name === 'Animals') {
            iconClass = 'fas fa-paw';
        } else if (currentCategory.name === 'Story Characters') {
            iconClass = 'fas fa-star';
        } else if (currentCategory.name === 'Male') {
            iconClass = 'fas fa-male';
        } else if (currentCategory.name === 'Female') {
            iconClass = 'fas fa-female';
        }
        
        iconElement.innerHTML = `<i class="${iconClass}"></i>`;
        
        // Create name element
        const nameElement = document.createElement('div');
        nameElement.classList.add('model-name');
        nameElement.textContent = model.label;
        
        modelElement.appendChild(iconElement);
        modelElement.appendChild(nameElement);
        
        modelElement.addEventListener('click', function() {
            selectModel(model);
            
            // Remove active class from all models
            document.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to this model
            this.classList.add('active');
        });
        
        modelList.appendChild(modelElement);
    });
}

// Select model
function selectModel(model) {
    currentModel = model;
    
    // Update preview info
    previewInfo.innerHTML = `
        <h3>${model.label}</h3>
        <p>Model Hash: ${model.hash}</p>
    `;
    
    // Enable select button
    selectButton.disabled = false;
    
    // In preview mode, we don't make actual API calls to FiveM
    // The following code would be used in the actual FiveM environment:
    /*
    fetch('https://elegant_pedmenu/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            model: model.hash
        })
    }).then(response => response.json())
      .then(data => {
          if (!data.success) {
              previewInfo.innerHTML += `<p class="error">Error: ${data.error}</p>`;
          }
      });
    */
    
    // For preview purposes, we'll just show a message
    console.log(`Preview requested for model: ${model.hash}`);
}

// Search functionality
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    if (!currentCategory) return;
    
    if (searchTerm === '') {
        // If search is empty, show all models
        populateModels(currentCategory.models);
    } else {
        // Filter models based on search term
        const filteredModels = currentCategory.models.filter(model => 
            model.label.toLowerCase().includes(searchTerm) || 
            model.hash.toLowerCase().includes(searchTerm)
        );
        
        populateModels(filteredModels);
    }
});

// Select button event
selectButton.addEventListener('click', function() {
    if (!currentModel) return;
    
    // In preview mode, we don't make actual API calls to FiveM
    // The following code would be used in the actual FiveM environment:
    /*
    fetch('https://elegant_pedmenu/select', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            model: currentModel.hash
        })
    });
    */
    
    // For preview purposes, we'll just show a message
    console.log(`Selected model: ${currentModel.hash}`);
    
    // Close the menu
    closeMenu();
});

// Close button event
closeButton.addEventListener('click', function() {
    closeMenu();
});

// Close menu function
function closeMenu() {
    // In preview mode, we don't make actual API calls to FiveM
    // The following code would be used in the actual FiveM environment:
    /*
    fetch('https://elegant_pedmenu/close', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({})
    });
    */
    
    // For preview purposes, we'll just show a message
    console.log('Menu closed');
    
    // For preview environment, we'll just show it again after a short delay
    // In the actual FiveM environment, this would hide the menu completely
    document.body.classList.remove('visible');
    
    // Show the menu again after 2 seconds (only for preview)
    setTimeout(() => {
        document.body.classList.add('visible');
    }, 2000);
    
    // Reset states
    currentModel = null;
}

// Handle escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && document.body.classList.contains('visible')) {
        closeMenu();
    }
});

// CSS variables are now set in the DOMContentLoaded event for the preview
