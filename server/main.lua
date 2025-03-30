-- Server-side script for the Ped Menu

-- Initialize the database when resource starts
AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    
    -- Initialize the database
    exports[GetCurrentResourceName()]:initializeDatabase()
    .then(function(success)
        if success then
            print('^2[PEDMENU]^7: Resource started successfully with database connection')
        else
            print('^1[PEDMENU]^7: Resource started but database initialization failed')
        end
    end)
    .catch(function(error)
        print('^1[PEDMENU]^7: Database error: ', error)
    end)
end)

-- Register the command on the server side
RegisterCommand(Config.CommandName, function(source, args, rawCommand)
    TriggerClientEvent('elegant_pedmenu:openMenu', source)
end, false)

-- Get player identifier for database storage
function GetPlayerIdentifier(source)
    local identifiers = GetPlayerIdentifiers(source)
    
    -- Prioritize FiveM's license identifier
    for _, v in pairs(identifiers) do
        if string.find(v, "license:") then
            return v
        end
    end
    
    -- Fallback to first available identifier
    return identifiers[1] or ("player:" .. source)
end

-- Load player's saved model and clothing from database
RegisterNetEvent('elegant_pedmenu:requestSavedData')
AddEventHandler('elegant_pedmenu:requestSavedData', function()
    local source = source
    local identifier = GetPlayerIdentifier(source)
    
    -- Get the player's saved model
    exports[GetCurrentResourceName()]:getPlayerPed(identifier)
    .then(function(modelData)
        if modelData then
            -- Get the player's saved clothing components
            exports[GetCurrentResourceName()]:getPlayerClothing(identifier)
            .then(function(clothingData)
                -- Send both model and clothing data to client
                TriggerClientEvent('elegant_pedmenu:loadSavedData', source, modelData.model_hash, clothingData)
            end)
            .catch(function(error)
                print('^1[PEDMENU]^7: Error loading clothing data: ', error)
                TriggerClientEvent('elegant_pedmenu:loadSavedData', source, modelData.model_hash, {})
            end)
        else
            -- No saved data found, send default MP model
            TriggerClientEvent('elegant_pedmenu:loadSavedData', source, "mp_m_freemode_01", {})
        end
    end)
    .catch(function(error)
        print('^1[PEDMENU]^7: Error loading player model: ', error)
        TriggerClientEvent('elegant_pedmenu:loadSavedData', source, "mp_m_freemode_01", {})
    end)
end)

-- Event for setting a player's ped model
RegisterNetEvent('elegant_pedmenu:setPedModel')
AddEventHandler('elegant_pedmenu:setPedModel', function(modelHash)
    local source = source
    
    -- Verify the model exists in the ensured list (security check)
    local modelExists = false
    for _, ped in ipairs(Config.EnsuredPeds) do
        if ped.hash == modelHash then
            modelExists = true
            break
        end
    end
    
    if not modelExists then
        -- Log security warning and return if invalid model
        print("^1[PEDMENU]^7: Player " .. source .. " tried to use an invalid model: " .. tostring(modelHash))
        return
    end
    
    -- Save the selected model to database
    local identifier = GetPlayerIdentifier(source)
    exports[GetCurrentResourceName()]:savePlayerPed(identifier, modelHash)
    .then(function(result)
        -- Send success to client
        if result then
            print("^2[PEDMENU]^7: Saved model " .. modelHash .. " for player " .. GetPlayerName(source))
        else
            print("^3[PEDMENU]^7: Failed to save model for player " .. GetPlayerName(source))
        end
    end)
    .catch(function(error)
        print("^1[PEDMENU]^7: Database error saving model: ", error)
    end)
    
    -- Trigger the client event to change the model
    TriggerClientEvent('elegant_pedmenu:changePedModel', source, modelHash)
end)

-- Event for setting a player's clothing component
RegisterNetEvent('elegant_pedmenu:setClothingComponent')
AddEventHandler('elegant_pedmenu:setClothingComponent', function(componentId, drawableId, textureId)
    local source = source
    local identifier = GetPlayerIdentifier(source)
    
    -- Verify component ID is valid
    local componentValid = false
    for _, component in ipairs(Config.ClothingComponents) do
        if component.id == componentId then
            componentValid = true
            break
        end
    end
    
    if not componentValid then
        print("^1[PEDMENU]^7: Player " .. source .. " tried to use an invalid component ID: " .. tostring(componentId))
        return
    end
    
    -- Save the clothing component
    exports[GetCurrentResourceName()]:savePlayerClothing(identifier, componentId, drawableId, textureId)
    .then(function(result)
        if result then
            print("^2[PEDMENU]^7: Saved clothing component " .. componentId .. " for player " .. GetPlayerName(source))
        else
            print("^3[PEDMENU]^7: Failed to save clothing for player " .. GetPlayerName(source))
        end
    end)
    .catch(function(error)
        print("^1[PEDMENU]^7: Database error saving clothing: ", error)
    end)
    
    -- Trigger client event to update just this clothing component
    TriggerClientEvent('elegant_pedmenu:updateClothingComponent', source, componentId, drawableId, textureId)
end)

-- Debug event to log when a player changes their model
RegisterNetEvent('elegant_pedmenu:modelChanged')
AddEventHandler('elegant_pedmenu:modelChanged', function(modelHash)
    local source = source
    local playerName = GetPlayerName(source)
    print("^2[PEDMENU]^7: " .. playerName .. " changed their model to " .. modelHash)
end)

-- Debug event to log when a player changes their clothing
RegisterNetEvent('elegant_pedmenu:clothingChanged')
AddEventHandler('elegant_pedmenu:clothingChanged', function(componentId, drawableId, textureId)
    local source = source
    local playerName = GetPlayerName(source)
    print("^2[PEDMENU]^7: " .. playerName .. " changed component " .. componentId .. " to drawable " .. drawableId .. " texture " .. textureId)
end)
