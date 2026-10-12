# GAIA tabletop interface

A circular, touch-oriented restaurant device prototype for a Raspberry Pi 5 and laptop previews. Built with HTML, CSS, and JavaScript; no package installation or build step is required.

## Run locally

From this directory, run:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000 in a browser on the same machine. On Windows, `py -m http.server 8000 --bind 127.0.0.1` can be used instead. For access from other devices, use a properly configured HTTPS host. Browser microphone support and voice availability vary by device.

## Features and controls

- Cream circular UI with synchronized amber ambient glows.
- Touch the display to rotate the interface toward the diner and begin interaction.
- GAIA wordmark, central leaf, animated listening/thinking/speaking states, and curved captions.
- Spoken captions using browser speech synthesis and microphone input using supported browser speech recognition.
- Generated roasted-vegetable and water previews during matching recommendations.
- A visible **Stop listening** button closes microphone capture and returns to idle.
- **D**: studio controls, voice selection, typed requests, and scripted simulations.
- **F**: fullscreen. **R**: reset. **Space/Enter**: start. **Escape**: stop voice and microphone.
- On touch-only displays, hold the center for 1.2 seconds to open studio controls.

## Files

- `index.html`: complete UI, styles, and interaction code.
- `assets/`: the two generated menu-preview images.
- `image-prompts.json`: prompts and generation provenance for those assets.

## Current scope

This is a prototype, not a connected restaurant ordering system. Voice requests are routed to scripted sample-menu responses; no AI conversation backend, payment system, or order submission is connected. The browser may send microphone audio to its speech service. This app does not store recordings or transcripts on a server.

The preview is not physically calibrated to a five-inch display. The real screen resolution, touch mapping, kiosk startup, microphone, speakers, and hardware LEDs still need device-specific configuration and testing. The ambient lighting shown here is rendered on-screen.
