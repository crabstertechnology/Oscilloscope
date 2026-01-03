# **App Name**: SignalScope Pro

## Core Features:

- File Upload and Parsing: Accepts .scp, .txt, and .csv files via drag-and-drop or browse, parsing oscilloscope data for analysis. Limits file size to 50MB.
- Data Visualization: Interactive charts using Chart.js with zoom/pan, overlay and separate plot modes, and customizable grid display.
- Statistics Calculation: Calculates key statistics (mean, RMS, peak-to-peak voltage, frequency) for each channel and the entire dataset, displayed in an accessible card-based UI.
- Export Functionality: Enables exporting charts as PNG images and data as CSV files with full precision.
- Responsive Design and Accessibility: Fully responsive layout that ensures that the webapp and chart remain useable even on very small screens such as on mobile devices. Complete accessibility including keyboard navigation and screen reader support.
- Error Handling: Validates files and the file format. Clear and effective UI messaging when there are any problems encountered in uploading the file.

## Style Guidelines:

- Primary color: Light blue (#90CAF9) to provide a calming, technical, yet inviting atmosphere. It is the main color that will be used throughout the UI.
- Background color: Off-white (#FAFAFA) to keep it easy on the eye.
- Accent color: Soft purple (#CE93D8), to highlight the main parts of the UI.
- Body and headline font: 'Inter', sans-serif; for a professional look, note: currently only Google Fonts are supported.
- Minimal, professional icons from a set like Material Design Icons, to offer additional legibility of displayed content. These icons would add detail without taking away focus from the oscilloscope readings and statistics. These should use the same primary color where appropriate.
- Modern, minimal layout with clear sections for file upload, controls, statistics, and charts; inspired by Google Material Design 3, it keeps a clean and professional aesthetic, with glassmorphism and subtle shadows to distinguish sections clearly.
- Smooth transitions (0.3s ease) and micro-interactions on interactive elements to enhance usability.