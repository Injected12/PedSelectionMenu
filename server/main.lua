-- Server-side script for the Ped Menu

-- Initialize the resource
AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    print('^2[PEDMENU]^7: Resource started successfully')
end)

-- Register the command on the server side
RegisterCommand(Config.CommandName, function(source, args, rawCommand)
    TriggerClientEvent('elegant_pedmenu:openMenu', source)
end, false)

-- Event for setting a player's ped model with optional clothing
RegisterNetEvent('elegant_pedmenu:setPedModel')
AddEventHandler('elegant_pedmenu:setPedModel', function(modelHash, clothingType)
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
    
    -- Verify the clothing type if provided
    if clothingType then
        local validClothing = false
        for _, outfit in ipairs(Config.Outfits) do
            if outfit.type == clothingType then
                validClothing = true
                break
            end
        end
        
        if not validClothing then
            print("^3[PEDMENU]^7: Player " .. source .. " tried to use an invalid clothing type: " .. tostring(clothingType))
            -- Continue anyway with just the model, not the invalid clothing
            clothingType = nil
        end
    end
    
    -- Trigger the client event to change the model with optional clothing
    TriggerClientEvent('elegant_pedmenu:changePedModel', source, modelHash, clothingType)
end)

-- Debug event to log when a player changes their model
RegisterNetEvent('elegant_pedmenu:modelChanged')
AddEventHandler('elegant_pedmenu:modelChanged', function(modelHash, clothingType)
    local source = source
    local playerName = GetPlayerName(source)
    
    local logMessage = "^2[PEDMENU]^7: " .. playerName .. " changed their model to " .. modelHash
    if clothingType then
        logMessage = logMessage .. " with " .. clothingType .. " outfit"
    end
    
    print(logMessage)
end)
