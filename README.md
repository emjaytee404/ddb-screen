# ddb-screen

Another D&D Beyond DM Screen

## About

A very basic DM Screen for [D&D Beyond](https://www.dndbeyond.com/). Pretty much a crappier version of [swichers/dndbeyond-screen](https://github.com/swichers/dndbeyond-screen) (except that seems to be broken right now).

**All** of the stats calculation logic was written by [DjikstraTheDragon](https://www.dndbeyond.com/forums/d-d-beyond-general/general-discussion/94605-script-to-generate-a-table-of-data-relevant-to-the) ([python code](https://colab.research.google.com/drive/1rfc6Qd7l-PSdIHKEMnQdeImXL_XjI5-v?usp=sharing)), and credit goes fully to them. I simply (poorly) rewrote it to Javascript and fixed a couple issues. Many thanks!

## How to Use

I'm hoping it's pretty self-explanatory:

![screenshot](screenshot.png?raw=true)

### Table Columns

| Name <sup>Level - Link</sup> | Hit Points | Passive Perception  | Passive Investigation  | Passive Insight  | Armor Class  |
| ---                          | ---        | ---                 | ---                    | ---              | ---          |

### Buttons

  * ❌ Remove Player
  * ✔️ Add New Player
  * 🔎 Open/Close Zoom Control
  * 💾 Save Current Player List as a Campaign
  * 🔄 Refresh Stats
  * ⬇️ Export JSON
  * ⛔ Delete All Players

  * In the Campaigns List
    * 🗑️ Delete Campaign

### Other Features

All data is stored in the browser. I haven't had the need to implement import funcitonality. 🤷

Player rows are draggable. You can manually sort them by name, initiative order, whatever.

Player name is editable. Click on the name to shorten/enter a nickname. The custom name is remembered next time that player is loaded.

**Why did you add a Zoom function? The browser already supplies it.**

I didn't realize this was a FAQ, but OK: The Zoom feature is there because I usually embed the screeen on another page, and there's no way to zoom just one portion of the screen. Feel free to take it out.

## Installation Instructions

### Generic Web Host

1. Upload the contents of the [public](public) directory to your favorite web host. I'm a huge fan of [Nearly Free Speech](https://www.nearlyfreespeech.net/).
2. There is no step 2.

### Alternative Installation: Deploy to Cloudflare Pages

You can deploy to [Cloudflare Pages](https://pages.cloudflare.com/). The [Get Started Guide](https://developers.cloudflare.com/pages/get-started/) has all the information you need. Leave **Build command** empty and set **Build output directory** to `public`.

## Credits

  * Again, many thanks to DjikstraTheDragon on the DDB forums, for sharing their work.
  * Favicon by [Lars](https://thenounproject.com/icon/d20-dice-4888843/). Danke!
  * External link icon by the awesome folks at [Font Awesome](https://fontawesome.com/).
