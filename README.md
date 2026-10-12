# GAIA tabletop interface

A circular, touch-oriented restaurant device prototype for a Raspberry Pi 5 and laptop previews. Built with HTML, CSS, and JavaScript; no package installation or build step is required.

## Download the latest version

[Download gaia-ui.zip](https://github.com/Korner-san/gaia-ui/raw/refs/heads/main/gaia-ui.zip)

Extract the ZIP before opening or serving the UI. It includes the current HTML, all images, documentation, and repository configuration. The GitHub workflow replaces this same ZIP after each update to main; wait for the workflow to finish before downloading. GitHub Pages is deployed from the packaged version.

## Run locally

From this directory, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000 in a browser on the same machine. On Windows, `py -m http.server 8000 --bind 127.0.0.1` can be used instead. For access from other devices, use a properly configured HTTPS host. 

## Features and controls

- Cream circular UI with synchronized amber ambient glows.
- Touch the display to rotate the interface toward the diner and begin interaction.
- GAIA wordmark, central leaf, animated listening/thinking/speaking states, and curved captions.
- Visual simulation with typed requests; voice output and microphone input are currently disabled.
- Generated roasted-vegetable and water previews during matching recommendations.
- **D**: studio controls, typed requests, and scripted simulations.
- **F**: fullscreen. **R**: reset. **Space/Enter**: start. **Escape**: stop the simulation.
- On touch-only displays, hold the center for 1.2 seconds to open studio controls.

## Files

- `index.html`: complete UI, styles, and interaction code.
- `assets/`: the two generated menu-preview images.
- `image-prompts.json`: prompts and generation provenance for those assets.

## Current scope

This is a prototype, not a connected restaurant ordering system. Typed requests are routed to scripted sample-menu responses; no AI conversation backend, payment system, or order submission is connected. No microphone capture or speech playback is active.

The preview is not physically calibrated to a five-inch display. The real screen resolution, touch mapping, kiosk startup, microphone, speakers, and hardware LEDs still need device-specific configuration and testing. The ambient lighting shown here is rendered on-screen.
