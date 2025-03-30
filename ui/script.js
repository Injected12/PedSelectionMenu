// Menu State
const state = {
    currentMenu: 'main-menu', // 'main-menu' or 'clothing-menu'
    peds: [],
    clothing: [],
    focusedItemIndex: 0,
    selectedPed: null,
    menuOpen: false
};

// Elements
const pedList = document.getElementById('ped-list');
const clothingList = document.getElementById('clothing-list');
const mainMenu = document.getElementById('main-menu');
const clothingMenu = document.getElementById('clothing-menu');
const selectedModelName = document.getElementById('selected-model-name');
const closeButton = document.getElementById('close-button');

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
        openMenu();
        
        // Populate peds - Only using ensured peds
        populatePedList(data.peds);
    }
});

// Open menu function
function openMenu() {
    document.body.classList.add('visible');
    state.menuOpen = true;
    state.currentMenu = 'main-menu';
    showMenu(state.currentMenu);
    state.focusedItemIndex = 0;
    updateFocus();
}

// Close menu function
function closeMenu() {
    // In FiveM environment - send close event:
    if (!document.body.classList.contains('preview-mode')) {
        fetch('https://elegant_pedmenu/close', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({})
        });
    }
    
    document.body.classList.remove('visible');
    state.menuOpen = false;
    console.log('Menu closed');
    
    // For preview purposes only - reopen after delay
    if (document.body.classList.contains('preview-mode')) {
        setTimeout(() => {
            openMenu();
        }, 2000);
    }
}

// Populate the ped list
function populatePedList(peds) {
    state.peds = peds || getSamplePeds(); // Use provided peds or samples for dev
    pedList.innerHTML = '';
    
    state.peds.forEach((ped, index) => {
        const item = document.createElement('div');
        item.classList.add('menu-item');
        item.dataset.index = index;
        item.dataset.hash = ped.hash;
        
        const icon = document.createElement('div');
        icon.classList.add('menu-item-icon');
        icon.innerHTML = '<i class="fas fa-user"></i>';
        
        const label = document.createElement('div');
        label.classList.add('menu-item-label');
        label.textContent = ped.label;
        
        item.appendChild(icon);
        item.appendChild(label);
        pedList.appendChild(item);
    });
    
    if (state.peds.length > 0) {
        updateFocus();
    }
}

// Populate clothing options
function populateClothingList(pedHash) {
    // In a real implementation, you would fetch the available clothing options
    // for the selected ped from FiveM
    state.clothing = getSampleClothing();
    clothingList.innerHTML = '';
    
    state.clothing.forEach((item, index) => {
        const element = document.createElement('div');
        element.classList.add('menu-item');
        element.dataset.index = index;
        element.dataset.type = item.type;
        
        const icon = document.createElement('div');
        icon.classList.add('menu-item-icon');
        icon.innerHTML = `<i class="${item.icon}"></i>`;
        
        const label = document.createElement('div');
        label.classList.add('menu-item-label');
        label.textContent = item.label;
        
        element.appendChild(icon);
        element.appendChild(label);
        clothingList.appendChild(element);
    });
    
    state.focusedItemIndex = 0;
    updateFocus();
}

// Show specified menu and hide others
function showMenu(menuId) {
    mainMenu.classList.remove('active');
    clothingMenu.classList.remove('active');
    
    document.getElementById(menuId).classList.add('active');
    state.currentMenu = menuId;
    
    // Reset focused item
    state.focusedItemIndex = 0;
    updateFocus();
}

// Update which item is focused based on current state
function updateFocus() {
    // Clear all previous focus
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('focused');
    });
    
    // Set focus on current item
    const currentMenuElement = document.getElementById(state.currentMenu);
    const items = currentMenuElement.querySelectorAll('.menu-item');
    
    if (items.length > 0) {
        // Make sure index is within bounds
        state.focusedItemIndex = Math.max(0, Math.min(state.focusedItemIndex, items.length - 1));
        items[state.focusedItemIndex].classList.add('focused');
        
        // Update preview info
        if (state.currentMenu === 'main-menu') {
            const ped = state.peds[state.focusedItemIndex];
            selectedModelName.textContent = ped ? ped.label : 'None';
            
            // Preview the ped in FiveM
            previewPed(ped.hash);
        }
    }
}

// Preview ped in FiveM
function previewPed(hash) {
    // In FiveM environment:
    if (!document.body.classList.contains('preview-mode')) {
        fetch('https://elegant_pedmenu/preview', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                model: hash
            })
        });
    }
    
    console.log(`Preview requested for model: ${hash}`);
}

