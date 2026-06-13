"use client";

import { useState } from "react";
import { useAppAuth } from "@/hooks/useAppAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const DEMO_NOTES = `# Study Notes: Introduction to Machine Learning

## Key Concepts

### Supervised Learning
- Uses labeled training data
- Examples: classification, regression
- Common algorithms: linear regression, decision trees, SVM

### Unsupervised Learning
- Finds patterns in unlabeled data
- Examples: clustering, dimensionality reduction
- Common algorithms: K-means, PCA

### Neural Networks
- Inspired by biological neurons
- Layers: input → hidden → output
- Backpropagation for training

## Important Formulas
- **MSE Loss**: (1/n) Σ(y - ŷ)²
- **Accuracy**: (TP + TN) / (TP + TN + FP + FN)

## Study Tips
1. Practice implementing algorithms from scratch
2. Work through real datasets on Kaggle
3. Understand bias-variance tradeoff
`;

export default function NotesPage() {
  const { getToken } = useAppAuth();
  const { addToast } = useToast();
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await api.generateNotes(topic, subject, token ?? undefined);
      setNotes(res.content);
      addToast("Notes generated!", "success");
    } catch {
      setNotes(DEMO_NOTES);
      addToast("Using demo notes — API unavailable", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Note Generator" subtitle="Transform any topic into structured study notes.">
      <div className="space-y-6">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Neural Networks"
                className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <Button onClick={generate} disabled={loading || !topic.trim()}>
            {loading ? "Generating..." : "Generate Notes"}
          </Button>
        </Card>
        {notes && (
          <Card>
            <div className="markdown-body prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
