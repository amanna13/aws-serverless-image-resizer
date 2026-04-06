# Serverless Image Processor Frontend

Frontend for uploading an image, generating processed variants, storing them in AWS S3, and downloading outputs.

## Tech Stack

- React
- Vite
- Tailwind CSS
- AWS SDK for JavaScript v3

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create or update `.env` in the frontend folder:

```env
VITE_AWS_REGION=your-region
VITE_S3_BUCKET=your-bucket-name
VITE_AWS_ACCESS_KEY=your-access-key
VITE_AWS_SECRET_KEY=your-secret-key
```

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Image Placeholders

Add your screenshots to `docs/images/` and update the file names if needed.

### 1. Website UI

![Website UI Placeholder](docs/images/website-ui-placeholder.png)

### 2. Input Image (Before Processing)

![Input Placeholder](docs/images/input-image-placeholder.png)

### 3. Output Images (After Processing)

![Output Placeholder](docs/images/output-images-placeholder.png)

### 4. AWS S3 Bucket View

![S3 Placeholder](docs/images/aws-s3-placeholder.png)

## Suggested Screenshot Names

- website-ui-placeholder.png
- input-image-placeholder.png
- output-images-placeholder.png
- aws-s3-placeholder.png

## Notes

- Keep real AWS credentials out of public repositories.
- If browser metadata requests are blocked, verify S3 CORS settings.
