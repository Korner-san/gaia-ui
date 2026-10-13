# GAIA tabletop interface

A circular, touch-oriented restaurant device prototype for a Raspberry Pi 5 and laptop previews. Built with HTML, CSS, and JavaScript; no package installation or build step is required.

## Download the latest version

[Download gaia-ui.zip](https://github.com/Korner-san/gaia-ui/raw/refs/heads/main/gaia-ui.zip)

Extract the ZIP before opening or serving the UI. It includes the current HTML, all images, documentation, and repository configuration. The GitHub workflow replaces this same ZIP after each update to main; wait for the workflow to finish before downloading. GitHub Pages is deployed from the packaged version.

## Run locally

Clone the repository on any computer, then serve its root:

```bash
git clone https://github.com/Korner-san/gaia-ui.git
cd gaia-ui
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000 in a browser on the same machine. On Windows, `py -m http.server 8000 --bind 127.0.0.1` can be used instead. For access from other devices, use a properly configured HTTPS host. 

## Features and controls

- Cream circular UI with synchronized amber ambient glows.
- Touch the display to rotate the interface toward the diner and begin interaction.
- GAIA wordmark, central leaf, animated listening/thinking/speaking states, and curved captions.
- Touch-driven visual simulation; voice output and microphone input are currently disabled.
- Generated roasted-vegetable and water previews during matching recommendations.
- Slowly moving water refraction around the perimeter, with a gradual inward fade and slightly uneven touch ripples. The interface stays above the water layer.
- **D**: switch directly between liquid texture and regular mode.
- **F**: fullscreen. **R**: reset. **Space/Enter**: start. **Escape**: stop the simulation.
- No settings screen or long-press menu. Touch starts the scripted demo.

## Files

- `index.html`: complete UI, styles, and interaction code.
- `assets/`: menu-preview images, the WebGL water renderer, and its static fallback.
- `image-prompts.json`: prompts and generation provenance for those assets.
- `tools/render-water-still.py`: regenerates the fallback texture; requires NumPy and Pillow only when regenerating it.
- `scripts/gaia-kiosk`: Linux/Chromium desktop kiosk launcher.
- `docs/`: design references, review screenshots, setup, and continuation notes.
- `archive/`: snapshots from before the liquid implementation and earlier water revisions.
- `index.original.html` and `index.elevated-backup.html`: earlier interface variants.

## Continue working and restore earlier versions

See [setup and backup notes](docs/CONTINUING.md) for desktop kiosk setup, the development workflow, and rollback instructions. See [water design notes](docs/WATER-DESIGN.md) for the selected concepts and implementation constraints.

On an existing clone, run `git pull --ff-only` before starting work. Commit and push your changes when ready; local edits are not backed up until they reach GitHub. The existing Actions workflow refreshes the download ZIP and deploys GitHub Pages after updates to `main`.

## Current scope

This is a prototype, not a connected restaurant ordering system. Touches advance scripted sample-menu responses; no AI conversation backend, payment system, or order submission is connected. No microphone capture or speech playback is active.

The preview is not physically calibrated to a five-inch display. The real screen resolution, touch mapping, kiosk startup, microphone, speakers, and hardware LEDs still need device-specific configuration and testing. The ambient lighting shown here is rendered on-screen.
