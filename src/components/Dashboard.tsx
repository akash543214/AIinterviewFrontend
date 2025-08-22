import  { useMemo, useState } from "react";
import { TrendingUp, Users, Clock, Filter, Star, ChevronRight, Calendar, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export type InterviewFeedback = {
  id: string;
  date: string; 
  role: string;
  durationMin: number;
  score: number; 
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  feedback: string; 
};

export type DashboardProps = {
  userName?: string;
  interviews?: InterviewFeedback[];
};

const MOCK_INTERVIEWS: InterviewFeedback[] = [
  {
    id: "INT-001",
    date: "2025-08-18T10:00:00Z",
    role: "Fullstack Engineer",
    durationMin: 7,
    score: 74,
    sentiment: "positive",
    topics: ["React", "Express", "Postgres"],
    feedback:
      "Solid understanding of React state and hooks. Consider deeper coverage of **database indexing** and query optimization. Great communication.",
  },
  {
    id: "INT-002",
    date: "2025-08-19T09:30:00Z",
    role: "Frontend Engineer",
    durationMin: 6,
    score: 68,
    sentiment: "neutral",
    topics: ["Performance", "Virtualization"],
    feedback:
      "Explained list virtualization well. Could expand on **memoization trade-offs** and profiling with React DevTools.",
  },
  {
    id: "INT-003",
    date: "2025-08-20T14:15:00Z",
    role: "Backend Engineer",
    durationMin: 8,
    score: 81,
    sentiment: "positive",
    topics: ["API Design", "GCP", "Queues"],
    feedback:
      "Great API design intuition. Nice mention of **idempotency keys** and retry semantics. Dive deeper into **GCP IAM**.",
  },
  {
    id: "INT-004",
    date: "2025-08-21T13:05:00Z",
    role: "AI Engineer",
    durationMin: 9,
    score: 59,
    sentiment: "negative",
    topics: ["RAG", "Embeddings"],
    feedback:
      "Unclear on **vector store filtering** and chunking strategy. Review evaluation metrics and **latency vs. recall** trade-off.",
  },
  {
    id: "INT-005",
    date: "2025-08-22T08:40:00Z",
    role: "Fullstack Engineer",
    durationMin: 7,
    score: 86,
    sentiment: "positive",
    topics: ["React", "Typescript", "DX"],
    feedback:
      "Excellent end-to-end reasoning. Strong **TypeScript** ergonomics and clean component architecture.",
  },
];

// Small helpers
const sentimentColor: Record<InterviewFeedback["sentiment"], string> = {
  positive: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  negative: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const formatDate = (iso: string) => new Date(iso).toLocaleString();

// Component
export default function InterviewDashboard({  interviews = MOCK_INTERVIEWS }: DashboardProps) {
  const [query, setQuery] = useState("");
  const [sentiment, setSentiment] = useState<string>("all");
  const [role, setRole] = useState<string>("all");

  const roles = useMemo(() => Array.from(new Set(interviews.map((i) => i.role))), [interviews]);

  const filtered = useMemo(() => {
    return interviews.filter((i) => {
      const q = query.trim().toLowerCase();
      const matchesQuery = !q
        || i.role.toLowerCase().includes(q)
        || i.feedback.toLowerCase().includes(q)
        || i.topics.some((t) => t.toLowerCase().includes(q))
        || i.id.toLowerCase().includes(q);
      const matchesSentiment = sentiment === "all" || i.sentiment === sentiment;
      const matchesRole = role === "all" || i.role === role;
      return matchesQuery && matchesSentiment && matchesRole;
    });
  }, [interviews, query, sentiment, role]);

  const totals = useMemo(() => {
    const count = filtered.length;
    const avg = count ? Math.round(filtered.reduce((s, i) => s + i.score, 0) / count) : 0;
    const minutes = filtered.reduce((s, i) => s + i.durationMin, 0);
    return { count, avg, minutes };
  }, [filtered]);

  const trendData = useMemo(() => {
    return [...filtered]
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .map((i) => ({ date: new Date(i.date).toLocaleDateString(), score: i.score }));
  }, [filtered]);

  const sentimentBuckets = useMemo(() => {
    const pos = filtered.filter((i) => i.sentiment === "positive").length;
    const neu = filtered.filter((i) => i.sentiment === "neutral").length;
    const neg = filtered.filter((i) => i.sentiment === "negative").length;
    return [
      { name: "Positive", value: pos },
      { name: "Neutral", value: neu },
      { name: "Negative", value: neg },
    ];
  }, [filtered]);

  return (
    <div className="min-h-screen w-full bg-[#0b0d10] text-white">


      <main className="mx-auto max-w-[1200px] px-4 py-6 space-y-6">
        {/* Filters */}
        <Card className="bg-[#0f1216] border-white/10">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-white/50"/>
                <Input
                  placeholder="Search by role, topic, ID, feedback"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-black/30 border-white/10 text-white"
                />
              </div>
              <Select value={sentiment} onValueChange={setSentiment}>
                <SelectTrigger className="bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1216] border-white/10 text-white">
                  <SelectItem value="all">All sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg:black/30 bg-black/30 border-white/10 text-white">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1216] border-white/10 text-white">
                  <SelectItem value="all">All roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#0f1216] border-white/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-white/60">Total Interviews</div>
                <div className="text-3xl text-white font-semibold mt-1 tabular-nums">{totals.count}</div>
              </div>
              <Users className="h-8 w-8" color="white"/>
            </CardContent>
          </Card>
          <Card className="bg-[#0f1216] border-white/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-white/60">Average Score</div>
                <div className="text-3xl text-white font-semibold mt-1 tabular-nums">{totals.avg}</div>
              </div>
              <Star className="h-8 w-8" color="white"/>
            </CardContent>
          </Card>
          <Card className="bg-[#0f1216] border-white/10">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <div className="text-sm text-white/60">Total Minutes</div>
                <div className="text-3xl text-white font-semibold mt-1 tabular-nums">{totals.minutes}</div>
              </div>
              <Clock className="h-8 w-8" color="white"/>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-[#0f1216] border-white/10 lg:col-span-2">
            <CardContent className="p-5">
              <div className="text-sm text-white/70 mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4"/> Score Trend</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "#0f1216", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <Line type="monotone" dataKey="score" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1216] border-white/10">
            <CardContent className="p-5">
              <div className="text-sm text-white/70 mb-3 flex items-center gap-2"><Filter className="h-4 w-4"/> Sentiment</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sentimentBuckets}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#0f1216", border: "1px solid rgba(255,255,255,0.1)", color: "white" }} />
                    <Bar dataKey="value" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table of interviews */}
        <Card className="bg-[#0f1216] border-white/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-white/60 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Role</th>
                    <th className="py-3 px-4 text-left">Topics</th>
                    <th className="py-3 px-4 text-left">Score</th>
                    <th className="py-3 px-4 text-left">Sentiment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-white/90">{i.id}</td>
                      <td className="py-3 px-4 text-white/80">{formatDate(i.date)}</td>
                      <td className="py-3 px-4 text-white/80">{i.role}</td>
                      <td className="py-3 px-4 text-white/80">
                        <div className="flex flex-wrap gap-1">
                          {i.topics.map((t) => (
                            <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70">{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/80 tabular-nums">{i.score}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-xs border ${sentimentColor[i.sentiment]}`}>{i.sentiment}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-sky-700/90 hover:bg-sky-600">
                              View Feedback <ChevronRight className="h-4 w-4 ml-1"/>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0f1216] border-white/10 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">Feedback • {i.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 text-white/80">
                              <div className="flex items-center gap-2 text-sm text-white/60">
                                <Calendar className="h-4 w-4"/> {formatDate(i.date)}
                              </div>
                              <div className="text-sm"><span className="text-white/60">Role:</span> {i.role}</div>
                              <div className="text-sm"><span className="text-white/60">Score:</span> {i.score}</div>
                              <div className="text-sm"><span className="text-white/60">Duration:</span> {i.durationMin} min</div>
                              <div className="text-sm"><span className="text-white/60">Topics:</span> {i.topics.join(", ")}</div>
                              <div className="pt-3 border-t border-white/10 whitespace-pre-wrap leading-relaxed">{i.feedback}</div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <div className="pb-10"/>
    </div>
  );
}
