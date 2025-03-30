// Menu State
const state = {
    currentMenu: 'main-menu', // 'main-menu', 'component-menu' or 'variation-menu'
    peds: [],
    components: [],
    variations: [],
    focusedItemIndex: 0,
    selectedPed: null,
    selectedComponent: null,
    currentClothingDrawable: 0,
    currentClothingTexture: 0,
    menuOpen: false,
    subMenuLevel: 0 // 0 = main, 1 = components, 2 = variations
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
            document.documentElement.style.setProperty('--accent-color', data.colors.accent);
        }
        
        // Show the menu
        openMenu();
        
        // Populate peds and components
        populatePedList(data.peds);
        state.components = data.components || [];
    }
});

// Open menu function
function openMenu() {
    document.body.classList.add('visible');
    state.menuOpen = true;
    state.currentMenu = 'main-menu';
    state.subMenuLevel = 0;
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

// Populate clothing component options
function populateComponentList() {
    // Use the components from state (set when menu was opened)
    clothingList.innerHTML = '';
    
    state.components.forEach((component, index) => {
        const element = document.createElement('div');
        element.classList.add('menu-item');
        element.dataset.index = index;
        element.dataset.id = component.id;
        element.dataset.name = component.name;
        
        const icon = document.createElement('div');
        icon.classList.add('menu-item-icon');
        icon.innerHTML = `<i class="${component.icon}"></i>`;
        
        const label = document.createElement('div');
        label.classList.add('menu-item-label');
        label.textContent = component.label;
        
        element.appendChild(icon);
        element.appendChild(label);
        clothingList.appendChild(element);
    });
    
    state.focusedItemIndex = 0;
    updateFocus();
}

// Populate clothing variations for a specific component
function populateVariationList(componentId) {
    // Fetch variations from FiveM
    if (!document.body.classList.contains('preview-mode')) {
        fetch('https://elegant_pedmenu/getVariations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                componentId: componentId
            })
        })
        .then(resp => resp.json())
        .then(data => {
            createVariationElements(data.variations, data.currentDrawable, data.currentTexture);
        });
    } else {
        // For preview mode, use sample data
        const sampleVariations = [];
        for (let i = 0; i < 15; i++) {
            sampleVariations.push({
                drawable: i,
                textures: [0, 1, 2, 3]
            });
        }
        createVariationElements(sampleVariations, 0, 0);
    }
}