// Select the currently focused item
function selectFocusedItem() {
    if (state.currentMenu === 'main-menu') {
        // Select ped
        const selectedPed = state.peds[state.focusedItemIndex];
        state.selectedPed = selectedPed;
        
        // In a full implementation, switch to clothing menu
        showMenu('clothing-menu');
        populateClothingList(selectedPed.hash);
    } else if (state.currentMenu === 'clothing-menu') {
        // Select clothing item
        const clothingItem = state.clothing[state.focusedItemIndex];
        
        // Apply clothing in FiveM
        if (!document.body.classList.contains('preview-mode')) {
            fetch('https://elegant_pedmenu/select', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    model: state.selectedPed.hash,
                    clothing: clothingItem.type
                })
            });
        }
        
        console.log(`Selected model: ${state.selectedPed.hash} with clothing: ${clothingItem.type}`);
        closeMenu();
    }
}

// Handle keyboard navigation
document.addEventListener('keydown', function(event) {
    if (!state.menuOpen) return;
    
    switch (event.key) {
        case 'ArrowUp':
            state.focusedItemIndex = Math.max(0, state.focusedItemIndex - 1);
            updateFocus();
            break;
            
        case 'ArrowDown':
            const items = document.getElementById(state.currentMenu).querySelectorAll('.menu-item');
            state.focusedItemIndex = Math.min(items.length - 1, state.focusedItemIndex + 1);
            updateFocus();
            break;
            
        case 'ArrowLeft':
            if (state.currentMenu === 'clothing-menu') {
                showMenu('main-menu');
            }
            break;
            
        case 'ArrowRight':
            if (state.currentMenu === 'main-menu' && state.selectedPed) {
                showMenu('clothing-menu');
            }
            break;
            
        case 'Enter':
            selectFocusedItem();
            break;
            
        case 'Escape':
            if (state.currentMenu === 'clothing-menu') {
                showMenu('main-menu');
            } else {
                closeMenu();
            }
            break;
    }
});

// Close button event
closeButton.addEventListener('click', function() {
    closeMenu();
});

// For development/preview only - This data will come from the FiveM server
function getSamplePeds() {
    return [
        { label: "Default Ped", hash: "mp_m_freemode_01" },
        { label: "Michael", hash: "player_zero" },
        { label: "Franklin", hash: "player_one" },
        { label: "Trevor", hash: "player_two" },
        { label: "Beach Male", hash: "a_m_m_beach_01" },
        { label: "Business Man", hash: "a_m_m_business_01" },
        { label: "Downtown Male", hash: "a_m_m_downtown_01" },
        { label: "Farmer", hash: "a_m_m_farmer_01" },
        { label: "Jogger", hash: "a_m_y_jogger_01" },
        { label: "Skater", hash: "a_m_y_skater_01" },
        { label: "Business Female", hash: "a_f_m_business_02" },
        { label: "Tourist", hash: "a_f_y_tourist_01" }
    ];
}

// Sample clothing options
function getSampleClothing() {
    return [
        { label: "Casual Outfit", type: "casual", icon: "fas fa-tshirt" },
        { label: "Formal Outfit", type: "formal", icon: "fas fa-user-tie" },
        { label: "Beach Outfit", type: "beach", icon: "fas fa-umbrella-beach" },
        { label: "Sports Outfit", type: "sports", icon: "fas fa-running" },
        { label: "Biker Outfit", type: "biker", icon: "fas fa-motorcycle" },
        { label: "Police Outfit", type: "police", icon: "fas fa-shield-alt" },
        { label: "Military Outfit", type: "military", icon: "fas fa-fighter-jet" },
        { label: "Hiking Outfit", type: "hiking", icon: "fas fa-hiking" }
    ];
}

// For development/preview mode
document.addEventListener('DOMContentLoaded', function() {
    // Set CSS color variables with the black and grey theme
    document.documentElement.style.setProperty('--primary-color', '#000000');     // Black
    document.documentElement.style.setProperty('--secondary-color', '#333333');   // Dark Grey
    document.documentElement.style.setProperty('--tertiary-color', '#666666');    // Light Grey
    document.documentElement.style.setProperty('--text-color', '#FFFFFF');        // White
    document.documentElement.style.setProperty('--highlight-color', '#888888');   // Highlight Grey
    
    // Add preview mode marker
    document.body.classList.add('preview-mode');
    
    // Add a message indicating preview mode
    const previewMessage = document.createElement('div');
    previewMessage.style.position = 'fixed';
    previewMessage.style.bottom = '10px';
    previewMessage.style.left = '10px';
    previewMessage.style.color = 'white';
    previewMessage.style.background = 'rgba(0,0,0,0.7)';
    previewMessage.style.padding = '5px 10px';
    previewMessage.style.borderRadius = '5px';
    previewMessage.style.fontSize = '12px';
    previewMessage.textContent = 'PREVIEW MODE - Use arrow keys to navigate';
    document.body.appendChild(previewMessage);
    
    // Initialize menu with sample data
    openMenu();
    populatePedList();
});
