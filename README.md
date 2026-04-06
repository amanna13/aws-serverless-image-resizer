# AWS SERVERLESS IMAGE RESIZER 

Upload an image, generating processed variants, storing them in AWS S3, and downloading outputs.

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

<img width="800" height="814" alt="image" src="https://github.com/user-attachments/assets/fc3d8276-a936-444f-8d1e-95641fa56e23" />

<img width="800" height="427" alt="image" src="https://github.com/user-attachments/assets/5fd85c5c-7e9b-4ec2-9e84-10414e48f5fb" />

<img width="800" height="784" alt="image" src="https://github.com/user-attachments/assets/d6a9871a-d241-4bee-89e8-20e34c6734b8" />


### 2. Input Image (Before Processing)

<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/cd942405-822f-4301-a94f-61ee8c58e219" />

### 3. Output Images (After Processing)

<img width="1919" height="861" alt="image" src="https://github.com/user-attachments/assets/fd24ec48-fe93-4e75-8f75-bd30620ac91b" />

### 4. AWS S3 Bucket View

<img width="1914" height="859" alt="image" src="https://github.com/user-attachments/assets/897710c1-33d9-49ac-bcf9-0e3dc21752b7" />

## Notes

- All AWS credentials are hidden out of public repositories.
- Not deployed due to security reasons.
