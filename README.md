# Vinyl Social Asset Generator

This is a web application designed to help users create short video assets featuring a spinning vinyl record with custom audio and label artwork, suitable for sharing on social media.

Users can upload an audio track, upload a custom image for the vinyl label, and configure animation settings. The application then generates and downloads an MP4 video file of the spinning vinyl synchronized with the audio.

## Features

*   Upload custom audio (MP3, WAV, AIFF)
*   Upload custom vinyl label image (JPEG, PNG, GIF, WEBP)
*   Audio waveform visualization (via Wavesurfer.js)
*   Configure vinyl spin speed (RPM) and direction
*   Choose output video aspect ratio (9x16 Vertical, 4x5 Portrait, 1x1 Square)
*   Adjust audio start/end points (TODO - Check if implemented)
*   Select export quality (Low, Medium, High) affecting resolution and bitrate
*   Set desired video duration
*   Client-side video generation using FFmpeg.wasm
*   Responsive UI using React, TypeScript, and Tailwind CSS

## Setup and Installation

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd vite-react-typescript-starter 
    ```
    *(Replace `<repository-url>` if cloned)*

2.  **Install dependencies:**
    Requires Node.js and npm.
    ```bash
    npm install
    ```

## Running the Development Server

1.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to the local URL provided (usually `http://localhost:5173`).

## How to Use

1.  **Upload Audio:** Click the audio upload button and select an MP3, WAV, or AIFF file. A waveform will appear.
2.  **Upload Label Image:** Click the image upload button and select a JPEG, PNG, GIF, or WEBP file for the vinyl label.
3.  **Configure Settings:**
    *   Use the controls to adjust the vinyl's spin speed (RPM) and direction.
    *   Select the desired output aspect ratio (Vertical, Portrait, Square).
    *   (If implemented) Adjust the audio start/end markers on the waveform.
    *   Set the desired output video duration.
    *   Choose the export quality (Low, Medium, High).
4.  **Export:** Click the "Export" button. The application will process the video in the background (using a Web Worker). Progress will be displayed.
5.  **Download:** Once processing is complete, the MP4 video file will be automatically downloaded by your browser.

## Project Structure

```
/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable React components (Header, Vinyl, AudioControls, etc.)
│   ├── context/        # React Context providers (Audio, Vinyl, Export, App)
│   ├── hooks/          # Custom React hooks (if any)
│   ├── pages/          # Page components (Home, About, Contact)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions (e.g., ffmpeg loading)
│   ├── workers/        # Web Worker scripts (exportWorker.ts)
│   ├── App.tsx         # Root application component with routing
│   ├── main.tsx        # Application entry point
│   └── index.css       # Tailwind CSS base styles and custom CSS
├── .eslintrc.cjs       # ESLint configuration
├── .gitignore          # Git ignore file
├── index.html          # Main HTML entry point
├── package.json        # Project metadata and dependencies
├── postcss.config.js   # PostCSS configuration (for Tailwind)
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # Base TypeScript configuration
├── tsconfig.node.json  # TypeScript config for Node environment (e.g., Vite config)
├── vite.config.ts      # Vite configuration
└── README.md           # This file
```

## TODO / Potential Improvements

*   Add audio start/end time selection controls.
*   Improve export progress reporting detail.
*   Implement more robust error handling and user feedback.
*   Add automated tests (Unit/Integration).
*   Optimize frame capture performance/consistency.
*   Explore adding more visual customization options (backgrounds, text overlays).
*   Resolve worker TypeScript type issues. 