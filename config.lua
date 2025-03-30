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

-- Available outfits
Config.Outfits = {
    {type = "casual", label = "Casual Outfit", icon = "fas fa-tshirt"},
    {type = "formal", label = "Formal Outfit", icon = "fas fa-user-tie"},
    {type = "beach", label = "Beach Outfit", icon = "fas fa-umbrella-beach"},
    {type = "sports", label = "Sports Outfit", icon = "fas fa-running"},
    {type = "biker", label = "Biker Outfit", icon = "fas fa-motorcycle"},
    {type = "police", label = "Police Outfit", icon = "fas fa-shield-alt"},
    {type = "military", label = "Military Outfit", icon = "fas fa-fighter-jet"},
    {type = "hiking", label = "Hiking Outfit", icon = "fas fa-hiking"}
}

-- UI Colors
Config.UI = {
    colors = {
        primary = "#000000",       -- Black
        secondary = "#333333",     -- Dark Grey
        tertiary = "#666666",      -- Light Grey
        text = "#FFFFFF",          -- White
        highlight = "#888888"      -- Lighter Grey for highlights
    }
}
