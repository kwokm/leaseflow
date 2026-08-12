import { redirect } from "next/navigation";

// Screening reports were folded into the application packet — keep old links working.
export default async function ApplicantReportRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/applications/${id}`);
}
