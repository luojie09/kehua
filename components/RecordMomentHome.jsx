import React, { useEffect, useMemo, useRef, useState } from "react";

import CreatePostPage from "./CreatePostPage";

const BACKGROUND_STORAGE_KEY = "record_moment_background";
const DRAFT_STORAGE_KEY = "post_draft";

const DEFAULT_BACKGROUND = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 536">
    <defs>
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#dbe8d4" />
        <stop offset="42%" stop-color="#b7d19b" />
        <stop offset="100%" stop-color="#eff2eb" />
      </linearGradient>
      <linearGradient id="road" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#4a4a48" />
        <stop offset="100%" stop-color="#1f2325" />
      </linearGradient>
    </defs>
    <rect width="393" height="536" fill="url(#bg)" />
    <rect x="0" y="0" width="393" height="164" fill="#d8ead0" opacity="0.7" />
    <path d="M112 536C118 432 136 324 172 228C200 154 236 92 284 34L393 0V536H112Z" fill="#d7cab3" opacity="0.84" />
    <path d="M0 536C20 366 56 250 112 176C150 126 196 82 250 44L305 44C236 112 190 188 162 272C132 363 118 451 108 536H0Z" fill="url(#road)" />
    <path d="M88 536C98 446 112 364 138 294C170 208 220 132 284 58" fill="none" stroke="#f3eee0" stroke-width="8" stroke-linecap="round" />
    <ellipse cx="168" cy="418" rx="46" ry="12" fill="#8da18a" opacity="0.35" />
    <ellipse cx="166" cy="420" rx="34" ry="8" fill="#d6ddd6" opacity="0.8" />
    <ellipse cx="220" cy="444" rx="22" ry="6" fill="#9cb19d" opacity="0.3" />
    <g fill="#2d3a2d">
      <rect x="274" y="128" width="7" height="220" rx="3.5" />
      <circle cx="278" cy="116" r="34" />
      <circle cx="254" cy="134" r="26" />
      <circle cx="304" cy="142" r="28" />
      <rect x="214" y="102" width="6" height="176" rx="3" />
      <circle cx="218" cy="92" r="28" />
      <circle cx="200" cy="108" r="20" />
      <circle cx="238" cy="110" r="22" />
      <rect x="338" y="86" width="6" height="188" rx="3" />
      <circle cx="340" cy="74" r="26" />
      <circle cx="322" cy="88" r="19" />
      <circle cx="360" cy="90" r="20" />
    </g>
  </svg>
`)}`;

const WEEKDAY_LABELS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

function formatTodayLabel(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}月${day}日 ${WEEKDAY_LABELS[date.getDay()]}`;
}

function HomeIcon({ active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-7 w-7 transition-colors ${active ? "text-slate-900" : "text-slate-400"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-6.75h4.5V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-slate-400 transition-colors"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21a8.97 8.97 0 0 0 6.325-2.615M12 21a8.97 8.97 0 0 1-6.325-2.615M12 21c1.977 0 3.75-3.582 3.75-8S13.977 5 12 5s-3.75 3.582-3.75 8 1.773 8 3.75 8ZM2.458 12h19.084M2.458 12A9.03 9.03 0 0 1 5.675 5.385M21.542 12a9.03 9.03 0 0 0-3.217-6.615" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-slate-400 transition-colors"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path d="M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75a17.933 17.933 0 0 1-7.499-1.632Z" />
    </svg>
  );
}

function readStoredDraft() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem(DRAFT_STORAGE_KEY) || "";
}

export default function RecordMomentHome() {
  const [backgroundUrl, setBackgroundUrl] = useState(DEFAULT_BACKGROUND);
  const [draftPreview, setDraftPreview] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const backgroundInputRef = useRef(null);

  const todayLabel = useMemo(() => formatTodayLabel(new Date()), []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const storedBackground = window.localStorage.getItem(BACKGROUND_STORAGE_KEY);
    if (storedBackground) {
      setBackgroundUrl(storedBackground);
    }

    setDraftPreview(readStoredDraft());

    const handleStorage = (event) => {
      if (event.key === DRAFT_STORAGE_KEY) {
        setDraftPreview(event.newValue || "");
      }

      if (event.key === BACKGROUND_STORAGE_KEY && event.newValue) {
        setBackgroundUrl(event.newValue);
      }
    };

    const handlePostsUpdated = () => {
      setDraftPreview(readStoredDraft());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("posts-updated", handlePostsUpdated);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("posts-updated", handlePostsUpdated);
    };
  }, []);

  const handleBackgroundUpload = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : DEFAULT_BACKGROUND;
      setBackgroundUrl(result);
      window.localStorage.setItem(BACKGROUND_STORAGE_KEY, result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleComposerClose = () => {
    setIsComposerOpen(false);
    setDraftPreview(readStoredDraft());
  };

  const draftHint = draftPreview.trim() || "\u6211\u60f3\u8bf4...";

  return (
    <>
      <div className="min-h-screen bg-[#F3F3F3] text-slate-900">
        <input
          ref={backgroundInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBackgroundUpload}
        />

        <div className="mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-[#F3F3F3] pb-28">
          <main>
            <section
              role="button"
              tabIndex={0}
              onClick={() => backgroundInputRef.current && backgroundInputRef.current.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  if (backgroundInputRef.current) {
                    backgroundInputRef.current.click();
                  }
                }
              }}
              className="relative h-[536px] w-full cursor-pointer overflow-hidden outline-none"
            >
              <img src={backgroundUrl} alt={"此刻背景图"} className="h-full w-full object-cover" />
              <div className="absolute bottom-0 h-[132px] w-full bg-gradient-to-b from-transparent via-[#F3F3F3]/80 to-[#F3F3F3]" />

              <div className="absolute inset-x-0 bottom-0 px-6 pb-2">
                <p className="mb-1 text-xs text-gray-500">{todayLabel}</p>
                <h2 className="text-[20px] font-semibold leading-7 text-black">{"此刻，说你想说的话~"}</h2>
              </div>
            </section>

            <section className="-mt-1 px-4">
              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="flex min-h-[524px] w-full rounded-[32px] bg-white p-6 text-left shadow-[0_16px_48px_rgba(0,0,0,0.04)]"
              >
                <span className={`${draftPreview ? "text-slate-700" : "text-[#B5B5B5]"} text-base leading-7`}>
                  {draftHint}
                </span>
              </button>
            </section>
          </main>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-20 pb-[max(env(safe-area-inset-bottom),0.25rem)]">
            <button type="button" aria-label={"主页"} className="flex h-10 w-10 items-center justify-center">
              <HomeIcon active />
            </button>
            <button type="button" aria-label={"消息"} className="flex h-10 w-10 items-center justify-center">
              <MessageIcon />
            </button>
            <button type="button" aria-label={"我的"} className="flex h-10 w-10 items-center justify-center">
              <ProfileIcon />
            </button>
          </div>
        </nav>
      </div>

      <CreatePostPage
        isOpen={isComposerOpen}
        onClose={handleComposerClose}
        onSaved={() => setDraftPreview("")}
      />
    </>
  );
}
