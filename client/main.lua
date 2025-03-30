-- Client-side script for the Ped Menu

-- Local variables
local menuVisible = false
local currentPed = nil
local savedClothingData = {}

-- Function to get ensured ped models
function GetEnsuredPeds()
    local ensuredPeds = {}
    local existingHashes = {}
    
    -- Convert configured peds to a simple list format
    for _, ped in ipairs(Config.EnsuredPeds) do
        -- Check if this hash hasn't been added yet (avoid duplicates)
        if not existingHashes[ped.hash] then
            table.insert(ensuredPeds, {
                label = ped.label,
                hash = ped.hash
            })
            existingHashes[ped.hash] = true
        end
    end
    
    return ensuredPeds
end

-- Get clothing components from config
function GetClothingComponents()
    local components = {}
    
    for _, component in ipairs(Config.ClothingComponents) do
        table.insert(components, {
            id = component.id,
            name = component.name,
            label = component.label,
            icon = component.icon
        })
    end
    
    return components
end

-- Function to open the menu
function OpenPedMenu()
    menuVisible = true
    SetNuiFocus(true, true)
    
    -- Get only the ensured peds
    local peds = GetEnsuredPeds()
    local components = GetClothingComponents()
    
    SendNUIMessage({
        type = "open",
        peds = peds,
        components = components,
        colors = Config.UI.colors
    })
end

-- Register command to open the menu
RegisterCommand(Config.CommandName, function(source, args, rawCommand)
    OpenPedMenu()
end, false)

-- Register key mapping (optional)
RegisterKeyMapping('/' .. Config.CommandName, 'Open Ped Selection Menu', 'keyboard', 'F7')

-- NUI Callbacks
RegisterNUICallback('close', function(data, cb)
    menuVisible = false
    SetNuiFocus(false, false)
    
    -- Delete preview ped if exists
    if currentPed then
        DeleteEntity(currentPed)
        currentPed = nil
    end
    
    cb('ok')
end)

-- Preview the ped model
RegisterNUICallback('preview', function(data, cb)
    local modelHash = data.model
    
    -- If we already have a preview ped, delete it
    if currentPed then
        DeleteEntity(currentPed)
        currentPed = nil
    end
    
    -- Convert string to hash if it's not a number
    if type(modelHash) == 'string' then
        modelHash = GetHashKey(modelHash)
    end
    
    -- Request the model
    RequestModel(modelHash)
    
    -- Wait for the model to load
    local timeout = 0
    while not HasModelLoaded(modelHash) and timeout < 100 do
        Wait(10)
        timeout = timeout + 1
    end
    
    if HasModelLoaded(modelHash) then
        -- Get player position
        local playerPed = PlayerPedId()
        local playerCoords = GetEntityCoords(playerPed)
        local playerHeading = GetEntityHeading(playerPed)
        
        -- Create preview ped slightly in front of player
        local offset = GetOffsetFromEntityInWorldCoords(playerPed, 0.0, 2.0, 0.0)
        
        currentPed = CreatePed(4, modelHash, offset.x, offset.y, offset.z, playerHeading - 180.0, false, false)
        
        -- Make the preview ped face the player
        TaskTurnPedToFaceEntity(currentPed, playerPed, -1)
        
        -- Set ped properties
        SetEntityInvincible(currentPed, true)
        SetBlockingOfNonTemporaryEvents(currentPed, true)
        FreezeEntityPosition(currentPed, true)
        SetPedCanRagdoll(currentPed, false)
        SetModelAsNoLongerNeeded(modelHash)
        
        -- Play an animation for preview
        RequestAnimDict("mini@strip_club@idles@bouncer@base")
        while not HasAnimDictLoaded("mini@strip_club@idles@bouncer@base") do
            Wait(10)
        end
        TaskPlayAnim(currentPed, "mini@strip_club@idles@bouncer@base", "base", 8.0, -8.0, -1, 1, 0, false, false, false)
        
        cb({success = true})
    else
        cb({success = false, error = "Could not load model"})
    end
end)

-- Select a ped model
RegisterNUICallback('selectPed', function(data, cb)
    local modelHash = data.model
    
    -- Clean up preview ped
    if currentPed then
        DeleteEntity(currentPed)
        currentPed = nil
    end
    
    -- Request to change ped model from server
    TriggerServerEvent('elegant_pedmenu:setPedModel', modelHash)
    
    cb('ok')
end)

-- Select a clothing component and variation
RegisterNUICallback('selectClothing', function(data, cb)
    local componentId = data.componentId
    local drawableId = data.drawableId
    local textureId = data.textureId or 0
    
    -- Request to change clothing component from server
    TriggerServerEvent('elegant_pedmenu:setClothingComponent', componentId, drawableId, textureId)
    
    cb('ok')
end)

