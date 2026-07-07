import Link from "next/link";
import { CalendarClock, CheckCircle2, CircleAlert, Columns3, GraduationCap, GripVertical, LayoutGrid, ListTodo, MoreHorizontal, Radio, Table2, UsersRound } from "lucide-react";

import { createCourseLesson, createCourseSection, createLessonSchedule } from "@/app/actions/training";
import type { TrainingFormOptions } from "@/lib/training";

type CourseWithLearning = NonNullable<Awaited<ReturnType<typeof import("@/lib/training").getTrainingCourseDetail>>>;
type LessonScheduleView = {
  id: string;
  title: string;
  mode: string;
  startsAt: Date | null;
  endsAt: Date | null;
  location: string | null;
  onlineUrl: string | null;
  fieldAddress: string | null;
  class: { id: string; name: string } | null;
  instructor: { id: string; name: string; email: string } | null;
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50";
const labelClass = "space-y-1.5 text-sm font-semibold text-slate-600";

const modeLabel: Record<string, string> = {
  OFFLINE: "Offline",
  ONLINE: "Online",
  FIELD: "Thực tế",
  HYBRID: "Kết hợp",
};

function formatDateTime(value: Date | null) {
  if (!value) return "Chưa đặt lịch";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(value);
}

function scheduleTime(value: Date | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  return new Date(value).getTime();
}

function dateKey(value: Date | null) {
  if (!value) return "Chưa đặt ngày";
  return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }).format(value);
}

