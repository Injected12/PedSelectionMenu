fx_version 'cerulean'
game 'gta5'

name 'elegant_pedmenu'
description 'A stylish black and grey themed menu for selecting character models'
author 'AI Developer'
version '1.0.0'

client_scripts {
    'config.lua',
    'client/main.lua'
}

server_scripts {
    'config.lua',
    'server/main.lua',
    'server/db.js'
}

ui_page 'ui/index.html'

files {
    'ui/index.html',
    'ui/style.css',
    'ui/script.js'
}
