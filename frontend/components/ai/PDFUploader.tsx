"use client";

import { useCallback, useState } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import {
  FileText,
  Loader2,
  Upload,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Sparkles,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

type SummaryResult = {
  summary: string;
  key_points: string[];
  questions: string[];
};

/** Extract all human-readable text from a PDF using pdf.js */
async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamically import to keep bundle lean (runs only in browser)
  const pdfjsLib = await import("pdfjs-dist");

  // Use locally hosted worker file (copied to /public during setup)
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n");
}

export default function PDFUploader() {
  const { getToken, isSignedIn } = useAppAuth();
  const { addToast } = useToast();
  const [pasteText, setPasteText] = useState("");
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const summarize = useCallback(
    async (content: string, label: string) => {
      if (!content.trim()) return;
      if (!isSignedIn) {
        addToast("Please log in before summarizing a document", "error");
        return;
      }

      setLoading(true);
      setResult(null);
      try {
        const token = await getToken();
        const res = await api.summarizePDF(content.slice(0, 12000), token ?? undefined);
        setResult(res);
        addToast(`${label} summarized successfully! ✅`, "success");
      } catch (err) {
        addToast(
          err instanceof Error ? err.message : "Unable to summarize — please try again",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [addToast, getToken, isSignedIn]
  );

  const handleFile = useCallback(
    async (file: File) => {
      // Text file — read directly
      if (file.type === "text/plain") {
        setExtracting(true);
        setUploadedFileName(file.name);
        const content = await file.text();
        setCharCount(content.length);
        setExtracting(false);
        await summarize(content, file.name);
        return;
      }

      // PDF — use pdfjs for real text extraction
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setExtracting(true);
        setUploadedFileName(file.name);
        setResult(null);
        try {
          const extracted = await extractTextFromPDF(file);
          if (!extracted.trim() || extracted.length < 50) {
            addToast(
              "Could not extract readable text from this PDF. It may be scanned/image-based. Please paste the text manually below.",
              "error"
            );
            setUploadedFileName(null);
            setExtracting(false);
            return;
          }
          setCharCount(extracted.length);
          setExtracting(false);
          await summarize(extracted, file.name);
        } catch (err) {
          addToast(
            "Failed to read PDF. Please paste the text below instead.",
            "error"
          );
          setUploadedFileName(null);
          setExtracting(false);
        }
        return;
      }

      addToast("Please upload a PDF or .txt file", "error");
    },
    [addToast, summarize]
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearResult = () => {
    setResult(null);
    setUploadedFileName(null);
    setCharCount(0);
    setPasteText("");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Upload Zone */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          dragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/40"
        } rounded-3xl`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center py-14 text-center">
          {extracting ? (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Extracting text from PDF...</p>
              <p className="text-sm text-muted">Reading pages, please wait</p>
            </>
          ) : uploadedFileName && !loading ? (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-foreground mb-1">{uploadedFileName}</p>
              <p className="text-sm text-muted mb-4">
                {charCount.toLocaleString()} characters extracted
              </p>
              <button
                onClick={clearResult}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" /> Upload a different file
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="mb-1 font-semibold text-foreground">Drop your PDF here</p>
              <p className="mb-5 text-sm text-muted">
                Supports PDF and .txt files · Text is extracted accurately
              </p>
              <label className="inline-block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <span className="inline-flex items-center gap-2 rounded-2xl border border-border px-6 py-2.5 text-sm font-semibold transition-all hover:border-primary hover:text-primary hover:bg-primary/5">
                  <Sparkles className="h-4 w-4" /> Browse & Summarize
                </span>
              </label>
            </>
          )}
        </div>
      </Card>

      {/* Manual Paste Area */}
      <Card className="rounded-3xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Or paste document text directly
        </label>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          rows={6}
          placeholder="Paste chapter text, lecture notes, article content, or any study material here..."
          className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground leading-relaxed"
        />
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-muted">
            {pasteText.length > 0 ? `${pasteText.length.toLocaleString()} characters` : ""}
          </span>
          <Button
            onClick={() => summarize(pasteText, "Document")}
            disabled={loading || extracting || !pasteText.trim()}
            className="rounded-2xl px-6 font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Summarizing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Summarize
              </span>
            )}
          </Button>
        </div>
      </Card>

      {/* Loading skeleton while AI works */}
      {loading && (
        <div className="grid gap-6 lg:grid-cols-2 animate-pulse">
          <Card className="rounded-3xl">
            <div className="h-4 w-24 bg-border rounded mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-border/60 rounded" />
              <div className="h-3 w-5/6 bg-border/60 rounded" />
              <div className="h-3 w-4/6 bg-border/60 rounded" />
            </div>
          </Card>
          <Card className="rounded-3xl">
            <div className="h-4 w-24 bg-border rounded mb-4" />
            <div className="space-y-2">
              {[1,2,3,4].map(i => <div key={i} className="h-3 w-full bg-border/60 rounded" />)}
            </div>
          </Card>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-slideUp">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> AI Summary Results
            </h3>
            <button
              onClick={clearResult}
              className="text-xs text-muted hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Summary */}
            <Card className="rounded-3xl border-primary/10 bg-gradient-to-br from-card to-background">
              <div className="mb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">Summary</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{result.summary}</p>
            </Card>

            {/* Key Points */}
            <Card className="rounded-3xl border-primary/10 bg-gradient-to-br from-card to-background">
              <div className="mb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-foreground">Key Points</h3>
              </div>
              <ul className="space-y-3">
                {result.key_points.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-foreground/80 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Practice Questions */}
            <Card className="rounded-3xl lg:col-span-2 border-primary/10 bg-gradient-to-br from-card to-background">
              <div className="mb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-foreground">Practice Questions</h3>
              </div>
              <ol className="space-y-3">
                {result.questions.map((question, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 mt-0.5 font-bold text-primary">
                      Q{i + 1}.
                    </span>
                    <span className="text-foreground/80 leading-relaxed">{question}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
