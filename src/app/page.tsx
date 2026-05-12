import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect automatically to the main Vibra Algarb Kiosk page
  // This ensures the Vercel link immediately shows the check-in platform.
  redirect('/kiosk/vibra-algarb');
}
