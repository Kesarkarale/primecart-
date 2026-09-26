"use client";

import {
  Archive,
  Check,
  ChevronDown,
  Clock3,
  Download,
  File as FileIconLucide,
  FileImage,
  FileText,
  Folder,
  FolderOpen,
  Grid2X2,
  HardDrive,
  List,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Upload,
  X,
  AlertCircle,
  CloudUpload,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import DashboardShell from "../components/DashboardShell";

type FileType =
  | "folder"
  | "pdf"
  | "image"
  | "document"
  | "zip";

type FileItem = {
  id: string;
  name: string;
  type: FileType;
  size: number;
  fileType?: string;
  modified: string;
  modifiedAt: number;
};

type ToastType = "success" | "error";

type ToastState = {
  type: ToastType;
  message: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const HERO_BANNERS = [
  { image: "/banner/hero-banner.png", link: "/categories/fashion" },
  { image: "/banner/hero-banner2.png", link: "/categories/electronics" },
  { image: "/banner/hero-banner3.png", link: "/categories/home-living" },
  { image: "/banner/hero-banner4.png", link: "/categories/beauty" },
  { image: "/banner/hero-banner5.png", link: "/categories/fashion" },
  { image: "/banner/hero-banner6.png", link: "/categories/electronics" },
];

export default function FilesPage() {
  const router = useRouter();
  const [heroCurrent, setHeroCurrent] = useState(0);

  const [files, setFiles] = useState<FileItem[]>([]);

  const [search, setSearch] = useState("");

  const [view, setView] =
    useState<"grid" | "list">("grid");

  const [sortBy, setSortBy] =
    useState<"recent" | "name" | "size">(
      "recent"
    );

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [showUpload, setShowUpload] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<FileItem | null>(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [toast, setToast] =
    useState<ToastState | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroCurrent((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const showToast = useCallback(
    (
      type: ToastType,
      message: string
    ) => {
      setToast({
        type,
        message,
      });

      window.setTimeout(() => {
        setToast(null);
      }, 3500);
    },
    []
  );

  /* =========================================
     AUTH TOKEN
  ========================================= */

  const getToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt")
    );
  }, []);

  /* =========================================
     API REQUEST
  ========================================= */

  const apiRequest = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ) => {
      const token = getToken();

      if (!token) {
        throw new Error("Please login again to access your files.");
      }

      const headers = new Headers(
        options.headers
      );

      if (token) {
        headers.set(
          "Authorization",
          `Bearer ${token}`
        );
      }

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,
          headers,
        }
      );

      if (!response.ok) {
        let message =
          `Request failed (${response.status})`;

        try {
          const contentType =
            response.headers.get(
              "content-type"
            );

          if (
            contentType?.includes(
              "application/json"
            )
          ) {
            const data =
              await response.json();

            message =
              data?.message ||
              data?.error ||
              message;
          } else {
            const text =
              await response.text();

            if (text.trim()) {
              message = text;
            }
          }
        } catch {
          // Keep default error.
        }

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        throw new Error(message);
      }

      return response;
    },
    [getToken]
  );

  /* =========================================
     NORMALIZE BACKEND FILE
  ========================================= */

  const normalizeFile = useCallback(
    (item: any): FileItem => {
      const rawName =
        item?.fileName ??
        item?.name ??
        "Unnamed file";

      const rawSize =
        item?.fileSize ??
        item?.size ??
        0;

      const numericSize =
        typeof rawSize === "number"
          ? rawSize
          : Number(rawSize) || 0;

      const rawType =
        item?.fileType ??
        item?.contentType ??
        "";

      const type =
        getFileTypeFromName(
          rawName
        );

      const modified =
        item?.updatedAt ??
        item?.createdAt ??
        item?.modifiedAt ??
        item?.uploadedAt ??
        "";

      return {
        id: String(
          item?.id ??
            item?.fileId ??
            crypto.randomUUID()
        ),
        name: rawName,
        type,
        size: numericSize,
        fileType:
          typeof rawType === "string"
            ? rawType
            : undefined,
        modified: formatModifiedDate(modified),
        modifiedAt: getTimestamp(modified),
      };
    },
    []
  );

  /* =========================================
     LOAD FILES
  ========================================= */

  const loadFiles = useCallback(
    async (
      showRefreshLoader = false
    ) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await apiRequest("/api/files");

        const data =
          await response.json();

        const backendFiles =
          Array.isArray(data)
            ? data
            : data?.files ?? [];

        const normalized =
          backendFiles.map(
            normalizeFile
          );

        setFiles(normalized);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load files.";

        showToast(
          "error",
          message
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      apiRequest,
      normalizeFile,
      showToast,
    ]
  );

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  /* =========================================
     FILTER + SORT
  ========================================= */

  const filteredFiles = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    let result = files.filter(
      (file) =>
        !query ||
        file.name
          .toLowerCase()
          .includes(query)
    );

    if (sortBy === "name") {
      result = [...result].sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );
    }

    if (sortBy === "size") {
      result = [...result].sort(
        (a, b) =>
          b.size - a.size
      );
    }

    if (sortBy === "recent") {
      result = [...result].sort(
        (a, b) =>
          b.modifiedAt - a.modifiedAt
      );
    }

    return result;
  }, [files, search, sortBy]);

  /* =========================================
     STORAGE
  ========================================= */

  const usedBytes = useMemo(
    () =>
      files.reduce(
        (total, file) =>
          total + file.size,
        0
      ),
    [files]
  );

  const storageLimit =
    10 * 1024 * 1024 * 1024;

  const storagePercentage = Math.min(
    100,
    (usedBytes / storageLimit) * 100
  );

  const freeBytes = Math.max(
    0,
    storageLimit - usedBytes
  );

  /* =========================================
     UPLOAD
  ========================================= */

  async function uploadFiles(
    selected: globalThis.File[]
  ) {
    if (!selected.length) {
      return;
    }

    const validFiles =
      selected.filter(
        (file) =>
          file.size <=
          MAX_FILE_SIZE
      );

    const rejected =
      selected.length -
      validFiles.length;

    if (rejected > 0) {
      showToast(
        "error",
        `${rejected} file${
          rejected > 1 ? "s" : ""
        } exceeded the 100 MB limit.`
      );
    }

    if (!validFiles.length) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let uploadedCount = 0;

    try {
      for (
        const file of validFiles
      ) {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        await apiRequest(
          "/api/files/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        uploadedCount++;

        setUploadProgress(
          Math.round(
            (uploadedCount /
              validFiles.length) *
              100
          )
        );
      }

      showToast(
        "success",
        `${uploadedCount} file${
          uploadedCount > 1
            ? "s"
            : ""
        } uploaded successfully.`
      );

      setShowUpload(false);

      await loadFiles(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Upload failed.";

      showToast(
        "error",
        message
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files;

    if (!selected) {
      return;
    }

    uploadFiles(
      Array.from(selected)
    );
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(false);

    const dropped =
      Array.from(
        event.dataTransfer.files
      );

    uploadFiles(dropped);
  }

  /* =========================================
     DOWNLOAD
  ========================================= */

  async function downloadFile(
    file: FileItem
  ) {
    try {
      setDownloadingId(file.id);

      const response =
        await apiRequest(
          `/api/files/${file.id}/download`
        );

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        file.name;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url
      );

      showToast(
        "success",
        "Download started."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Download failed.";

      showToast(
        "error",
        message
      );
    } finally {
      setDownloadingId(null);
    }
  }

  /* =========================================
     DELETE
  ========================================= */

  async function deleteFile(
    file: FileItem
  ) {
    const confirmed =
      window.confirm(
        `Delete "${file.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(file.id);

      await apiRequest(
        `/api/files/${file.id}`,
        {
          method: "DELETE",
        }
      );

      setFiles((current) =>
        current.filter(
          (item) =>
            item.id !== file.id
        )
      );

      setSelectedFile(null);

      showToast(
        "success",
        "File deleted successfully."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete file.";

      showToast(
        "error",
        message
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================
     KEYBOARD
  ========================================= */

  useEffect(() => {
    function handleKeyDown(
      event: globalThis.KeyboardEvent
    ) {
      if (
        event.key === "Escape"
      ) {
        setSelectedFile(null);

        if (!uploading) {
          setShowUpload(false);
        }
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [uploading]);

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

        {/* =====================================
            HERO BANNER
        ====================================== */}

        <section className="mb-7 overflow-hidden rounded-[30px] shadow-xl">
          <div className="relative w-full overflow-hidden rounded-[30px] aspect-[16/6] min-h-[150px] sm:min-h-[190px] md:min-h-[240px] lg:min-h-[300px] xl:min-h-[340px]">
            {HERO_BANNERS.map((banner, index) => (
              <Image
                key={banner.image}
                src={banner.image}
                alt={`PrimeCart banner ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1500px"
                onClick={() => router.push(banner.link)}
                className={`cursor-pointer object-cover transition-opacity duration-700 ${
                  heroCurrent === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-5">
              {HERO_BANNERS.map((banner, index) => (
                <button
                  key={`${banner.image}-dot`}
                  type="button"
                  aria-label={`Show banner ${index + 1}`}
                  onClick={() => setHeroCurrent(index)}
                  className={`h-2 rounded-full transition-all ${
                    heroCurrent === index
                      ? "w-8 bg-white"
                      : "w-2 bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* =====================================
            PAGE HEADER
        ====================================== */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>

              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Cloud Storage
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              My Files
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Securely store, organize and
              manage your files from one
              place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setShowUpload(true)
              }
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}

              {uploading
                ? "Uploading..."
                : "Upload files"}
            </button>
          </div>
        </div>

        {/* =====================================
            STORAGE
        ====================================== */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm dark:border-[#222] dark:bg-[#0d0d0d]">

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <HardDrive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Storage
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatBytes(
                      usedBytes
                    )}{" "}
                    used of 10 GB
                  </p>
                </div>
              </div>

              <div className="w-full lg:max-w-xl">

                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {storagePercentage.toFixed(
                      1
                    )}
                    % used
                  </span>

                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {formatBytes(
                      freeBytes
                    )}{" "}
                    free
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width: `${storagePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            TOOLBAR
        ====================================== */}

        <div className="mt-7 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div className="relative w-full xl:max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search your files..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as
                      | "recent"
                      | "name"
                      | "size"
                  )
                }
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <option value="recent">
                  Recently modified
                </option>

                <option value="name">
                  Name
                </option>

                <option value="size">
                  Largest first
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={() =>
                loadFiles(true)
              }
              disabled={
                refreshing ||
                loading
              }
              title="Refresh"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            <div className="flex h-11 rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">

              <button
                type="button"
                onClick={() =>
                  setView("grid")
                }
                aria-label="Grid view"
                className={`flex w-10 items-center justify-center rounded-lg transition ${
                  view === "grid"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <Grid2X2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setView("list")
                }
                aria-label="List view"
                className={`flex w-10 items-center justify-center rounded-lg transition ${
                  view === "list"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =====================================
            BREADCRUMB
        ====================================== */}

        <div className="mt-7 flex items-center gap-2 text-sm">
          <FolderOpen className="h-4 w-4 text-blue-500" />

          <span className="font-semibold text-slate-900 dark:text-white">
            My Files
          </span>

          <span className="text-slate-300 dark:text-slate-700">
            /
          </span>

          <span className="text-slate-400">
            All Files
          </span>
        </div>

        {/* =====================================
            CONTENT
        ====================================== */}

        {loading ? (
          <LoadingState view={view} />
        ) : filteredFiles.length ===
          0 ? (
          <EmptyState
            search={search}
            onUpload={() =>
              setShowUpload(true)
            }
          />
        ) : view === "grid" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFiles.map(
              (file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClick={() =>
                    setSelectedFile(
                      file
                    )
                  }
                  onDownload={() =>
                    downloadFile(
                      file
                    )
                  }
                  onDelete={() =>
                    deleteFile(file)
                  }
                  downloading={
                    downloadingId ===
                    file.id
                  }
                  deleting={
                    deletingId ===
                    file.id
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm dark:border-[#222] dark:bg-[#0d0d0d]">

            <div className="hidden grid-cols-[minmax(0,1fr)_140px_180px_80px] gap-4 border-b border-slate-200 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/10 md:grid">
              <span>Name</span>
              <span>Size</span>
              <span>Modified</span>
              <span />
            </div>

            {filteredFiles.map(
              (file) => (
                <ListFile
                  key={file.id}
                  file={file}
                  onClick={() =>
                    setSelectedFile(
                      file
                    )
                  }
                  onDownload={() =>
                    downloadFile(
                      file
                    )
                  }
                  onDelete={() =>
                    deleteFile(file)
                  }
                  downloading={
                    downloadingId ===
                    file.id
                  }
                  deleting={
                    deletingId ===
                    file.id
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* =====================================
          UPLOAD MODAL
      ====================================== */}

      {showUpload && (
        <UploadModal
          inputRef={fileInputRef}
          uploading={uploading}
          progress={
            uploadProgress
          }
          dragActive={
            dragActive
          }
          onClose={() => {
            if (!uploading) {
              setShowUpload(
                false
              );
            }
          }}
          onUpload={
            handleFileUpload
          }
          onDragEnter={() =>
            setDragActive(true)
          }
          onDragLeave={() =>
            setDragActive(false)
          }
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={handleDrop}
        />
      )}

      {/* =====================================
          FILE DETAILS
      ====================================== */}

      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          downloading={
            downloadingId ===
            selectedFile.id
          }
          deleting={
            deletingId ===
            selectedFile.id
          }
          onClose={() =>
            setSelectedFile(null)
          }
          onDownload={() =>
            downloadFile(
              selectedFile
            )
          }
          onDelete={() =>
            deleteFile(
              selectedFile
            )
          }
        />
      )}

      {/* =====================================
          TOAST
      ====================================== */}

      {toast && (
        <Toast
          toast={toast}
          onClose={() =>
            setToast(null)
          }
        />
      )}
    </DashboardShell>
  );
}

/* =====================================================
   FILE CARD
===================================================== */

function FileCard({
  file,
  onClick,
  onDownload,
  onDelete,
  downloading,
  deleting,
}: {
  file: FileItem;
  onClick: () => void;
  onDownload: () => void;
  onDelete: () => void;
  downloading: boolean;
  deleting: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#ececec] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/10 dark:border-[#222] dark:bg-[#0d0d0d] dark:hover:border-[#D4AF37]/50 dark:hover:shadow-black/20">

      <div className="flex items-start justify-between">

        <button
          type="button"
          onClick={onClick}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-[#D4AF37] group-hover:text-white dark:bg-white/10 dark:text-slate-300 dark:group-hover:bg-[#D4AF37] dark:group-hover:text-white"
        >
          <FileIcon
            type={file.type}
          />
        </button>

        <div className="relative">

          <button
            type="button"
            onClick={onClick}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className="mt-5 block w-full text-left"
      >
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
          {file.name}
        </p>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span>
            {formatBytes(
              file.size
            )}
          </span>

          <span className="text-slate-300 dark:text-slate-700">
            •
          </span>

          <span>
            {file.modified}
          </span>
        </div>
      </button>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/5">

        <button
          type="button"
          onClick={onDownload}
          disabled={
            downloading ||
            deleting
          }
          className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-blue-400"
        >
          {downloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}

          Download
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={
            downloading ||
            deleting
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   LIST FILE
===================================================== */

function ListFile({
  file,
  onClick,
  onDownload,
  onDelete,
  downloading,
  deleting,
}: {
  file: FileItem;
  onClick: () => void;
  onDownload: () => void;
  onDelete: () => void;
  downloading: boolean;
  deleting: boolean;
}) {
  return (
    <div className="group grid w-full gap-3 border-b border-slate-100 px-4 py-4 transition last:border-0 hover:bg-slate-50 sm:px-5 dark:border-white/5 dark:hover:bg-white/5 md:grid-cols-[minmax(0,1fr)_140px_180px_80px] md:items-center md:gap-4">

      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
          <FileIcon
            type={file.type}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-slate-400 md:hidden">
            {formatBytes(
              file.size
            )}{" "}
            • {file.modified}
          </p>
        </div>
      </button>

      <span className="hidden text-xs text-slate-400 md:block">
        {formatBytes(
          file.size
        )}
      </span>

      <span className="hidden text-xs text-slate-400 md:block">
        {file.modified}
      </span>

      <div className="flex items-center justify-end gap-1">

        <button
          type="button"
          onClick={onDownload}
          disabled={
            downloading ||
            deleting
          }
          title="Download"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={
            downloading ||
            deleting
          }
          title="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   FILE ICON
===================================================== */

function FileIcon({
  type,
}: {
  type: FileType;
}) {
  if (type === "folder") {
    return (
      <Folder className="h-6 w-6" />
    );
  }

  if (type === "image") {
    return (
      <FileImage className="h-6 w-6" />
    );
  }

  if (
    type === "pdf" ||
    type === "document"
  ) {
    return (
      <FileText className="h-6 w-6" />
    );
  }

  if (type === "zip") {
    return (
      <Archive className="h-6 w-6" />
    );
  }

  return (
    <FileIconLucide className="h-6 w-6" />
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  search,
  onUpload,
}: {
  search: string;
  onUpload: () => void;
}) {
  return (
    <div className="mt-6 flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
        {search ? (
          <Search className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        ) : (
          <CloudUpload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        )}
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {search
          ? "No files found"
          : "Your storage is empty"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        {search
          ? "We couldn't find any files matching your search. Try a different name."
          : "Upload your first file to start using your CloudVault storage."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          <Upload className="h-4 w-4" />
          Upload files
        </button>
      )}
    </div>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState({
  view,
}: {
  view: "grid" | "list";
}) {
  if (view === "list") {
    return (
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
        {Array.from({
          length: 7,
        }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-white/5"
          >
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-white/10" />

            <div className="flex-1">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-white/10" />

              <div className="mt-2 h-3 w-1/5 animate-pulse rounded bg-slate-100 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[190px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

/* =====================================================
   UPLOAD MODAL
===================================================== */

function UploadModal({
  inputRef,
  uploading,
  progress,
  dragActive,
  onClose,
  onUpload,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  uploading: boolean;
  progress: number;
  dragActive: boolean;
  onClose: () => void;
  onUpload: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (
    event: DragEvent<HTMLDivElement>
  ) => void;
  onDrop: (
    event: DragEvent<HTMLDivElement>
  ) => void;
}) {
  return (
    <Modal
      onClose={onClose}
      disabled={uploading}
    >
      <div className="text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
          ) : (
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
          {uploading
            ? "Uploading files"
            : "Upload files"}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          {uploading
            ? "Please keep this window open while your files are being uploaded."
            : "Upload one or multiple files to your CloudVault storage."}
        </p>

        {!uploading ? (
          <>
            <div
              onDragEnter={(event) => {
                event.preventDefault();
                onDragEnter();
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                onDragLeave();
              }}
              onDragOver={onDragOver}
              onDrop={onDrop}
              className={`mt-6 rounded-2xl border-2 border-dashed px-6 py-10 transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              }`}
            >
              <CloudUpload className="mx-auto h-9 w-9 text-slate-400" />

              <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Drag & drop files here
              </p>

              <p className="mt-1 text-xs text-slate-400">
                or choose files from your device
              </p>

              <button
                type="button"
                onClick={() =>
                  inputRef.current?.click()
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <Upload className="h-4 w-4" />
                Choose files
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Maximum file size: 100 MB
            </p>

            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onUpload}
            />
          </>
        ) : (
          <div className="mt-7">

            <div className="mb-2 flex justify-between text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Upload progress
              </span>

              <span className="font-bold text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* =====================================================
   FILE DETAILS MODAL
===================================================== */

function FileDetailsModal({
  file,
  downloading,
  deleting,
  onClose,
  onDownload,
  onDelete,
}: {
  file: FileItem;
  downloading: boolean;
  deleting: boolean;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}) {
  return (
    <Modal onClose={onClose}>

      <div className="flex items-start gap-4 pr-8">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <FileIcon
            type={file.type}
          />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900 dark:text-white">
            {file.name}
          </h2>

          <p className="mt-1 text-xs capitalize text-slate-400">
            {getReadableType(
              file.type
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-white/5">

        <DetailRow
          icon={
            <HardDrive className="h-4 w-4" />
          }
          label="Size"
          value={formatBytes(
            file.size
          )}
        />

        <DetailRow
          icon={
            <Clock3 className="h-4 w-4" />
          }
          label="Modified"
          value={file.modified}
        />

        <DetailRow
          icon={
            <Check className="h-4 w-4" />
          }
          label="Status"
          value="Available"
        />
      </div>

      <div className="mt-6">

        <button
          type="button"
          onClick={onDownload}
          disabled={
            downloading ||
            deleting
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-60"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}

          {downloading
            ? "Preparing download..."
            : "Download file"}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={
            downloading ||
            deleting
          }
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}

          {deleting
            ? "Deleting..."
            : "Delete file"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-500/10 dark:bg-blue-500/5 dark:text-blue-300">
        <Share2 className="h-4 w-4 shrink-0" />

        <span>
          File sharing will be available
          when the backend share API is
          added.
        </span>
      </div>
    </Modal>
  );
}

/* =====================================================
   DETAIL ROW
===================================================== */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0 dark:border-white/5">

      <div className="flex items-center gap-2 text-xs text-slate-400">
        {icon}
        {label}
      </div>

      <span className="max-w-[180px] truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

/* =====================================================
   MODAL
===================================================== */

function Modal({
  children,
  onClose,
  disabled = false,
}: {
  children: ReactNode;
  onClose: () => void;
  disabled?: boolean;
}) {
  function handleBackdrop(
    event: MouseEvent<HTMLDivElement>
  ) {
    if (
      event.target ===
      event.currentTarget
    ) {
      if (!disabled) {
        onClose();
      }
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>
  ) {
    if (
      event.key === "Escape" &&
      !disabled
    ) {
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onMouseDown={
        handleBackdrop
      }
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <div className="relative my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              onClose();
            }
          }}
          disabled={disabled}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {children}
      </div>
    </div>
  );
}

/* =====================================================
   TOAST
===================================================== */

function Toast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  const success =
    toast.type === "success";

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl dark:bg-slate-900 ${
          success
            ? "border-emerald-200 dark:border-emerald-500/20"
            : "border-red-200 dark:border-red-500/20"
        }`}
      >
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            success
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {success
              ? "Success"
              : "Something went wrong"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function getFileTypeFromName(
  fileName: string
): FileType {
  const extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase();

  if (extension === "pdf") {
    return "pdf";
  }

  if (
    [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "bmp",
      "heic",
    ].includes(extension || "")
  ) {
    return "image";
  }

  if (
    [
      "zip",
      "rar",
      "7z",
      "tar",
      "gz",
    ].includes(extension || "")
  ) {
    return "zip";
  }

  return "document";
}

function formatBytes(
  bytes: number
) {
  if (!bytes || bytes <= 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  const value =
    bytes /
    Math.pow(1024, index);

  return `${value.toFixed(
    index === 0
      ? 0
      : value >= 100
      ? 0
      : 1
  )} ${units[index]}`;
}

function getTimestamp(value: unknown) {
  if (!value) return 0;

  const timestamp = new Date(String(value)).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatModifiedDate(
  value: unknown
) {
  if (!value) {
    return "Recently";
  }

  const date =
    new Date(String(value));

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  const now = new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const minutes =
    Math.floor(
      difference / 60000
    );

  const hours =
    Math.floor(
      difference /
        3600000
    );

  const days =
    Math.floor(
      difference /
        86400000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr${
      hours > 1 ? "s" : ""
    } ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getReadableType(
  type: FileType
) {
  switch (type) {
    case "pdf":
      return "PDF document";

    case "image":
      return "Image";

    case "zip":
      return "Archive";

    case "folder":
      return "Folder";

    default:
      return "Document";
  }
}
