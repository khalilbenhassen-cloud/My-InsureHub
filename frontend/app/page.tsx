import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect root to dashboard since it's the main hub
  redirect('/dashboard');
}