"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useAppAuth } from "@/hooks/useAppAuth";
import { AlertCircle, Plus, Trash2, Loader } from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  resources: Resource[];
}

export default function CreateCourseForm({ onSuccess }: { onSuccess: () => void }) {
  const { getToken } = useAppAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    resources: [],
  });
  const [newResource, setNewResource] = useState<Resource>({
    title: "",
    url: "",
    type: "youtube",
  });

  const handleInputChange = (field: keyof Omit<FormData, "resources">, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleResourceChange = (field: keyof Resource, value: string) => {
    setNewResource((prev) => ({ ...prev, [field]: value }));
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setForm((prev) => ({
        ...prev,
        resources: [...prev.resources, { ...newResource }],
      }));
      setNewResource({ title: "", url: "", type: "youtube" });
    }
  };

  const removeResource = (index: number) => {
    setForm((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Course name is required");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      await api.createCourse(form, token ?? undefined);
      alert("Course created successfully!");
      setForm({ name: "", description: "", category: "", resources: [] });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Course</h2>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Course Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Python Fundamentals"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="What is this course about?"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            placeholder="e.g., IT - Programming, IT - Networking, IT - Database"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Resources */}
        <div>
          <label className="block text-sm font-medium mb-3">Learning Resources</label>

          {/* Add Resource Form */}
          <div className="mb-4 p-4 rounded-lg bg-muted/30 space-y-3">
            <input
              type="text"
              value={newResource.title}
              onChange={(e) => handleResourceChange("title", e.target.value)}
              placeholder="Resource title"
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="url"
              value={newResource.url}
              onChange={(e) => handleResourceChange("url", e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newResource.type}
              onChange={(e) => handleResourceChange("type", e.target.value)}
              className="w-full px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="youtube">YouTube</option>
              <option value="documentation">Documentation</option>
              <option value="scholar">Scholar/Research</option>
              <option value="classroom">Google Classroom</option>
            </select>
            <Button
              type="button"
              onClick={addResource}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" /> Add Resource
            </Button>
          </div>

          {/* Resources List */}
          {form.resources.length > 0 && (
            <div className="space-y-2">
              {form.resources.map((resource, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-lg bg-muted/20 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{resource.title}</p>
                    <p className="text-xs text-muted">{resource.type}</p>
                    <p className="text-xs text-muted break-all">{resource.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResource(index)}
                    className="ml-2 p-2 hover:bg-red-500/10 rounded text-red-500 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Creating Course...
            </>
          ) : (
            "Create Course"
          )}
        </Button>
      </form>
    </Card>
  );
}
