"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Upload, Trash2, File, Image as ImageIcon, FileText, Download, HardDrive, Folder, ChevronDown, ChevronRight } from "lucide-react";
import { getStorageFiles, deleteStorageFile, uploadStorageFile, getGoogleDriveFolders } from "../actions/storage.files.actions";
import { toast } from "sonner";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

type StorageFileRow = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: string | number | bigint;
  createdAt: string | Date;
  path: string;
  connection: {
    id: string;
    name: string;
    provider: string;
  };
};

type FolderNode = {
  name: string;
  path: string;
  children: FolderNode[];
};

type DriveFolderGroup = {
  connectionId: string;
  folders: Array<{ id: string; name: string; path: string; parentId: string }>;
};

function normalizeFolderPath(path: string) {
  return path.replace(/^\/+|\/+$/g, "");
}

function buildFolderTree(paths: string[]) {
  const root: FolderNode[] = [];

  for (const rawPath of paths) {
    const parts = normalizeFolderPath(rawPath).split("/").filter(Boolean);
    let level = root;
    let currentPath = "";

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      let node = level.find((item) => item.name === part);
      if (!node) {
        node = { name: part, path: currentPath, children: [] };
        level.push(node);
      }
      level = node.children;
    }
  }

  const sortNodes = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    nodes.forEach((node) => sortNodes(node.children));
  };
  sortNodes(root);
  return root;
}

function FolderTreeItem({
  node,
  depth,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggle,
}: {
  node: FolderNode;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect(node.path);
          if (hasChildren) onToggle(node.path);
        }}
        className={`flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 text-left text-[13px] transition-colors ${isSelected ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          {hasChildren ? (isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : null}
        </span>
        <Folder className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && isExpanded ? node.children.map((child) => (
        <FolderTreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      )) : null}
    </div>
  );
}

const MAX_SERVER_ACTION_FILE_SIZE = 23 * 1024 * 1024;

type DirectUploadSession = {
  success?: boolean;
  uploadUrl?: string;
  uploadSessionId?: string;
  provider?: "S3" | "R2" | "GOOGLE_DRIVE" | "GOOGLE_SHARED_DRIVE";
  providerId?: string;
  error?: string;
};

async function createDirectUploadSession(file: File, category: string): Promise<DirectUploadSession> {
  const response = await fetch("/api/storage/direct-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start",
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      category,
      module: "CORE",
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Không tạo được phiên upload (HTTP ${response.status})`);
  return data || { success: false, error: "Phản hồi tạo phiên upload không hợp lệ" };
}

async function completeDirectUpload(uploadSessionId: string, providerId: string) {
  const response = await fetch("/api/storage/direct-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete", uploadSessionId, providerId }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || `Không ghi nhận được file (HTTP ${response.status})`);
  }
}

