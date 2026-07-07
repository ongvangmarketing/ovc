"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CheckCircle2, ChevronLeft, ChevronRight, FileText, MapPin, Menu, MessageCircle, MonitorPlay, PlayCircle, Send, UploadCloud, Video, Target, Clock, Pause, Play, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";

type Lesson = any;
type Assignment = any;
type Question = any;
type Enrollment = any;

interface CoursePlayerAppProps {
  enrollment: Enrollment;
  lessons: Lesson[];
  assignments: Assignment[];
  questions: Question[];
  courseId: string;
}

export function CoursePlayerApp({ enrollment, lessons, assignments, questions, courseId }: CoursePlayerAppProps) {
  const [activeLessonId, setActiveLessonId] = useState<string>(lessons[0]?.id || "");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "assignments" | "qna" | "notes">("overview");

  // Feature: Focus Mode & Pomodoro
  const [focusMode, setFocusMode] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    if (!focusMode) setSidebarOpen(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Feature: Time-synced Notes
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [notes, setNotes] = useState<{ id: string; time: number; text: string }[]>([]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    const mockCurrentTime = Math.floor(Math.random() * 300); // In real app, we use YouTube API to get current time
    setNotes([...notes, { id: Date.now().toString(), time: mockCurrentTime, text: newNote }]);
    setNewNote("");
  };

  const formatVideoTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleCompleteLesson = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const completedIds = new Set(enrollment.completions.map((c: any) => c.lessonId));
  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  function embedUrl(url?: string | null) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
  
  const activeEmbed = embedUrl(activeLesson?.videoUrl);

  const activeLessonAssignments = assignments.filter(a => a.lessonId === activeLessonId);

  const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Topbar for Player */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <div className="flex items-center gap-4">
          <Link href="/student/courses" className="flex items-center gap-2 rounded-lg py-2 px-3 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-semibold">Thoát</span>
          </Link>
          <div className="hidden h-6 w-px bg-slate-700 sm:block" />
          <h1 className="truncate text-sm font-semibold text-white sm:text-base">{enrollment.course.title}</h1>
        </div>
        
        {/* Pomodoro Timer Center */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950 rounded-full p-1 pl-3 border border-slate-800">
          <Clock className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-mono font-bold w-12 text-center text-white">{formatTime(timeLeft)}</span>
          <button 
            onClick={() => setTimerRunning(!timerRunning)} 
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 text-sm sm:flex">
            <span className="text-slate-400">Tiến độ:</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${enrollment.progress}%` }} />
              </div>
              <span className="font-bold text-white">{enrollment.progress}%</span>
            </div>
          </div>
          
          <button 
            onClick={toggleFocusMode}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${focusMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Tập trung</span>
          </button>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          
          {/* Content Container (Video or Live Sessions) */}
          {activeLesson?.type === "LIVE" ? (
            <div className="w-full shrink-0 bg-slate-900 border-b border-slate-800 p-6 sm:p-10">
              <div className="mx-auto max-w-4xl">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Video className="h-6 w-6 text-blue-500" />
                  Các buổi học trực tiếp (Schedules)
                </h2>
                <p className="text-slate-400 text-sm mb-8">Bài học này bao gồm {activeLesson.schedules?.length || 0} buổi học.</p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {activeLesson.schedules?.length > 0 ? activeLesson.schedules.map((schedule: any, idx: number) => {
                    const isOnline = schedule.mode?.toLowerCase() === "online";
                    return (
                      <div key={schedule.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${isOnline ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                            Buổi {idx + 1} • {schedule.mode || "Offline"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">{schedule.title || `Buổi học ${idx + 1}`}</h3>
                        
                        <div className="space-y-2 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span>{schedule.startsAt ? dateFormat.format(new Date(schedule.startsAt)) : "Chưa có lịch"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span>{schedule.location || "Đang cập nhật"}</span>
                          </div>
                        </div>

                        {schedule.onlineUrl && (
                          <div className="mt-5 pt-5 border-t border-slate-700">
                            <a href={schedule.onlineUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
                              <MonitorPlay className="h-4 w-4" /> Vào phòng học Online
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="col-span-2 rounded-2xl border border-dashed border-slate-700 p-8 text-center">
                      <Calendar className="mx-auto h-8 w-8 text-slate-600 mb-3" />
                      <p className="text-slate-400">Giảng viên chưa lên lịch cho bài học này.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full shrink-0 bg-black group">
              {activeEmbed ? (
                <iframe ref={iframeRef} className="h-full w-full" src={activeEmbed} title={activeLesson?.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-slate-500">
                  <PlayCircle className="mb-4 h-12 w-12 opacity-50" />
                  <p>Không có video cho bài học này</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive Content Tabs */}
          <div className="flex-1 bg-white text-slate-900">
            <div className="flex items-center border-b border-slate-200 px-6 pt-2">
              <button onClick={() => setActiveTab("overview")} className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>Tổng quan</button>
              <button onClick={() => setActiveTab("assignments")} className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${activeTab === "assignments" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>Bài tập {activeLessonAssignments.length > 0 && <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{activeLessonAssignments.length}</span>}</button>
              <button onClick={() => setActiveTab("qna")} className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${activeTab === "qna" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>Hỏi đáp</button>
              <button onClick={() => setActiveTab("notes")} className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${activeTab === "notes" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>Ghi chú</button>
            </div>

            <div className="p-6 md:p-8 max-w-4xl">
              {activeTab === "overview" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h2 className="text-2xl font-bold text-slate-900">{activeLesson?.title}</h2>
                  <p className="mt-4 text-slate-600 leading-relaxed">{activeLesson?.description || "Không có mô tả cho bài học này."}</p>
                  
                  <div className="mt-8 border-t border-slate-200 pt-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">GV</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{enrollment.course.instructor.name || "Giảng viên"}</div>
                        <div className="text-xs text-slate-500">Người hướng dẫn</div>
                      </div>
                    </div>
                    
                    {/* Next/Prev Controls */}
                    <div className="flex gap-2">
                      <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={handleCompleteLesson} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        Hoàn thành <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeLessonAssignments.length > 0 ? (
                    <div className="space-y-6">
                      {activeLessonAssignments.map((assignment) => {
                        const submission = assignment.submissions?.[0];
                        return (
                          <div key={assignment.id} className="rounded-xl border border-slate-200 p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-bold text-slate-900">{assignment.title}</h3>
                                <p className="mt-1 text-sm text-slate-600">{assignment.description || "Nộp nội dung bài làm hoặc đường dẫn file."}</p>
                              </div>
                              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${submission?.score == null ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {submission?.score == null ? "Chờ chấm" : `${submission.score}/${assignment.maxScore}`}
                              </span>
                            </div>
                            
                            <form className="mt-5 grid gap-3" onSubmit={(e) => e.preventDefault()}>
                              <textarea defaultValue={submission?.content || ""} rows={3} placeholder="Nhập bài làm..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                              <div className="flex gap-3">
                                <input defaultValue={submission?.fileUrl || ""} placeholder="Link nộp bài (Google Drive, Github...)" className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                                  <UploadCloud className="h-4 w-4" /> Nộp
                                </button>
                              </div>
                            </form>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                      <FileText className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm text-slate-500">Không có bài tập nào cho bài học này.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "qna" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-slate-900">Đặt câu hỏi mới</h3>
                    <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                      <input placeholder="Bạn thắc mắc gì ở bài học này?" className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <button className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === "notes" && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 relative">
                        <h3 className="font-semibold text-slate-900 mb-3">Thêm ghi chú</h3>
                        <textarea 
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Ghi chú lại kiến thức quan trọng..." 
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                        />
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded">Tại 02:45 (Tự động lấy mốc video)</span>
                          <button onClick={addNote} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition">
                            <FileText className="h-4 w-4" /> Lưu ghi chú
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-8 space-y-4">
                        <h3 className="font-semibold text-slate-900">Ghi chú của bạn ({notes.length})</h3>
                        {notes.map((note) => (
                          <div key={note.id} className="group rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <button className="shrink-0 mt-0.5 rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200 transition-colors" title="Bấm để tua video đến mốc này">
                                  {formatVideoTime(note.time)}
                                </button>
                                <p className="text-sm text-slate-700 leading-relaxed">{note.text}</p>
                              </div>
                              <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {notes.length === 0 && (
                          <div className="text-center py-8 text-slate-500 text-sm border border-dashed rounded-xl border-slate-200">
                            Chưa có ghi chú nào cho bài học này.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Syllabus Sidebar */}
        <aside className={`${sidebarOpen ? "w-[360px]" : "w-0"} shrink-0 flex flex-col border-l border-slate-800 bg-slate-900 transition-all duration-300 overflow-hidden`}>
          <div className="flex h-14 items-center justify-between border-b border-slate-800 px-5 shrink-0">
            <span className="font-semibold text-white">Nội dung khóa học</span>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {lessons.map((lesson) => {
              const isCompleted = completedIds.has(lesson.id);
              const isActive = lesson.id === activeLessonId;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${isActive ? "bg-slate-800" : "hover:bg-slate-800/50"}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-2 ${isActive ? "border-blue-500" : "border-slate-600"}`} />
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-300"}`}>{lesson.title}</div>
                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
                      {lesson.type === "LIVE" ? (
                        <><Video className="h-3 w-3" /> {lesson.schedules?.length || 0} buổi học</>
                      ) : (
                        <><PlayCircle className="h-3 w-3" /> {lesson.duration || 0} phút</>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

      </div>
    </div>
  );
}
