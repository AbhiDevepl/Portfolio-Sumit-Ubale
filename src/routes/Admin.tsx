import { useCallback, useEffect, useState } from 'react'
import { Head } from 'vite-react-ssg'
import { AdminLogin } from '../components/admin/AdminLogin'
import { AdminPanel } from '../components/admin/AdminPanel'
import type { B2File } from '../lib/b2'
import { listMedia, SessionError } from '../lib/b2'

import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/admin.css'

type State =
  | { status: 'checking' }
  | { status: 'out' }
  | { status: 'in', files: B2File[] }

/**
 * The admin panel lives outside the site Layout: it needs no nav, footer,
 * smooth scrolling or gallery data, and keeping it separate means it cannot
 * regress the public routes.
 *
 * There is no client-side "am I logged in" flag to read — the session cookie
 * is HttpOnly. Instead the route asks the server for the file list; a 401
 * means show the login form, and a success doubles as the panel's initial data.
 */
export function Admin() {
  const [state, setState] = useState<State>({ status: 'checking' })

  const probe = useCallback(async () => {
    try {
      setState({ status: 'in', files: await listMedia() })
    }
    catch (cause) {
      if (cause instanceof SessionError) {
        setState({ status: 'out' })
        return
      }
      // A B2 or network failure is not an auth failure: let the panel open and
      // report it, so the admin can retry instead of retyping the password.
      setState({ status: 'in', files: [] })
    }
  }, [])

  useEffect(() => {
    void probe()
  }, [probe])

  return (
    <div className="admin-page">
      <Head>
        <title>Admin — Sumit Ubale Photography</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      {state.status === 'checking' && <p className="admin-empty">Loading…</p>}

      {state.status === 'out' && <AdminLogin onSignedIn={() => void probe()} />}

      {state.status === 'in' && (
        <AdminPanel
          initialFiles={state.files}
          onSignedOut={() => setState({ status: 'out' })}
        />
      )}
    </div>
  )
}

export const Component = Admin
export default Admin