export function CourseElearning({ course, options }: { course: CourseWithLearning; options: TrainingFormOptions }) {
  const sectionAction = createCourseSection.bind(null, course.id);
  const lessonAction = createCourseLesson.bind(null, course.id);
  const lessons = course.sections.flatMap((section) => section.lessons);
  const schedules = lessons.flatMap((lesson) => (lesson.schedules as LessonScheduleView[]).map((schedule) => ({ ...schedule, lessonTitle: lesson.title })));
  const publishedLessons = lessons.filter((lesson) => lesson.isPublished).length;
  const upcomingSchedules = schedules
    .filter((schedule) => !schedule.startsAt || scheduleTime(schedule.startsAt) >= Date.now() - 60 * 60 * 1000)
    .sort((a, b) => scheduleTime(a.startsAt) - scheduleTime(b.startsAt))
    .slice(0, 5);
  const liveSchedules = schedules.filter((schedule) => ["ONLINE", "HYBRID"].includes(schedule.mode)).length;
  const onsiteSchedules = schedules.filter((schedule) => ["OFFLINE", "FIELD", "HYBRID"].includes(schedule.mode)).length;
  const courseClasses = options.classes.filter((item) => item.courseId === course.id);
  const operationCards = [
    { label: "Học phần", value: course.sections.length, note: "Cấu trúc chương trình", icon: GraduationCap },
    { label: "Bài giảng", value: lessons.length, note: `${publishedLessons} đã xuất bản`, icon: CheckCircle2 },
    { label: "Buổi học", value: schedules.length, note: `${liveSchedules} online/kết hợp`, icon: CalendarClock },
    { label: "Lớp áp dụng", value: courseClasses.length, note: `${onsiteSchedules} offline/thực tế`, icon: UsersRound },
  ];
  const needsSetup = [
    !course.sections.length ? "Tạo học phần đầu tiên" : null,
    course.sections.length && !lessons.length ? "Thêm bài giảng cho học phần" : null,
    lessons.length && !schedules.length ? "Gắn lịch học cho từng bài giảng" : null,
    schedules.length && !courseClasses.length ? "Tạo lớp học để gắn lịch vào lớp cụ thể" : null,
  ].filter(Boolean);
  const unscheduledLessons = lessons.filter((lesson) => !(lesson.schedules as LessonScheduleView[]).length);
  const scheduledLessons = lessons.filter((lesson) => (lesson.schedules as LessonScheduleView[]).length);
  const onlineLessons = lessons.filter((lesson) => (lesson.schedules as LessonScheduleView[]).some((schedule) => ["ONLINE", "HYBRID"].includes(schedule.mode)));
  const boardColumns = [
    { title: "Chưa xếp lịch", note: "Cần đặt buổi học", items: unscheduledLessons, tone: "border-slate-200 bg-slate-50" },
    { title: "Đã có lịch", note: "Sẵn sàng vận hành", items: scheduledLessons, tone: "border-blue-100 bg-blue-50/40" },
    { title: "Online/Hybrid", note: "Có link hoặc kết hợp", items: onlineLessons, tone: "border-emerald-100 bg-emerald-50/40" },
  ];
  const schedulesByDay = upcomingSchedules.reduce<Record<string, typeof upcomingSchedules>>((acc, schedule) => {
    const key = dateKey(schedule.startsAt);
    acc[key] = acc[key] || [];
    acc[key].push(schedule);
    return acc;
  }, {});

  return (
    <section className="quote-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">E-learning & lịch học</h2>
          <p className="mt-1 text-sm text-slate-500">Một bài giảng có thể có nhiều buổi học: offline, online, thực tế hoặc kết hợp.</p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">{course.sections.length} học phần</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {operationCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <strong className="mt-1 block text-2xl font-bold text-slate-950">{card.value}</strong>
                  <span className="mt-1 block text-xs font-semibold text-emerald-600">{card.note}</span>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-950">Course workspace</h3>
            <p className="mt-1 text-sm text-slate-500">Làm việc theo board, sheet, timeline và lịch thay vì chỉ nhập liệu.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <a href="#course-board" className="inline-flex items-center gap-1 rounded-xl bg-orange-50 px-3 py-2 text-orange-600"><Columns3 className="h-4 w-4" />Board</a>
            <a href="#course-sheet" className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-slate-600 hover:bg-slate-100"><Table2 className="h-4 w-4" />Sheet</a>
            <a href="#course-timeline" className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-slate-600 hover:bg-slate-100"><ListTodo className="h-4 w-4" />Timeline</a>
            <a href="#course-calendar" className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-slate-600 hover:bg-slate-100"><CalendarClock className="h-4 w-4" />Calendar</a>
          </div>
        </div>

        <div id="course-board" className="mt-4 grid gap-3 xl:grid-cols-3">
          {boardColumns.map((column) => (
            <section key={column.title} className={`rounded-xl border p-3 ${column.tone}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-950">{column.title}</h4>
                  <p className="text-xs font-semibold text-slate-500">{column.items.length} bài · {column.note}</p>
                </div>
                <LayoutGrid className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-2">
                {column.items.map((lesson) => (
                  <a
                    key={`${column.title}-${lesson.id}`}
                    href={`#lesson-${lesson.id}`}
                    draggable
                    className="group block rounded-xl border border-slate-100 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex min-w-0 items-start gap-2">
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        <span className="min-w-0">
                          <strong className="line-clamp-1 text-slate-950">{lesson.title}</strong>
                          <small className="mt-1 block text-slate-500">{lesson.type} · {(lesson.schedules as LessonScheduleView[]).length} buổi</small>
                        </span>
                      </span>
                      <MoreHorizontal className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-500" />
                    </div>
                  </a>
                ))}
                {!column.items.length ? <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-4 text-sm text-slate-500">Không có bài nào ở trạng thái này.</div> : null}
              </div>
            </section>
          ))}
        </div>

        <div id="course-sheet" className="mt-5 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Bài giảng</th>
                <th className="px-4 py-3">Học phần</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Lịch gần nhất</th>
                <th className="px-4 py-3">Giảng viên/Lớp</th>
                <th className="px-4 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {course.sections.flatMap((section) => section.lessons.map((lesson) => ({ section, lesson }))).map(({ section, lesson }) => {
                const lessonSchedules = lesson.schedules as LessonScheduleView[];
                const nextSchedule = lessonSchedules.sort((a, b) => scheduleTime(a.startsAt) - scheduleTime(b.startsAt))[0];
                return (
                  <tr key={lesson.id} className="hover:bg-orange-50/40">
                    <td className="px-4 py-3"><a href={`#lesson-${lesson.id}`} className="font-bold text-slate-950 hover:text-orange-600">{lesson.title}</a></td>
                    <td className="px-4 py-3 text-slate-600">{section.title}</td>
                    <td className="px-4 py-3 text-slate-600">{lesson.type}</td>
                    <td className="px-4 py-3 text-slate-600">{nextSchedule ? formatDateTime(nextSchedule.startsAt) : "Chưa xếp lịch"}</td>
                    <td className="px-4 py-3 text-slate-600">{nextSchedule?.instructor?.name || course.instructor.name} · {nextSchedule?.class?.name || "Mọi lớp"}</td>
                    <td className="px-4 py-3 text-right"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${lesson.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{lesson.isPublished ? "Đã xuất bản" : "Bản nháp"}</span></td>
                  </tr>
                );
              })}
              {!lessons.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    Sheet view chưa có dòng nào. Tạo học phần và bài giảng để bắt đầu vận hành khóa học.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <section id="course-timeline" className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="font-bold text-slate-950">Timeline vận hành</h4>
            <div className="mt-4 space-y-3">
              {upcomingSchedules.map((schedule, index) => (
                <div key={`timeline-${schedule.id}`} className="grid grid-cols-[36px_1fr] gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-orange-600 shadow-sm">{index + 1}</span>
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-sm">
                    <strong className="text-slate-950">{schedule.title}</strong>
                    <p className="mt-1 text-slate-500">{formatDateTime(schedule.startsAt)} · {modeLabel[schedule.mode] || schedule.mode}</p>
                  </div>
                </div>
              ))}
              {!upcomingSchedules.length ? <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">Chưa có timeline vì khóa học chưa được xếp lịch.</div> : null}
            </div>
          </section>

          <section id="course-calendar" className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="font-bold text-slate-950">Calendar view</h4>
            <div className="mt-4 grid gap-3">
              {Object.entries(schedulesByDay).map(([day, daySchedules]) => (
                <div key={day} className="rounded-xl border border-slate-100 bg-white p-3">
                  <strong className="text-sm text-slate-950">{day}</strong>
                  <div className="mt-2 space-y-2">
                    {daySchedules.map((schedule) => (
                      <div key={`calendar-${schedule.id}`} className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">{schedule.title} · {modeLabel[schedule.mode] || schedule.mode}</div>
                    ))}
                  </div>
                </div>
              ))}
              {!Object.keys(schedulesByDay).length ? <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">Chưa có ngày học nào trong calendar.</div> : null}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">Luồng vận hành kế tiếp</h3>
              <p className="mt-1 text-sm text-slate-500">Các việc cần làm để khóa học chạy được từ nội dung đến lớp học.</p>
            </div>
            <Link href="/workspace/training/calendar" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Mở lịch học</Link>
          </div>
          <div className="mt-4 grid gap-2">
            {(needsSetup.length ? needsSetup : ["Khóa học đã có cấu trúc vận hành cơ bản."]).map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                {needsSetup.length ? <CircleAlert className="h-4 w-4 text-orange-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">Buổi học gần nhất</h3>
              <p className="mt-1 text-sm text-slate-500">Online, offline, thực tế hoặc kết hợp.</p>
            </div>
            <Radio className="h-5 w-5 text-orange-500" />
          </div>
          <div className="mt-4 space-y-2">
            {upcomingSchedules.map((schedule) => (
              <div key={schedule.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-slate-950">{schedule.title}</strong>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">{modeLabel[schedule.mode] || schedule.mode}</span>
                </div>
                <p className="mt-1 text-slate-500">{schedule.lessonTitle} · {formatDateTime(schedule.startsAt)}</p>
                <p className="mt-1 font-semibold text-slate-700">{schedule.onlineUrl || schedule.location || schedule.fieldAddress || "Chưa có địa điểm/link"}</p>
              </div>
            ))}
            {!upcomingSchedules.length ? <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Chưa có buổi học nào. Thêm lịch vào từng bài giảng để bắt đầu vận hành.</div> : null}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <form action={sectionAction} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-950">Thêm học phần</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_120px]">
            <label className={labelClass}>Tên học phần<input name="title" required placeholder="Ví dụ: Nền tảng marketing" className={inputClass} /></label>
            <label className={labelClass}>Thứ tự<input name="order" type="number" min="1" className={inputClass} /></label>
          </div>
          <label className={`${labelClass} mt-3 block`}>Mô tả<textarea name="description" rows={2} className={inputClass} /></label>
          <button type="submit" className="quote-action-button quote-action-primary mt-4">Thêm học phần</button>
        </form>

        <form action={lessonAction} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-950">Thêm bài giảng</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className={labelClass}>Học phần
              <select name="sectionId" required className={inputClass}>
                {course.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
              </select>
            </label>
            <label className={labelClass}>Loại bài
              <select name="type" defaultValue="LIVE" className={inputClass}>
                <option value="LIVE">Live / trực tiếp</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Tài liệu</option>
                <option value="QUIZ">Quiz</option>
                <option value="ASSIGNMENT">Bài tập</option>
              </select>
            </label>
            <label className={labelClass}>Tên bài giảng<input name="title" required className={inputClass} /></label>
            <label className={labelClass}>Thời lượng phút<input name="duration" type="number" min="0" className={inputClass} /></label>
            <label className={`${labelClass} md:col-span-2`}>Link video/tài liệu<input name="videoUrl" className={inputClass} /></label>
          </div>
          <label className={`${labelClass} mt-3 block`}>Nội dung<textarea name="content" rows={2} className={inputClass} /></label>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
            <label className="flex items-center gap-2"><input name="isPublished" type="checkbox" defaultChecked /> Xuất bản</label>
            <label className="flex items-center gap-2"><input name="isFree" type="checkbox" /> Học thử miễn phí</label>
          </div>
          <button type="submit" className="quote-action-button quote-action-primary mt-4" disabled={!course.sections.length}>Thêm bài giảng</button>
        </form>
      </div>

      <div className="space-y-4">
        {course.sections.map((section) => (
          <article key={section.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-950">{section.order}. {section.title}</h3>
                <p className="text-sm text-slate-500">{section.description || "Chưa có mô tả học phần."}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{section.lessons.length} bài</span>
            </div>

            <div className="mt-4 space-y-3">
              {section.lessons.map((lesson) => {
                const scheduleAction = createLessonSchedule.bind(null, course.id, lesson.id);
                return (
                  <div id={`lesson-${lesson.id}`} key={lesson.id} className="scroll-mt-24 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <strong className="text-slate-950">{lesson.order}. {lesson.title}</strong>
                        <p className="mt-1 text-sm text-slate-500">{lesson.description || lesson.content || "Chưa có nội dung bài giảng."}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">{lesson.type}</span>
                    </div>

                    <div className="mt-3 grid gap-2">
                      {(lesson.schedules as LessonScheduleView[]).map((schedule) => (
                        <div key={schedule.id} className="grid gap-2 rounded-lg border border-slate-100 bg-white p-3 text-sm text-slate-600 md:grid-cols-[1fr_1fr_1fr]">
                          <span><b className="text-slate-950">{schedule.title}</b><br />{modeLabel[schedule.mode] || schedule.mode}</span>
                          <span>{formatDateTime(schedule.startsAt)}<br />{schedule.endsAt ? formatDateTime(schedule.endsAt) : ""}</span>
                          <span>{schedule.class?.name || "Mọi lớp"} · {schedule.instructor?.name || "Chưa gán GV"}<br />{schedule.onlineUrl || schedule.location || schedule.fieldAddress || "Chưa có địa điểm/link"}</span>
                        </div>
                      ))}
                    </div>

                    <form action={scheduleAction} className="mt-4 grid gap-3 rounded-xl border border-dashed border-slate-200 bg-white p-3 md:grid-cols-3">
                      <label className={labelClass}>Tên lịch<input name="title" required placeholder="Buổi 1" className={inputClass} /></label>
                      <label className={labelClass}>Hình thức
                        <select name="mode" className={inputClass}>
                          <option value="OFFLINE">Offline</option>
                          <option value="ONLINE">Online</option>
                          <option value="FIELD">Thực tế</option>
                          <option value="HYBRID">Kết hợp</option>
                        </select>
                      </label>
                      <label className={labelClass}>Lớp áp dụng
                        <select name="classId" className={inputClass}>
                          <option value="">Tất cả/chưa gán lớp</option>
                          {options.classes.filter((item) => item.courseId === course.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      </label>
                      <label className={labelClass}>Bắt đầu<input name="startsAt" type="datetime-local" className={inputClass} /></label>
                      <label className={labelClass}>Kết thúc<input name="endsAt" type="datetime-local" className={inputClass} /></label>
                      <label className={labelClass}>Giảng viên
                        <select name="instructorId" className={inputClass} defaultValue={course.instructorId}>
                          <option value="">Chưa gán</option>
                          {options.instructors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      </label>
                      <label className={labelClass}>Địa điểm offline<input name="location" className={inputClass} /></label>
                      <label className={labelClass}>Link online<input name="onlineUrl" className={inputClass} /></label>
                      <label className={labelClass}>Địa chỉ thực tế<input name="fieldAddress" className={inputClass} /></label>
                      <label className={labelClass}>Sức chứa<input name="capacity" type="number" min="0" className={inputClass} /></label>
                      <label className={`${labelClass} md:col-span-2`}>Ghi chú<input name="note" className={inputClass} /></label>
                      <div className="flex items-end"><button type="submit" className="quote-action-button quote-action-primary w-full">Thêm lịch</button></div>
                    </form>
                  </div>
                );
              })}
              {!section.lessons.length ? <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">Chưa có bài giảng trong học phần này.</div> : null}
            </div>
          </article>
        ))}
        {!course.sections.length ? <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Tạo học phần đầu tiên để bắt đầu xây e-learning.</div> : null}
      </div>
    </section>
  );
}
