"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarClock, DoorClosed, DoorOpen, Eraser, Save } from "lucide-react";
import { updateRoomInventoryBatch } from "../actions";

type CalendarDay = {
  key: string;
  label: string;
  weekday: string;
};

type InventoryCell = {
  roomTypeId: string;
  date: string;
  price: number;
  allotment: number;
  availableRooms: number;
  isClosed: boolean;
  isDefault: boolean;
  note: string | null;
};

type RoomTypeRow = {
  id: string;
  name: string;
  basePrice: number;
  roomCount: number;
  cells: InventoryCell[];
};

type SelectedCell = {
  roomTypeId: string;
  date: string;
};

const formatMoney = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

function cellKey(roomTypeId: string, date: string) {
  return `${roomTypeId}:${date}`;
}

export default function InventoryCalendarClient({
  hotelId,
  days,
  roomTypes,
}: {
  hotelId: string;
  days: CalendarDay[];
  roomTypes: RoomTypeRow[];
}) {
  const [rows, setRows] = useState(roomTypes);
  const [selected, setSelected] = useState<SelectedCell[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [price, setPrice] = useState("");
  const [allotment, setAllotment] = useState("");
  const [availableRooms, setAvailableRooms] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedKeys = useMemo(() => new Set(selected.map((cell) => cellKey(cell.roomTypeId, cell.date))), [selected]);
  const selectedRoomTypes = useMemo(() => [...new Set(selected.map((cell) => cell.roomTypeId))], [selected]);
  const selectedDates = useMemo(() => [...new Set(selected.map((cell) => cell.date))], [selected]);

  function toggleCell(roomTypeId: string, date: string, additive = false) {
    const key = cellKey(roomTypeId, date);
    setSelected((current) => {
      if (!additive) return [{ roomTypeId, date }];
      if (current.some((cell) => cellKey(cell.roomTypeId, cell.date) === key)) return current;
      return [...current, { roomTypeId, date }];
    });
  }

  function selectCell(roomTypeId: string, date: string) {
    const key = cellKey(roomTypeId, date);
    setSelected((current) => {
      if (current.some((cell) => cellKey(cell.roomTypeId, cell.date) === key)) return current;
      return [...current, { roomTypeId, date }];
    });
  }

  function selectRow(roomTypeId: string) {
    setSelected(days.map((day) => ({ roomTypeId, date: day.key })));
  }

  function selectColumn(date: string) {
    setSelected(rows.map((row) => ({ roomTypeId: row.id, date })));
  }

  function applyLocalUpdate(action: "OPEN" | "CLOSE" | "UPDATE") {
    const selectedSet = new Set(selected.map((cell) => cellKey(cell.roomTypeId, cell.date)));
    setRows((currentRows) =>
      currentRows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => {
          if (!selectedSet.has(cellKey(cell.roomTypeId, cell.date))) return cell;

          return {
            ...cell,
            isClosed: action === "CLOSE" ? true : action === "OPEN" ? false : cell.isClosed,
            price: price ? Number(price) : cell.price,
            allotment: allotment ? Number(allotment) : cell.allotment,
            availableRooms: availableRooms ? Number(availableRooms) : cell.availableRooms,
            note: action === "UPDATE" ? note || null : cell.note,
            isDefault: false,
          };
        }),
      })),
    );
  }

  function submit(action: "OPEN" | "CLOSE" | "UPDATE") {
    if (selected.length === 0) {
      setMessage("Chọn ít nhất một ô lịch trước đã.");
      return;
    }

    setMessage("");
    startTransition(async () => {
      const result = await updateRoomInventoryBatch({
        hotelId,
        roomTypeIds: selectedRoomTypes,
        dates: selectedDates,
        action,
        price: price ? Number(price) : null,
        allotment: allotment ? Number(allotment) : null,
        availableRooms: availableRooms ? Number(availableRooms) : null,
        note,
      });

      if (result.success && 'updated' in result) {
        applyLocalUpdate(action);
        setMessage(`Đã cập nhật ${result.updated} ô lịch.`);
      } else if ('error' in result) {
        setMessage((result as any).error || "Có lỗi khi cập nhật lịch.");
      }
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans w-full max-w-[1440px] mx-auto p-6 md:p-10 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-black text-white px-3 py-1 text-[11px] font-medium uppercase tracking-widest flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3" />
            Lịch OTA
          </span>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-[40px] md:text-[48px] font-medium tracking-tighter leading-[1.05] text-black">
            Quản lý phòng trống.
          </h1>
          <p className="mt-4 text-[15px] text-gray-500 leading-relaxed">
            Kéo chọn dải ngày để đóng mở phòng, cập nhật giá và số lượng bán.
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 shadow-sm flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-medium text-black">Công cụ cập nhật hàng loạt</h2>
              <span className="text-[12px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-[#eaeaea]">
                {selected.length > 0 ? `Đang chọn ${selected.length} ô lịch` : "Chưa chọn ô nào"}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-gray-500 uppercase tracking-widest">Giá bán</span>
                <input className="w-full h-9 rounded-md border border-[#eaeaea] px-3 text-[13px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors shadow-sm" inputMode="numeric" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="vd: 850000" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-gray-500 uppercase tracking-widest">Allotment</span>
                <input className="w-full h-9 rounded-md border border-[#eaeaea] px-3 text-[13px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors shadow-sm" inputMode="numeric" value={allotment} onChange={(event) => setAllotment(event.target.value)} placeholder="Số lượng" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-gray-500 uppercase tracking-widest">Còn bán</span>
                <input className="w-full h-9 rounded-md border border-[#eaeaea] px-3 text-[13px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors shadow-sm" inputMode="numeric" value={availableRooms} onChange={(event) => setAvailableRooms(event.target.value)} placeholder="Số phòng" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-medium text-gray-500 uppercase tracking-widest">Ghi chú</span>
                <input className="w-full h-9 rounded-md border border-[#eaeaea] px-3 text-[13px] text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors shadow-sm" value={note} onChange={(event) => setNote(event.target.value)} placeholder="vd: Stop-sale" />
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 lg:border-l lg:border-[#eaeaea] lg:pl-6">
            <button type="button" className="w-full sm:w-auto h-9 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-[#eaeaea] text-[13px] font-medium text-black hover:bg-gray-50 transition-colors shadow-sm" onClick={() => submit("OPEN")} disabled={isPending}>
              <DoorOpen className="h-4 w-4" />
              Mở bán
            </button>
            <button type="button" className="w-full sm:w-auto h-9 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-[#eaeaea] text-[13px] font-medium text-black hover:bg-gray-50 transition-colors shadow-sm" onClick={() => submit("CLOSE")} disabled={isPending}>
              <DoorClosed className="h-4 w-4" />
              Đóng phòng
            </button>
            <button type="button" className="w-full sm:w-auto h-9 px-5 inline-flex items-center justify-center gap-2 rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors shadow-sm" onClick={() => submit("UPDATE")} disabled={isPending}>
              <Save className="h-4 w-4" />
              Cập nhật
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] font-medium text-gray-500">
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-black" /> Mở bán</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" /> Đóng</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full border border-gray-300" /> Mặc định</span>
          </div>
          <button type="button" className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition-colors" onClick={() => setSelected([])}>
            <Eraser className="h-4 w-4" />
            Bỏ chọn tất cả
          </button>
        </div>

        {message && <div className="rounded-lg border border-black bg-black text-white px-4 py-3 text-[13px] font-medium flex items-center justify-center shadow-lg">{message}</div>}

        <div
          className="overflow-x-auto rounded-2xl border border-[#eaeaea] bg-white shadow-sm"
          onMouseLeave={() => setIsDragging(false)}
          onMouseUp={() => setIsDragging(false)}
        >
          <table className="w-full min-w-[1280px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#eaeaea] bg-gray-50/50">
                <th className="sticky left-0 z-20 w-56 border-r border-[#eaeaea] bg-gray-50/50 px-5 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Hạng phòng</th>
                {days.map((day) => (
                  <th key={day.key} className="border-r border-[#eaeaea] p-0 font-medium text-black">
                    <button type="button" className="w-full h-full p-3 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center" onClick={() => selectColumn(day.key)}>
                      <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{day.weekday}</div>
                      <div className="text-[14px]">{day.label}</div>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[#eaeaea] hover:bg-gray-50/30 transition-colors">
                  <td className="sticky left-0 z-10 border-r border-[#eaeaea] bg-white px-5 py-4">
                    <button type="button" className="block text-left w-full group" onClick={() => selectRow(row.id)}>
                      <div className="font-medium text-black text-[14px] group-hover:underline underline-offset-2">{row.name}</div>
                      <div className="mt-1.5 text-[12px] text-gray-500">
                        {row.roomCount} phòng · Giá gốc {formatMoney.format(row.basePrice)}
                      </div>
                    </button>
                  </td>
                  {row.cells.map((cell) => {
                    const isSelected = selectedKeys.has(cellKey(cell.roomTypeId, cell.date));
                    return (
                      <td key={cell.date} className="border-r border-[#eaeaea] p-1.5 bg-white">
                        <button
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                            toggleCell(cell.roomTypeId, cell.date, event.metaKey || event.ctrlKey || event.shiftKey);
                          }}
                          onMouseEnter={() => {
                            if (isDragging) selectCell(cell.roomTypeId, cell.date);
                          }}
                          className={`min-h-24 w-full flex flex-col justify-between select-none rounded-lg border p-2.5 text-left transition-all ${
                            isSelected
                              ? "border-black bg-gray-100 ring-1 ring-black shadow-inner"
                              : cell.isClosed
                                ? "border-rose-100 bg-rose-50/50 hover:border-rose-300"
                                : "border-[#eaeaea] bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className={`text-[11px] font-semibold uppercase tracking-widest ${cell.isClosed ? "text-rose-600" : "text-black"}`}>
                            {cell.isClosed ? "ĐÓNG" : "MỞ BÁN"}
                          </div>
                          <div className="mt-2 text-[14px] font-medium text-black">{formatMoney.format(cell.price)}</div>
                          <div className="mt-1 text-[11px] font-medium text-gray-500">
                            Còn {cell.availableRooms}/{cell.allotment}
                          </div>
                          {cell.isDefault && <div className="mt-2 text-[10px] font-medium text-gray-400 border border-[#eaeaea] rounded px-1.5 py-0.5 inline-block bg-gray-50">MẶC ĐỊNH</div>}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={days.length + 1} className="px-6 py-20 text-center flex flex-col items-center justify-center">
                    <DoorClosed className="w-8 h-8 text-gray-300 mb-3" />
                    <span className="text-[14px] font-medium text-black">Chưa có hạng phòng</span>
                    <span className="text-[13px] text-gray-500 mt-1">Tạo hạng phòng trước rồi quay lại lịch đóng mở.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
