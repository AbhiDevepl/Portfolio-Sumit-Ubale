import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
          Error 404
        </p>

        <h1 className="mt-4 text-6xl font-bold tracking-tight">
          Page not found
        </h1>

        <p className="mt-4 max-w-md text-gray-500">
          Sorry, the page you are looking for doesn't exist or may have been
          moved.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-80"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}