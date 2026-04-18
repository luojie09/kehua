import React, { useEffect, useMemo, useRef, useState } from "react";

const DRAFT_STORAGE_KEY = "post_draft";
const POSTS_DB_NAME = "kehua-posts-db";
const POSTS_DB_VERSION = 1;
const POSTS_STORE_NAME = "posts";
const MAX_IMAGES = 9;

function openPostsDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(POSTS_DB_NAME, POSTS_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(POSTS_STORE_NAME)) {
        const store = db.createObjectStore(POSTS_STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("\u65e0\u6cd5\u6253\u5f00\u672c\u5730\u6570\u636e\u5e93"));
  });
}

function createDbClient() {
  return {
    posts: {
      async add(post) {
        const db = await openPostsDatabase();
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(POSTS_STORE_NAME, "readwrite");
          const store = transaction.objectStore(POSTS_STORE_NAME);
          const request = store.add(post);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error || new Error("\u4fdd\u5b58\u52a8\u6001\u5931\u8d25"));
        });
      }
    }
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("\u56fe\u7247\u8bfb\u53d6\u5931\u8d25"));
    reader.readAsDataURL(file);
  });
}

function formatDateTime(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export default function CreatePostPage({ isOpen, onClose, onSaved }) {
  const db = useMemo(() => createDbClient(), []);
  const fileInputRef = useRef(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const draft = window.localStorage.getItem(DRAFT_STORAGE_KEY) || "";
    setContent(draft);
  }, [isOpen]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [images]);

  if (!isOpen) {
    return null;
  }

  const handleContentChange = (event) => {
    const nextValue = event.target.value;
    setContent(nextValue);
    window.localStorage.setItem(DRAFT_STORAGE_KEY, nextValue);
  };

  const handleChooseImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    const acceptedFiles = selectedFiles.slice(0, Math.max(remaining, 0));

    if (remaining <= 0) {
      setToast("\u6700\u591a\u53ea\u80fd\u9009\u62e9 9 \u5f20\u56fe\u7247");
      event.target.value = "";
      return;
    }

    if (acceptedFiles.length < selectedFiles.length) {
      setToast("\u6700\u591a\u53ea\u80fd\u9009\u62e9 9 \u5f20\u56fe\u7247\uff0c\u8d85\u51fa\u7684\u5df2\u5ffd\u7565");
    }

    const nextImages = acceptedFiles.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setImages((prev) => prev.concat(nextImages).slice(0, MAX_IMAGES));
    event.target.value = "";
  };

  const handleRemoveImage = (imageId) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === imageId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== imageId);
    });
  };

  const handleSave = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent && images.length === 0) {
      setToast("\u5199\u70b9\u6587\u5b57\u6216\u9009\u51e0\u5f20\u56fe\u7247\u518d\u53d1\u5e03\u5427");
      return;
    }

    try {
      setIsSaving(true);

      const imagePayload = await Promise.all(
        images.map(async (image) => ({
          id: image.id,
          name: image.file.name,
          type: image.file.type || "image/jpeg",
          base64: await fileToDataUrl(image.file)
        }))
      );

      const newPost = {
        id: `post-${Date.now()}`,
        content: trimmedContent,
        date: formatDateTime(new Date()),
        createdAt: Date.now(),
        images: imagePayload
      };

      await db.posts.add(newPost);

      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setImages([]);
      setContent("");
      setToast("");
      window.dispatchEvent(new CustomEvent("posts-updated"));
      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#F3F3F3]">
        <header
          className="flex items-center justify-between px-5 pt-4"
          style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
        >
          <button type="button" onClick={onClose} className="text-[17px] font-medium text-slate-700">
            {"\u8fd4\u56de"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl bg-[#FF0C5A] px-5 py-2 text-[15px] font-medium text-white disabled:opacity-60"
          >
            {isSaving ? "\u4fdd\u5b58\u4e2d" : "\u4fdd\u5b58"}
          </button>
        </header>

        <main className="flex-1 px-5 pb-8 pt-4">
          <div className="min-h-full rounded-[32px] bg-[#F3F3F3]">
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="\u6211\u60f3\u8bf4..."
              className="h-40 w-full resize-none border-0 bg-transparent px-5 py-6 text-[15px] font-medium leading-7 text-slate-800 outline-none placeholder:text-[#B5B5B5]"
            />

            <div className="px-5 pb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleChooseImages}
              />

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EEEEEE] text-[#99A1AF]"
                >
                  <span className="relative block h-6 w-6">
                    <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full bg-current" />
                    <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current" />
                  </span>
                </button>

                {images.map((image) => (
                  <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white">
                    <img src={image.previewUrl} alt={image.file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-sm text-white"
                      aria-label="\u5220\u9664\u56fe\u7247"
                    >
                      {"\u00d7"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {toast ? (
          <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-sm text-white">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}