-- Get available variations for a clothing component
RegisterNUICallback('getVariations', function(data, cb)
    local componentId = data.componentId
    local pedModel = GetEntityModel(PlayerPedId())
    
    local variations = {}
    local numDrawables = GetNumberOfPedDrawableVariations(PlayerPedId(), componentId)
    
    for i = 0, numDrawables - 1 do
        local numTextures = GetNumberOfPedTextureVariations(PlayerPedId(), componentId, i)
        
        local textures = {}
        for j = 0, numTextures - 1 do
            table.insert(textures, j)
        end
        
        table.insert(variations, {
            drawable = i,
            textures = textures
        })
    end
    
    cb({
        variations = variations,
        currentDrawable = GetPedDrawableVariation(PlayerPedId(), componentId),
        currentTexture = GetPedTextureVariation(PlayerPedId(), componentId)
    })
end)

-- Apply specific clothing component to the current ped
function ApplyClothingComponent(componentId, drawableId, textureId)
    local ped = PlayerPedId()
    
    -- Apply the component variation
    SetPedComponentVariation(ped, componentId, drawableId, textureId or 0, 2)
    
    -- Notify the server that clothing was changed
    TriggerServerEvent('elegant_pedmenu:clothingChanged', componentId, drawableId, textureId or 0)
end

-- Apply all saved clothing components to the current ped
function ApplySavedClothing(ped)
    -- Default all components to 0 first
    for i = 0, 11 do
        SetPedComponentVariation(ped, i, 0, 0, 2)
    end
    
    -- Apply saved components if available
    if savedClothingData and #savedClothingData > 0 then
        for _, item in ipairs(savedClothingData) do
            SetPedComponentVariation(ped, item.component_id, item.drawable_id, item.texture_id, 2)
        end
    end
end

-- Event to change the player's model
RegisterNetEvent('elegant_pedmenu:changePedModel')
AddEventHandler('elegant_pedmenu:changePedModel', function(modelHash)
    -- Convert string to hash if it's not a number
    if type(modelHash) == 'string' then
        modelHash = GetHashKey(modelHash)
    end
    
    -- Request the model
    RequestModel(modelHash)
    
    -- Wait for the model to load
    local timeout = 0
    while not HasModelLoaded(modelHash) and timeout < 100 do
        Wait(10)
        timeout = timeout + 1
    end
    
    if HasModelLoaded(modelHash) then
        -- Save old position and heading
        local oldPed = PlayerPedId()
        local pos = GetEntityCoords(oldPed)
        local heading = GetEntityHeading(oldPed)
        
        -- Set the player model
        SetPlayerModel(PlayerId(), modelHash)
        
        -- Get the new ped
        local newPed = PlayerPedId()
        
        -- Set position and heading
        SetEntityCoords(newPed, pos.x, pos.y, pos.z, false, false, false, false)
        SetEntityHeading(newPed, heading)
        
        -- Apply saved clothing if available
        ApplySavedClothing(newPed)
        
        -- Clear any animations
        ClearPedTasksImmediately(newPed)
        
        -- Set model as no longer needed
        SetModelAsNoLongerNeeded(modelHash)
        
        -- Notify the server that model was changed
        TriggerServerEvent('elegant_pedmenu:modelChanged', modelHash)
        
        -- Show notification
        ShowNotification("Model changed successfully!")
    else
        ShowNotification("Failed to load model. Please try again.")
    end
end)

-- Event to update a specific clothing component
RegisterNetEvent('elegant_pedmenu:updateClothingComponent')
AddEventHandler('elegant_pedmenu:updateClothingComponent', function(componentId, drawableId, textureId)
    ApplyClothingComponent(componentId, drawableId, textureId)
    
    -- Find and update in saved data
    local found = false
    for i, item in ipairs(savedClothingData) do
        if item.component_id == componentId then
            savedClothingData[i].drawable_id = drawableId
            savedClothingData[i].texture_id = textureId
            found = true
            break
        end
    end
    
    -- Add to saved data if not found
    if not found then
        table.insert(savedClothingData, {
            component_id = componentId,
            drawable_id = drawableId,
            texture_id = textureId
        })
    end
    
    ShowNotification("Clothing updated!")
end)

-- Event to load saved data from database
RegisterNetEvent('elegant_pedmenu:loadSavedData')
AddEventHandler('elegant_pedmenu:loadSavedData', function(modelHash, clothingData)
    -- Save clothing data for later use
    savedClothingData = clothingData or {}
    
    -- Change the model (which will also apply saved clothing)
    TriggerEvent('elegant_pedmenu:changePedModel', modelHash)
end)

-- Helper function for notifications
function ShowNotification(message)
    BeginTextCommandThefeedPost("STRING")
    AddTextComponentSubstringPlayerName(message)
    EndTextCommandThefeedPostTicker(true, false)
end

-- Initialize when resource starts
AddEventHandler('onClientResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    
    -- Pre-load some common animations
    RequestAnimDict("mini@strip_club@idles@bouncer@base")
    
    -- Don't auto-open the menu, just request saved data
    Wait(1000) -- Wait a bit for everything to initialize
    TriggerServerEvent('elegant_pedmenu:requestSavedData')
end)
