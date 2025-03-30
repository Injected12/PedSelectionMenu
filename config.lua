Config = {}

-- General configuration
Config.CommandName = "pedmenu" -- Command to open the ped menu

-- List of ensured ped models
-- These are the only ped models that will be available in the menu
Config.EnsuredPeds = {
    {hash = "mp_m_freemode_01", label = "Default Male"},
    {hash = "mp_f_freemode_01", label = "Default Female"},
    {hash = "player_zero", label = "Michael"},
    {hash = "player_one", label = "Franklin"},
    {hash = "player_two", label = "Trevor"},
    {hash = "a_m_m_beach_01", label = "Beach Male"},
    {hash = "a_m_m_business_01", label = "Business Man"},
    {hash = "a_m_m_downtown_01", label = "Downtown Male"},
    {hash = "a_m_m_farmer_01", label = "Farmer"},
    {hash = "a_m_y_jogger_01", label = "Jogger"},
    {hash = "a_m_y_skater_01", label = "Skater"},
    {hash = "a_f_m_business_02", label = "Business Woman"},
    {hash = "a_f_y_tourist_01", label = "Tourist Female"},
    {hash = "g_m_y_ballasout_01", label = "Gang Member"},
    {hash = "s_m_y_cop_01", label = "Police Officer"},
    {hash = "s_m_y_fireman_01", label = "Firefighter"},
    {hash = "s_m_m_paramedic_01", label = "Paramedic"}
}

-- Clothing Components that can be changed individually
Config.ClothingComponents = {
    {id = 0, name = "face", label = "Face", icon = "fas fa-grin-alt"},
    {id = 1, name = "mask", label = "Mask", icon = "fas fa-mask"},
    {id = 2, name = "hair", label = "Hair", icon = "fas fa-cut"},
    {id = 3, name = "arms", label = "Arms", icon = "fas fa-hand-rock"},
    {id = 4, name = "pants", label = "Pants", icon = "fas fa-socks"},
    {id = 5, name = "bag", label = "Bag", icon = "fas fa-shopping-bag"},
    {id = 6, name = "shoes", label = "Shoes", icon = "fas fa-shoe-prints"},
    {id = 7, name = "accessories", label = "Accessories", icon = "fas fa-glasses"},
    {id = 8, name = "shirt", label = "Shirt/Undershirt", icon = "fas fa-tshirt"},
    {id = 9, name = "body_armor", label = "Body Armor", icon = "fas fa-shield-alt"},
    {id = 10, name = "decals", label = "Decals", icon = "fas fa-brush"},
    {id = 11, name = "jacket", label = "Jacket", icon = "fas fa-user-tie"}
}

-- UI Colors
Config.UI = {
    colors = {
        primary = "#000000",       -- Black
        secondary = "#333333",     -- Dark Grey
        tertiary = "#666666",      -- Light Grey
        text = "#FFFFFF",          -- White
        highlight = "#888888",     -- Lighter Grey for highlights
        accent = "#8C52FF"         -- Vibrant Purple accent color
    }
}
