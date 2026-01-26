# LogToStory

Transform your raw logs into share-ready technical posts powered by AI.

## About

LogToStory는 개발 과정에서 작성한 로그를 기술 블로그 포스트로 변환해주는 풀스택 웹 애플리케이션입니다. Next.js와 TypeScript로 구축되었으며, LLM을 활용하여 자동으로 구조화된 콘텐츠를 생성합니다.

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, Husky
- **Syntax Highlighting**: Shiki
- **Validation**: Zod
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 9+

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd logtostory
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-...
```

4. Run the development server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Project Structure

```
logtostory/
├── app/              # Next.js App Router pages and layouts
│   ├── api/         # API routes
│   └── ...
├── components/      # Reusable UI components
├── lib/            # Utility functions and helpers
├── types/          # TypeScript type definitions
├── public/         # Static files
└── ...
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for LLM functionality |
| `RATE_LIMIT_REDIS_URL` | No | Redis URL for rate limiting |
| `NODE_ENV` | No | Environment (development/production/test) |

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

TBD