// Create variation elements in the UI
function createVariationElements(variations, currentDrawable, currentTexture) {
    state.variations = variations;
    state.currentClothingDrawable = currentDrawable;
    state.currentClothingTexture = currentTexture;
    
    clothingList.innerHTML = '';
    
    // Add a back button as the first item
    const backItem = document.createElement('div');
    backItem.classList.add('menu-item');
    backItem.dataset.index = "back";
    
    const backIcon = document.createElement('div');
    backIcon.classList.add('menu-item-icon');
    backIcon.innerHTML = '<i class="fas fa-arrow-left"></i>';
    
    const backLabel = document.createElement('div');
    backLabel.classList.add('menu-item-label');
    backLabel.textContent = "Back to Components";
    
    backItem.appendChild(backIcon);
    backItem.appendChild(backLabel);
    clothingList.appendChild(backItem);
    
    // Add each variation
    let count = 1; // Start at index 1 because 0 is the back button
    
    variations.forEach((variation, index) => {
        const element = document.createElement('div');
        element.classList.add('menu-item');
        element.dataset.index = count++;
        element.dataset.drawable = variation.drawable;
        
        // Mark current selection
        if (variation.drawable === currentDrawable) {
            element.classList.add('current-item');
        }
        
        const icon = document.createElement('div');
        icon.classList.add('menu-item-icon');
        icon.innerHTML = '<i class="fas fa-tshirt"></i>';
        
        const label = document.createElement('div');
        label.classList.add('menu-item-label');
        label.textContent = `Style ${variation.drawable}`;
        
        element.appendChild(icon);
        element.appendChild(label);
        clothingList.appendChild(element);
        
        // Add texture options for each drawable
        if (variation.textures && variation.textures.length > 0) {
            variation.textures.forEach((texture, tIndex) => {
                const textureElement = document.createElement('div');
                textureElement.classList.add('menu-item', 'texture-item');
                textureElement.dataset.index = count++;
                textureElement.dataset.drawable = variation.drawable;
                textureElement.dataset.texture = texture;
                
                // Mark current texture if this is the selected drawable
                if (variation.drawable === currentDrawable && texture === currentTexture) {
                    textureElement.classList.add('current-item');
                }
                
                const textureIcon = document.createElement('div');
                textureIcon.classList.add('menu-item-icon');
                textureIcon.innerHTML = '<i class="fas fa-palette"></i>';
                
                const textureLabel = document.createElement('div');
                textureLabel.classList.add('menu-item-label');
                textureLabel.textContent = `    Color ${texture}`;
                
                textureElement.appendChild(textureIcon);
                textureElement.appendChild(textureLabel);
                clothingList.appendChild(textureElement);
            });
        }
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
        
        // Update preview info based on the current menu
        if (state.currentMenu === 'main-menu') {
            const ped = state.peds[state.focusedItemIndex];
            selectedModelName.textContent = ped ? ped.label : 'None';
            
            // Preview the ped in FiveM
            previewPed(ped.hash);
        } else if (state.currentMenu === 'clothing-menu') {
            const focusedElement = items[state.focusedItemIndex];
            
            if (state.subMenuLevel === 1) {
                // In component list
                const component = state.components[state.focusedItemIndex];
                if (component) {
                    selectedModelName.textContent = component.label;
                }
            } else if (state.subMenuLevel === 2) {
                // In variation list
                if (focusedElement.dataset.index === "back") {
                    selectedModelName.textContent = "Back to Components";
                } else if (focusedElement.classList.contains('texture-item')) {
                    selectedModelName.textContent = `Color ${focusedElement.dataset.texture}`;
                } else {
                    selectedModelName.textContent = `Style ${focusedElement.dataset.drawable}`;
                }
            }
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
    // Get the current focused element
    const currentMenuElement = document.getElementById(state.currentMenu);
    const items = currentMenuElement.querySelectorAll('.menu-item');
    const focusedElement = items[state.focusedItemIndex];
    
    if (state.currentMenu === 'main-menu') {
        // Select ped
        const selectedPed = state.peds[state.focusedItemIndex];
        state.selectedPed = selectedPed;
        
        // Apply the selected ped model in FiveM
        if (!document.body.classList.contains('preview-mode')) {
            fetch('https://elegant_pedmenu/selectPed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    model: selectedPed.hash
                })
            });
        }
        
        // Switch to clothing component menu
        state.subMenuLevel = 1;
        showMenu('clothing-menu');
        populateComponentList();
        
    } else if (state.currentMenu === 'clothing-menu') {
        if (state.subMenuLevel === 1) {
            // Selected a clothing component - show variations
            const componentIndex = parseInt(focusedElement.dataset.index);
            const component = state.components[componentIndex];
            
            if (component) {
                state.selectedComponent = component;
                state.subMenuLevel = 2;
                populateVariationList(component.id);
            }
            
        } else if (state.subMenuLevel === 2) {
            // In variation menu
            if (focusedElement.dataset.index === "back") {
                // Back button selected - return to component list
                state.subMenuLevel = 1;
                populateComponentList();
            } else {
                // Selected a variation
                const drawable = parseInt(focusedElement.dataset.drawable);
                const texture = parseInt(focusedElement.dataset.texture || 0);
                
                // Apply the selected clothing in FiveM
                if (!document.body.classList.contains('preview-mode')) {
                    fetch('https://elegant_pedmenu/selectClothing', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8',
                        },
                        body: JSON.stringify({
                            componentId: state.selectedComponent.id,
                            drawableId: drawable,
                            textureId: texture
                        })
                    });
                }
                
                // Update current selection
                state.currentClothingDrawable = drawable;
                state.currentClothingTexture = texture;
                
                // Stay in variation menu but update the UI to show current selection
                populateVariationList(state.selectedComponent.id);
            }
        }
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
                if (state.subMenuLevel === 1) {
                    // Top level of clothing menu - go back to main menu
                    state.subMenuLevel = 0;
                    showMenu('main-menu');
                } else if (state.subMenuLevel === 2) {
                    // In variations - go back to components
                    state.subMenuLevel = 1;
                    populateComponentList();
                }
            }
            break;
            
        case 'ArrowRight':
            if (state.currentMenu === 'main-menu' && state.selectedPed) {
                // From main menu to clothing menu
                state.subMenuLevel = 1;
                showMenu('clothing-menu');
                populateComponentList();
            }
            break;
            
        case 'Enter':
            selectFocusedItem();
            break;
            
        case 'Escape':
            if (state.currentMenu === 'clothing-menu') {
                if (state.subMenuLevel === 1) {
                    // Top level of clothing menu - go back to main menu
                    state.subMenuLevel = 0;
                    showMenu('main-menu');
                } else if (state.subMenuLevel === 2) {
                    // In variations - go back to components
                    state.subMenuLevel = 1;
                    populateComponentList();
                }
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

// Sample component options
function getSampleComponents() {
    return [
        { id: 0, name: "face", label: "Face", icon: "fas fa-grin-alt" },
        { id: 1, name: "mask", label: "Mask", icon: "fas fa-mask" },
        { id: 2, name: "hair", label: "Hair", icon: "fas fa-cut" },
        { id: 3, name: "arms", label: "Arms", icon: "fas fa-hand-rock" },
        { id: 4, name: "pants", label: "Pants", icon: "fas fa-socks" },
        { id: 5, name: "bag", label: "Bag", icon: "fas fa-shopping-bag" },
        { id: 6, name: "shoes", label: "Shoes", icon: "fas fa-shoe-prints" },
        { id: 7, name: "accessories", label: "Accessories", icon: "fas fa-glasses" },
        { id: 8, name: "shirt", label: "Shirt/Undershirt", icon: "fas fa-tshirt" },
        { id: 9, name: "body_armor", label: "Body Armor", icon: "fas fa-shield-alt" },
        { id: 10, name: "decals", label: "Decals", icon: "fas fa-brush" },
        { id: 11, name: "jacket", label: "Jacket", icon: "fas fa-user-tie" }
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
    document.documentElement.style.setProperty('--accent-color', '#8C52FF');      // Purple accent
    
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
    
    // Initialize state with sample components
    state.components = getSampleComponents();
    
    // Initialize menu with sample data
    openMenu();
    populatePedList();
});
