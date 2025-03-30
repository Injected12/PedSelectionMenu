# Elegant PedMenu for FiveM

A stylish black and grey themed menu for selecting character models in FiveM using the `/pedmenu` command.

## Features

- Clean, modern UI with a black and grey theme
- Organized categories for different types of character models
- Preview functionality to see models before selecting
- Search functionality to find specific models quickly
- Smooth animations and transitions
- Easy to customize via the config file

## Installation

1. Download the resource
2. Place it in your FiveM server's `resources` folder
3. Add `ensure elegant_pedmenu` to your `server.cfg`
4. Restart your server or use the `refresh` and `start elegant_pedmenu` commands

## Usage

1. In-game, type `/pedmenu` in the chat or press F7 (default keybind)
2. Select a category from the left panel
3. Browse or search for a model in the middle panel
4. Click on a model to preview it
5. Click the "Select Model" button to apply the model to your character

## Configuration

You can customize the resource by editing the `config.lua` file:

- Change the command name
- Add, modify, or remove ped model categories
- Adjust UI colors to match your server's theme

## Customizing Models

To add your own models to the menu, edit the `config.lua` file. In the `Config.Categories` table, you can add new categories or modify existing ones. Each category contains a list of models with their hash and label.

Example of adding a new category:

```lua
{
    name = "My Custom Models",
    models = {
        {hash = "model_hash_1", label = "My Model 1"},
        {hash = "model_hash_2", label = "My Model 2"},
        -- Add more models as needed
    }
}
