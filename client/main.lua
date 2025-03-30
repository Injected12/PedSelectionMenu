-- Client-side script for the Ped Menu

-- Local variables
local menuVisible = false
local currentPed = nil

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

-- Function to open the menu
function OpenPedMenu()
    menuVisible = true
    SetNuiFocus(true, true)
    
    -- Get only the ensured peds
    local peds = GetEnsuredPeds()
    
    SendNUIMessage({
        type = "open",
        peds = peds,
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

-- Select a ped and outfit
RegisterNUICallback('select', function(data, cb)
    local modelHash = data.model
    local clothingType = data.clothing
    
    -- Clean up preview ped
    if currentPed then
        DeleteEntity(currentPed)
        currentPed = nil
    end
    
    -- Request to change ped model from server
    TriggerServerEvent('elegant_pedmenu:setPedModel', modelHash, clothingType)
    
    cb('ok')
end)

-- Apply a specific outfit to the current ped
function ApplyOutfit(ped, outfitType)
    -- Clear any previous outfit
    ClearAllPedProps(ped)
    SetPedComponentVariation(ped, 0, 0, 0, 2)  -- Face
    SetPedComponentVariation(ped, 1, 0, 0, 2)  -- Mask
    SetPedComponentVariation(ped, 2, 0, 0, 2)  -- Hair
    SetPedComponentVariation(ped, 3, 0, 0, 2)  -- Torso
    SetPedComponentVariation(ped, 4, 0, 0, 2)  -- Legs
    SetPedComponentVariation(ped, 5, 0, 0, 2)  -- Hands/Parachute
    SetPedComponentVariation(ped, 6, 0, 0, 2)  -- Feet
    SetPedComponentVariation(ped, 7, 0, 0, 2)  -- Neck/Accessories
    SetPedComponentVariation(ped, 8, 0, 0, 2)  -- Undershirt
    SetPedComponentVariation(ped, 9, 0, 0, 2)  -- Body Armor
    SetPedComponentVariation(ped, 10, 0, 0, 2) -- Decals
    SetPedComponentVariation(ped, 11, 0, 0, 2) -- Torso 2
    
    -- Apply outfit based on type
    if outfitType == "casual" then
        -- Apply casual clothing
        SetPedComponentVariation(ped, 3, 0, 0, 2)  -- Torso
        SetPedComponentVariation(ped, 4, 1, 0, 2)  -- Legs (jeans)
        SetPedComponentVariation(ped, 6, 1, 0, 2)  -- Feet (sneakers)
        SetPedComponentVariation(ped, 8, 0, 0, 2)  -- Undershirt
        SetPedComponentVariation(ped, 11, 0, 0, 2) -- Torso 2 (t-shirt)
    elseif outfitType == "formal" then
        -- Apply formal/suit clothing
        SetPedComponentVariation(ped, 3, 1, 0, 2)  -- Torso
        SetPedComponentVariation(ped, 4, 0, 0, 2)  -- Legs (suit pants)
        SetPedComponentVariation(ped, 6, 3, 0, 2)  -- Feet (dress shoes)
        SetPedComponentVariation(ped, 8, 0, 0, 2)  -- Undershirt
        SetPedComponentVariation(ped, 11, 4, 0, 2) -- Torso 2 (suit jacket)
    elseif outfitType == "beach" then
        -- Apply beach clothing
        SetPedComponentVariation(ped, 3, 15, 0, 2) -- Torso (bare)
        SetPedComponentVariation(ped, 4, 15, 0, 2) -- Legs (shorts)
        SetPedComponentVariation(ped, 6, 5, 0, 2)  -- Feet (sandals)
        SetPedComponentVariation(ped, 11, 15, 0, 2) -- Torso 2 (bare/swim)
    elseif outfitType == "sports" then
        -- Apply sports clothing
        SetPedComponentVariation(ped, 3, 5, 0, 2)  -- Torso
        SetPedComponentVariation(ped, 4, 3, 0, 2)  -- Legs (track pants)
        SetPedComponentVariation(ped, 6, 1, 0, 2)  -- Feet (sneakers)
        SetPedComponentVariation(ped, 8, 0, 0, 2)  -- Undershirt
        SetPedComponentVariation(ped, 11, 1, 0, 2) -- Torso 2 (track jacket)
    elseif outfitType == "police" then
        -- Apply police outfit
        SetPedComponentVariation(ped, 3, 0, 0, 2)  -- Torso
        SetPedComponentVariation(ped, 4, 35, 0, 2) -- Legs
        SetPedComponentVariation(ped, 6, 25, 0, 2) -- Feet
        SetPedComponentVariation(ped, 8, 58, 0, 2) -- Undershirt
        SetPedComponentVariation(ped, 11, 55, 0, 2) -- Torso 2
    else
        -- Default outfit if none matched
        SetPedComponentVariation(ped, 3, 0, 0, 2)  -- Torso
        SetPedComponentVariation(ped, 4, 0, 0, 2)  -- Legs
        SetPedComponentVariation(ped, 6, 0, 0, 2)  -- Feet
        SetPedComponentVariation(ped, 8, 0, 0, 2)  -- Undershirt
        SetPedComponentVariation(ped, 11, 0, 0, 2) -- Torso 2
    end
end

-- Event to change the player's model
RegisterNetEvent('elegant_pedmenu:changePedModel')
AddEventHandler('elegant_pedmenu:changePedModel', function(modelHash, clothingType)
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
        
        -- Apply clothing if specified
        if clothingType then
            ApplyOutfit(newPed, clothingType)
        end
        
        -- Clear any animations
        ClearPedTasksImmediately(newPed)
        
        -- Set model as no longer needed
        SetModelAsNoLongerNeeded(modelHash)
        
        -- Notify the server that model was changed
        TriggerServerEvent('elegant_pedmenu:modelChanged', modelHash, clothingType)
        
        -- Show notification
        ShowNotification("Model changed successfully!")
    else
        ShowNotification("Failed to load model. Please try again.")
    end
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
end)
