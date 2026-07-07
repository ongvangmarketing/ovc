import { ClipboardCheck } from "lucide-react";

import { getInstructorLearningPortalData } from "@/lib/training/learning-portals";
import { GradingList } from "./components/grading-list";

export default async function InstructorGradingPage() {
  const data = await getInstructorLearningPortalData();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 animate-in fade-in duration-500">
      
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Chấm điểm & Phản hồi</h1>
            <p className="mt-1 text-sm text-slate-500">Xem và đánh giá bài làm của học viên trong các khóa học bạn phụ trách.</p>
          </div>
        </div>
      </header>

      <GradingList submissions={data.submissions} />
      
    </div>
  );
}
