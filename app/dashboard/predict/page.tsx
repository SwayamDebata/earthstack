import { redirect } from 'next/navigation';

export default function DashboardPredictRedirect() {
  redirect('/dashboard/forecast');
}
