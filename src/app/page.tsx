import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect automatically to the Pitch Editor as the landing page
  redirect('/pitch');
}
