"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, type CourseData } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Loader,
  Search,
  Sparkles,
  Video,
  Globe,
  FileText,
  Terminal,
  ArrowRight,
  X,
  Send,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";

export default function CourseGrid() {
  const { getToken } = useAppAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateTopic, setGenerateTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  
  // Chat in course detail state
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"roadmap" | "videos" | "search" | "tutor">("roadmap");

  const fetchCourses = async () => {
    try {
      const token = await getToken();
      const res = await api.getCourses(0, 50, undefined, token ?? undefined);
      setCourses(res.courses);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [getToken]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateTopic.trim()) return;

    setGenerating(true);
    try {
      const token = await getToken();
      const newCourse = await api.generateCourse(generateTopic, token ?? undefined);
      setGenerateTopic("");
      await fetchCourses();
      // Auto open generated path
      setSelectedCourse(newCourse);
      setActiveTab("roadmap");
      setChatHistory([
        {
          role: "assistant",
          content: `Welcome to your AI learning path for **${newCourse.name}**. I can answer any questions you have about this topic. What would you like to know?`
        }
      ]);
    } catch (error) {
      alert("Failed to generate course. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedCourse) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const token = await getToken();
      // Send chat context with Course topic
      const res = await api.chat(
        userMsg,
        `Course context: ${selectedCourse.name} (${selectedCourse.description})`,
        chatHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
        token ?? undefined
      );
      setChatHistory((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had an error processing that question. Please try again." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const openCourseDetail = (course: CourseData) => {
    setSelectedCourse(course);
    setActiveTab("roadmap");
    setChatHistory([
      {
        role: "assistant",
        content: `Welcome to **${course.name}** study room. Feel free to ask me any questions about concepts covered here!`
      }
    ]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dynamic AI Generator Panel */}
      <Card className="p-6 border-primary/20 bg-primary/5 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 -mr-10 -mt-10 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Roadmap Generator
            </div>
            <h2 className="text-xl font-bold">Auto-curate any IT Topic</h2>
            <p className="text-sm text-muted max-w-xl">
              Type any technology, framework or CS concept. Our AI will instantaneously build a study roadmap compiling Google, YouTube, and Drive resources.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="w-full md:w-auto flex flex-1 max-w-md gap-2">
            <input
              type="text"
              value={generateTopic}
              onChange={(e) => setGenerateTopic(e.target.value)}
              placeholder="e.g. Docker Containers, React Native, SQL Joins..."
              disabled={generating}
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-border bg-background/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit" disabled={generating || !generateTopic.trim()} className="gap-1.5 flex-shrink-0">
              {generating ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" /> Curating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Synthesize
                </>
              )}
            </Button>
          </form>
        </div>
      </Card>

      {/* Courses List */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" /> Active Learning Roadmaps
        </h3>
        
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-border rounded-2xl bg-card/20">
            <BookOpen className="h-10 w-10 text-muted mb-3" />
            <p className="text-sm text-muted">No roadmaps synthesized yet. Use the generator above to start!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card hover className="overflow-hidden p-5 flex flex-col justify-between h-64 border-border/40 bg-card/40">
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {course.category || "IT"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mt-2 line-clamp-1">{course.name}</h3>
                    <p className="text-xs text-muted mt-2 line-clamp-3 leading-relaxed">{course.description}</p>
                  </div>
                  
                  <div className="border-t border-border/30 pt-3 mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Bookmark className="h-3 w-3" /> {course.resources?.length ?? 0} AI resources
                    </span>
                    <button
                      onClick={() => openCourseDetail(course)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-foreground hover:bg-primary/20 bg-primary/10 px-3 py-1.5 rounded-lg transition"
                    >
                      Study Path <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Immersive Study Room Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl h-[85vh] bg-card border border-border/80 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
            >
              {/* Header Close button */}
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-muted hover:bg-muted-foreground/20 text-muted-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Side: Course Info & Resources */}
              <div className="flex-1 flex flex-col h-full border-r border-border/40 overflow-hidden">
                <div className="p-6 border-b border-border/30 bg-muted/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {selectedCourse.category || "IT"}
                  </span>
                  <h2 className="text-xl font-bold mt-2">{selectedCourse.name}</h2>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{selectedCourse.description}</p>
                </div>

                {/* Tabs selection */}
                <div className="flex border-b border-border/30 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab("roadmap")}
                    className={`flex-1 py-3 text-center border-b-2 transition-all ${
                      activeTab === "roadmap" ? "border-primary text-primary font-bold bg-primary/5" : "border-transparent text-muted hover:bg-muted/10"
                    }`}
                  >
                    📚 Learning Path
                  </button>
                  <button
                    onClick={() => setActiveTab("videos")}
                    className={`flex-1 py-3 text-center border-b-2 transition-all ${
                      activeTab === "videos" ? "border-primary text-primary font-bold bg-primary/5" : "border-transparent text-muted hover:bg-muted/10"
                    }`}
                  >
                    🎥 Video Lessons
                  </button>
                  <button
                    onClick={() => setActiveTab("search")}
                    className={`flex-1 py-3 text-center border-b-2 transition-all ${
                      activeTab === "search" ? "border-primary text-primary font-bold bg-primary/5" : "border-transparent text-muted hover:bg-muted/10"
                    }`}
                  >
                    🌐 Google Docs & Search
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {activeTab === "roadmap" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" /> AI-Curated Learning Path
                      </h4>
                      <div className="relative border-l border-border/60 ml-3 pl-5 space-y-5 py-2">
                        {selectedCourse.resources
                          ?.filter((r) => r.type === "documentation" || r.type === "scholar")
                          .map((res, index) => (
                            <div key={index} className="relative">
                              <span className="absolute -left-[27px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-white">
                                {index + 1}
                              </span>
                              <h5 className="font-semibold text-sm">{res.title}</h5>
                              <p className="text-xs text-muted mt-0.5">Focus on core fundamentals and documentation review.</p>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-primary mt-2 font-medium hover:underline"
                              >
                                Open Resource <Globe className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "videos" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Video className="h-4 w-4 text-red-500" /> YouTube Learning Resources
                      </h4>
                      <div className="grid gap-3">
                        {selectedCourse.resources
                          ?.filter((r) => r.type === "youtube")
                          .map((res, index) => (
                            <a
                              key={index}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 transition flex items-center gap-3.5"
                            >
                              <div className="rounded-lg bg-red-500/10 p-2">
                                <Video className="h-5 w-5 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs text-foreground line-clamp-1">{res.title}</p>
                                <p className="text-[10px] text-muted mt-0.5">Click to view course videos on YouTube</p>
                              </div>
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "search" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Globe className="h-4 w-4 text-blue-500" /> Google Search & Docs Integration
                      </h4>
                      <div className="grid gap-3">
                        {selectedCourse.resources
                          ?.filter((r) => r.type === "classroom" || r.type === "scholar")
                          .map((res, index) => (
                            <a
                              key={index}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-3.5 rounded-xl border border-border/40 bg-muted/10 hover:bg-muted/30 transition flex items-center gap-3.5"
                            >
                              <div className="rounded-lg bg-blue-500/10 p-2">
                                {res.title.toLowerCase().includes("docs") ? (
                                  <FileText className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <Globe className="h-5 w-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs text-foreground line-clamp-1">{res.title}</p>
                                <p className="text-[10px] text-muted mt-0.5">Launch search-based curation workspace</p>
                              </div>
                            </a>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Interactive AI Tutor Chat room */}
              <div className="w-full md:w-80 h-full flex flex-col bg-muted/20 overflow-hidden">
                <div className="p-4 border-b border-border/30 flex items-center gap-2">
                  <MessageSquare className="h-4.5 w-4.5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">AI Study Assistant</span>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "ml-auto bg-primary text-white"
                          : "bg-muted border border-border/40 text-foreground"
                      }`}
                    >
                      <span className="font-bold text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
                        {msg.role === "user" ? "You" : "AI Tutor"}
                      </span>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted ml-1">
                      <Loader className="h-3 w-3 animate-spin text-primary" /> Thinking...
                    </div>
                  )}
                </div>

                {/* Input field */}
                <form onSubmit={handleSendChatMessage} className="p-3 border-t border-border/30 bg-background flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about this concept..."
                    disabled={chatLoading}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-muted/20 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatMessage.trim()}
                    className="p-2 rounded-lg bg-primary text-white hover:bg-primary-foreground/90 transition disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
