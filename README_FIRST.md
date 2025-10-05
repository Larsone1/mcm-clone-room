# mcm-clone-room

This is a Next.js project for a 1:1 video-chat room with a 2D talking-head clone.

## Quick Start

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000/room](http://localhost:3000/room) with your browser.

## Backend Integration (TTS/VC)

To connect a real-time Text-to-Speech / Voice-Cloning backend:

1.  **Set the WebSocket URL:**
    Create a `.env.local` file and add your backend endpoint:
    ```
    NEXT_PUBLIC_WEBRTC_URL=ws://localhost:8443/realtime
    ```

2.  **Data Contract:**
    The client sends audio data (raw PCM chunks) via the WebSocket. The backend is expected to stream back JSON messages with the following structure:
    ```json
    {
      "text": "This is the transcribed and synthesized text.",
      "visemes": [0.1, 0.8, 0.2, ...] 
    }
    ```
    - `text`: The final string of text to be displayed.
    - `visemes`: An array of numbers (0-1) representing mouth shapes, synchronized with the generated audio.

### Fallback Mode

If the WebSocket connection specified in `NEXT_PUBLIC_WEBRTC_URL` fails, the application will automatically fall back to the browser's built-in Web Speech Synthesis API for voice generation and viseme approximation.

To **force** fallback mode for testing, you can either:
- Set an invalid URL in `.env.local`.
- Append the `?fallback=true` query parameter to the URL: `http://localhost:3000/room?fallback=true`.

## Debug Metrics Overlay

To display a real-time metrics overlay (FPS, TTFP, RTT) in the top-right corner, append the `?debug=true` query parameter to the URL:
`http://localhost:3000/room?debug=true`

## Future Expansion: Mini-AR

The current 2D canvas is a placeholder for a more immersive AR experience. The plan is to:
1.  Replace `CloneCanvas2D` with a `CloneCanvas3D` component using `react-three-fiber`.
2.  Integrate a library like `mind-ar-js` or directly use the WebXR API for face tracking.
3.  Map the user's facial movements or environment to a 3D model (e.g., a GLB avatar), creating a lightweight AR clone that reacts in real-time.
