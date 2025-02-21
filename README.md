# OpenAI Response Analysis Tools

A collection of tools designed to help analyze and compare OpenAI API response. This project provides utilities and interfaces for researchers and developers to better understand and evaluate OpenAI's language model outputs.

## Features

### Message Viewer

- Converts raw conversation JSON into a readable format
- Displays messages with role information (e.g., user, assistant)
- Easy-to-use interface with copy functionality
- Supports multiple message formats

### Model Converter

- Converts conversation configurations between different models
- Automatically handles model-specific parameters
- Removes unnecessary fields (e.g., snippy)
- Supports model version updates

### Stream Parser

- Parses OpenAI stream response data
- Extracts content from chunked responses
- Handles different response formats
- Supports SSE (Server-Sent Events) format
- Filters out control messages ([DONE], etc.)

### Common Features

- Dark mode support
- Responsive design for all screen sizes
- Copy to clipboard functionality
- Error handling and validation
- Real-time conversion

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Custom components with modern design
- **Development Tools**:
  - ESLint for code quality
  - PostCSS for CSS processing
  - Modern JavaScript features

## Getting Started

1. Clone the repository:

```bash
git clone [repository-url]
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

### Message Viewer

1. Paste your OpenAI conversation JSON into the input field
2. Click "Convert" to transform it into a readable format
3. Use the copy button to copy the formatted output

### Model Converter

1. Input your conversation JSON with the current model configuration
2. Click "Convert" to update the model settings
3. Copy the converted JSON for use with the new model

### Stream Parser

1. Paste your OpenAI stream response data (starting with 'data:')
2. Click "Convert" to extract the actual content
3. View and copy the parsed response

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          # Reusable UI components
│   └── ui/             # Core UI components
├── lib/                # Utility functions and helpers
└── public/             # Static assets
```

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm run start`
- Lint code: `npm run lint`

## Contributing

Feel free to submit issues and enhancement requests.

## License

[Your chosen license]
