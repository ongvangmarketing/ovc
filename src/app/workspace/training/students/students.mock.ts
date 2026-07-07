import type { StudentWorkspaceItem } from "./students.types";

export const studentMockData: StudentWorkspaceItem[] = [
  {
    id: "mock-student-1",
    name: "Nguyen Thuy Linh",
    email: "linh@example.com",
    phone: "0900000001",
    enrollments: 2,
    active: 1,
    completed: 1,
    progress: 68,
    status: "learning",
    owner: "Training OVC",
    nextAction: "Nhắc hoàn thành bài tập buổi 4",
    note: "Học tốt, cần theo sát lịch nộp bài.",
    activity: ["Đã tham gia lớp Digital Marketing", "Nộp bài tập chiến dịch Facebook", "Cần nhắc học phí kỳ 2"],
  },
  {
    id: "mock-student-2",
    name: "Tran Minh Quan",
    email: "quan@example.com",
    phone: "0900000002",
    enrollments: 1,
    active: 1,
    completed: 0,
    progress: 12,
    status: "risk",
    owner: "CSKH đào tạo",
    nextAction: "Gọi lại vì vắng 2 buổi liên tiếp",
    note: "Có nguy cơ bỏ học nếu không can thiệp sớm.",
    activity: ["Vắng buổi thực hành", "Chưa xem bài giảng online", "Đã gửi nhắc qua email"],
  },
];
