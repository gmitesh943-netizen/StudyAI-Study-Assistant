import DashboardShell from "@/components/dashboard/DashboardShell";
import PDFUploader from "@/components/ai/PDFUploader";

export default function PDFPage() {
  return (
    <DashboardShell title="PDF Tools" subtitle="Upload documents for AI summaries and practice questions.">
      <PDFUploader />
    </DashboardShell>
  );
}