export function StorageExplorerTab({ organizationId }: { organizationId: string }) {
  const [files, setFiles] = useState<StorageFileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState("GENERAL");
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [driveFolderGroups, setDriveFolderGroups] = useState<DriveFolderGroup[]>([]);

  const drives = useMemo(() => Array.from(
    new Map(files.map((file) => [file.connection.id, file.connection])).values(),
  ), [files]);

  const driveFiles = useMemo(
    () => selectedDriveId ? files.filter((file) => file.connection.id === selectedDriveId) : files,
    [files, selectedDriveId],
  );

  const folderTree = useMemo(() => {
    const storedPaths = driveFiles
      .filter((file) => file.connection.provider !== "GOOGLE_DRIVE" && file.connection.provider !== "GOOGLE_SHARED_DRIVE")
      .map((file) => file.path);
    const liveDrivePaths = driveFolderGroups
      .filter((group) => selectedDriveId === null || group.connectionId === selectedDriveId)
      .flatMap((group) => group.folders.map((folder) => folder.path));
    return buildFolderTree(Array.from(new Set([...storedPaths, ...liveDrivePaths])));
  }, [driveFiles, driveFolderGroups, selectedDriveId]);

  const visibleFiles = useMemo(() => {
    if (!selectedFolderPath) return driveFiles;
    return driveFiles.filter((file) => {
      const filePath = normalizeFolderPath(file.path);
      return filePath === selectedFolderPath || filePath.startsWith(`${selectedFolderPath}/`);
    });
  }, [driveFiles, selectedFolderPath]);

  const toggleFolder = (path: string) => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const selectDrive = (driveId: string | null) => {
    setSelectedDriveId(driveId);
    setSelectedFolderPath(null);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesResult, foldersResult] = await Promise.allSettled([
        getStorageFiles(organizationId),
        getGoogleDriveFolders(organizationId),
      ]);
      if (filesResult.status === "rejected") throw filesResult.reason;
      setFiles(filesResult.value as StorageFileRow[]);
      if (foldersResult.status === "fulfilled") {
        setDriveFolderGroups(foldersResult.value as DriveFolderGroup[]);
      } else {
        toast.error("Không đọc được cây thư mục Google Drive");
      }
    } catch {
      toast.error("Lỗi tải danh sách file");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadCategory);
    const uploadToastId = toast.loading("Đang tải tài liệu lên");

    try {
      const directSession = await createDirectUploadSession(file, uploadCategory);

      if (
        directSession.success &&
        (directSession.provider === "R2" || directSession.provider === "S3") &&
        directSession.uploadUrl &&
        directSession.uploadSessionId &&
        directSession.providerId
      ) {
        let cloudResponse: Response;
        try {
          cloudResponse = await fetch(directSession.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type || "application/octet-stream" },
            body: file,
          });
        } catch {
          throw new Error("R2 từ chối kết nối trình duyệt. Vui lòng tải lại trang và thử lại sau khi CORS cập nhật.");
        }

        if (!cloudResponse.ok) {
          throw new Error(`R2 trả về HTTP ${cloudResponse.status}`);
        }

        await completeDirectUpload(directSession.uploadSessionId, directSession.providerId);
        toast.success("Tải tài liệu thành công", { id: uploadToastId });
        await loadData();
        return;
      }

      if (file.size > MAX_SERVER_ACTION_FILE_SIZE) {
        throw new Error("File vượt quá giới hạn 23 MB của kho lưu trữ hiện tại");
      }

      const result = await uploadStorageFile(organizationId, formData);
      if (!result.success) throw new Error(result.error || "Upload không thành công");
      toast.success("Tải tài liệu thành công", { id: uploadToastId });
      await loadData();
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      toast.error(`Lỗi: ${message}`, { id: uploadToastId });
    } finally {
      e.target.value = '';
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tệp tin này?")) return;
    try {
      const res = await deleteStorageFile(organizationId, id);
      if (res.success) {
        toast.success("Đã xóa tệp tin");
        loadData();
      } else {
        toast.error(res.error || "Lỗi xóa tệp tin");
      }
    } catch {
      toast.error("Lỗi hệ thống");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes("pdf") || mimeType.includes("document")) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">File Explorer</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ tệp tin của hệ thống tại đây</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="px-3 py-2 border border-[#eaeaea] rounded-lg text-[13px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
          >
            <option value="GENERAL">Tài liệu chung (General)</option>
            <option value="MAIL_ATTACHMENT">Đính kèm Email (Mail)</option>
            <option value="CHAT_MEDIA">Hình ảnh/Video Chat (Chat)</option>
            <option value="TASK_FILE">Tài liệu công việc (Task)</option>
            <option value="INVOICE">Hóa đơn chứng từ (Finance)</option>
            <option value="LEAD_DOCS">Tài liệu khách hàng (CRM)</option>
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            {isUploading ? "Đang tải lên..." : "Tải lên"}
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading} 
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-[13px]">Đang tải dữ liệu...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 border border-[#eaeaea] border-dashed rounded-2xl bg-gray-50">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-[#eaeaea] flex items-center justify-center mx-auto mb-3">
            <File className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-[14px] font-medium text-gray-900">Kho lưu trữ đang trống</p>
          <p className="text-[13px] text-gray-500 mt-1 mb-4">Hãy tải lên tệp tin đầu tiên của bạn.</p>
        </div>
      ) : (
        <section className="quote-panel overflow-hidden p-0">
          <div className="grid min-h-[420px] lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-slate-50/60 p-3 lg:border-b-0 lg:border-r">
              <div className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Ổ lưu trữ</div>
              <button
                type="button"
                onClick={() => selectDrive(null)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${selectedDriveId === null ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70"}`}
              >
                <HardDrive className="h-4 w-4" />
                <span className="flex-1">Tất cả ổ đĩa</span>
                <span className="text-[11px] text-slate-400">{files.length}</span>
              </button>
              {drives.map((drive) => {
                const fileCount = files.filter((file) => file.connection.id === drive.id).length;
                return (
                  <button
                    key={drive.id}
                    type="button"
                    onClick={() => selectDrive(drive.id)}
                    className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${selectedDriveId === drive.id ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70"}`}
                  >
                    <HardDrive className="h-4 w-4" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{drive.name}</span>
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400">{drive.provider}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">{fileCount}</span>
                  </button>
                );
              })}

              <div className="mt-4 border-t border-slate-200 px-2 pb-2 pt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Cây thư mục</div>
              <button
                type="button"
                onClick={() => setSelectedFolderPath(null)}
                className={`mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] ${selectedFolderPath === null ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Folder className="h-4 w-4 text-amber-500" />
                Tất cả thư mục
              </button>
              {folderTree.map((node) => (
                <FolderTreeItem
                  key={node.path}
                  node={node}
                  depth={0}
                  selectedPath={selectedFolderPath}
                  expandedPaths={expandedPaths}
                  onSelect={setSelectedFolderPath}
                  onToggle={toggleFolder}
                />
              ))}
            </aside>

            <div className="min-w-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eaeaea] bg-gray-50/50">
                  <th className="px-6 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wider">Tên tệp</th>
                  <th className="px-6 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                  <th className="px-6 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wider">Nơi lưu trữ</th>
                  <th className="px-6 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-[12px] font-medium text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {visibleFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.mimeType)}
                        <span className="text-[13px] font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500">
                      {formatSize(Number(file.sizeBytes))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800">
                        {file.connection.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="hover:text-blue-600"><Download className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(file.id)} className="hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleFiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-slate-400">Thư mục này chưa có tài liệu.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          </div>
        </section>
      )}
    </div>
  );
}
