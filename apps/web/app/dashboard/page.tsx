/**
 * Dashboard Redirect
 *
 * Redirects /dashboard to the actual dashboard route at /(dashboard)
 * This maintains backward compatibility for users accessing /dashboard
 */

import { redirect } from 'next/navigation';

export default function DashboardRedirect() {
  // The actual dashboard is at /(dashboard) which renders at root when authenticated
  // Redirect to home which will show dashboard for authenticated users
  redirect('/');
}
