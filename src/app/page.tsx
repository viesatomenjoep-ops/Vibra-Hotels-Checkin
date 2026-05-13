import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect automatically to the login page of the SaaS platform
  redirect('/login');
}
