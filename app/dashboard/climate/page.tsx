import { redirect } from 'next/navigation';

export default function DashboardClimateRedirect() {
  redirect('/dashboard/rainfall');
}
