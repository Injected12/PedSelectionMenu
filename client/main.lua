-- Client-side script for the Ped Menu

-- Local variables
local menuVisible = false
local currentPed = nil

-- Function to open the menu
function OpenPedMenu()
    menuVisible = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = "open",
        categories = Config.Categories,
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
    if currentPed then
        DeleteEntity(currentPed)
        currentPed = nil
    end
    cb('ok')
end)

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
        local x, y, z = table.unpack(playerCoords)
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
        
        -- Play an animation
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

RegisterNUICallback('select', function(data, cb)
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
