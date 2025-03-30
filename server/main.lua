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

-- Event for setting a player's ped model
RegisterNetEvent('elegant_pedmenu:setPedModel')
AddEventHandler('elegant_pedmenu:setPedModel', function(modelHash)
    local source = source
    
    -- Just to ensure model exists (security check)
    local modelExists = false
    for _, category in ipairs(Config.Categories) do
        for _, model in ipairs(category.models) do
            if model.hash == modelHash then
                modelExists = true
                break
            end
        end
        if modelExists then break end
    end
    
    if not modelExists then
        -- If you have a notification system, you could use it here
        print("^1[PEDMENU]^7: Player " .. source .. " tried to use an invalid model!")
        return
    end
    
    -- We trigger the client event to change the model
    TriggerClientEvent('elegant_pedmenu:changePedModel', source, modelHash)
end)

-- Debug event to log when a player changes their model
RegisterNetEvent('elegant_pedmenu:modelChanged')
AddEventHandler('elegant_pedmenu:modelChanged', function(modelHash)
    local source = source
    local playerName = GetPlayerName(source)
    print("^2[PEDMENU]^7: " .. playerName .. " changed their model to " .. modelHash)
end)
