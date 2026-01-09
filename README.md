# PDF Embedder

A secure Next.js application for uploading, managing, and embedding PDF documents with comprehensive admin controls.

## Features

- **Secure PDF Upload**: Upload PDF documents with proper validation and security
- **Admin Dashboard**: Comprehensive admin panel for managing PDFs and settings
- **Embed Support**: Generate embeddable iframe codes for PDFs
- **User Management**: Role-based access control with admin and user roles
- **Public Gallery**: Display publicly available PDFs
- **File Security**: Secure file storage with access controls
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Rendering**: PDF.js
- **File Upload**: React Dropzone
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pdf-embedder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and fill in your Supabase credentials and other configuration values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   a. Go to your Supabase project dashboard
   
   b. Navigate to the SQL editor
   
   c. Copy and paste the contents of `database/schema.sql`
   
   d. Execute the SQL script to create tables, indexes, and policies

5. **Set up Supabase Storage**
   
   a. Go to Storage in your Supabase dashboard
   
   b. Create a new bucket named `pdfs`
   
   c. Configure the bucket policies as needed

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
pdf-embedder/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   ├── display/           # Public PDF gallery
│   ├── embed/             # Embeddable PDF viewer
│   ├── login/             # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── database/             # Database schema and migrations
│   └── schema.sql        # Database schema
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── supabase-server.ts # Server-side Supabase client
│   └── utils.ts          # General utilities
├── types/                # TypeScript type definitions
│   └── index.ts          # Main type definitions
├── public/               # Static assets
├── middleware.ts         # Next.js middleware
├── next.config.js        # Next.js configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## Database Schema

The application uses three main tables:

### Users
- User authentication and profile information
- Role-based permissions (admin/user)
- Activity tracking

### PDFs
- PDF file metadata and storage information
- Public/private visibility settings
- View and download tracking
- Embed code generation

### Settings
- Application configuration
- Public/private settings
- Admin-configurable options

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT token verification | Yes |
| `NEXT_PUBLIC_APP_URL` | Application base URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |
| `MAX_FILE_SIZE` | Maximum file size in bytes | No |
| `ALLOWED_FILE_TYPES` | Comma-separated file extensions | No |

## Key Features

### Iframe Embedding
The `/embed` route is specially configured to allow iframe embedding:
- No X-Frame-Options restrictions
- Optimized for embedding in external websites
- Secure content delivery

### Security
- Row Level Security (RLS) enabled on all tables
- Authentication required for admin routes
- File upload validation and size limits
- XSS and CSRF protection

### Admin Features
- Upload and manage PDF files
- User management and role assignment
- Application settings configuration
- Analytics and usage tracking

## API Routes

The following API routes will be implemented:

- `POST /api/upload` - Upload PDF files
- `GET /api/pdfs` - List PDFs with filtering
- `GET /api/pdfs/[id]` - Get specific PDF details
- `PUT /api/pdfs/[id]` - Update PDF metadata
- `DELETE /api/pdfs/[id]` - Delete PDF
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings

## Development

### Adding New Components
We use shadcn/ui for the component library. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

### Database Changes
1. Update the schema in `database/schema.sql`
2. Run the updated SQL in Supabase
3. Update TypeScript types in `types/index.ts`

### Styling
- Use Tailwind CSS classes for styling
- Follow the shadcn/ui design system
- Responsive design is built-in

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[MIT License](LICENSE)

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the database schema

## Roadmap

### Phase 2 (Future Development)
- [ ] Advanced PDF annotation support
- [ ] Bulk upload functionality
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] API key management
- [ ] White-label customization
- [ ] Advanced user permissions
- [ ] PDF watermarking
- [ ] Search functionality
- [ ] Export capabilities

---

**Note**: This is Phase 1 of the PDF Embedder project. The foundation is now complete and ready for development of specific features and functionality.