# Zenix

Zenix is a secure and modern video viewing platform built to deliver personalized content with enhanced encryption. Designed with privacy and user engagement in mind, Zenix allows users to upload, stream, and interact with video content in a secure environment.

## Features

- **Video Upload**: Content creators can upload videos with metadata.
- **Encrypted Streaming**: Videos are streamed securely, preventing unauthorized downloads.
- **Personalized Recommendations**: AI-powered engine suggests videos tailored to user preferences.
- **Interactive Engagement**: Like, comment, and explore trending content.

## Tech Stack

- **Frontend**: React Native for cross-platform mobile app development.
- **Backend**: Node.js with Express and JWT-based authentication.
- **Database**: PostgreSQL for structured data storage.
- **Cloud Storage**: AWS S3 for video hosting.
- **CDN**: AWS CloudFront for secure and efficient video delivery.

## Installation

### Prerequisites

- Node.js and npm
- React Native CLI
- AWS account for S3 and CloudFront setup

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/TechisHeaven/zenix.git
   cd zenix
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file and configure keys for AWS, database, and JWT.
4. Run the app:
   ```bash
   npx react-native run-android # For Android
   npx react-native run-ios     # For iOS
   ```

### For Server

1. Go to Directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start Server:
   ```bash
   pnpm run dev
   ```

## Usage

1. Register or log in to the app.
2. Upload videos with titles, descriptions, and tags.
3. Explore personalized recommendations on your feed.
4. Stream videos securely without the option to download.
5. Interact with content through likes and comments.

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push to the branch.
4. Create a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For questions or support, please contact:

- **Email**: support@zenix.com
- **GitHub Issues**: [Zenix Issues](https://github.com/yourusername/zenix/issues)
