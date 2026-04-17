const STORAGE_KEY = "atom-journey-profile-page";
const PROFILE_PREFERENCES_KEY = "atom-journey-profile-preferences";
const INDEXED_DB_NAME = "atom-journey-profile-db";
const INDEXED_DB_VERSION = 1;
const INDEXED_DB_STORE = "appState";
const INDEXED_DB_RECORD = "session";

const TIMESTAMP_LINE_REGEX =
  /^(\d{4})\D(\d{1,2})\D(\d{1,2})\D\s+(\d{1,2}):(\d{2}):(\d{2})$/;
const MEDIA_REFERENCE_REGEX = /^\[([^\]:锛歕n]{1,8})\s*[锛?]\s*(.+?)\]$/u;
const IMAGE_FILE_REGEX = /\.(avif|bmp|gif|jpe?g|png|webp)$/i;
const VIDEO_FILE_REGEX = /\.(m4v|mov|mp4|webm)$/i;
const DEFAULT_COVER_IMAGE = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393 388">
    <defs>
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#f5f6f8"/>
        <stop offset="55%" stop-color="#eceff3"/>
        <stop offset="100%" stop-color="#e1e5ea"/>
      </linearGradient>
      <radialGradient id="soft" cx="32%" cy="28%" r="62%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
        <stop offset="42%" stop-color="#eef1f5" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#cfd6de" stop-opacity="0.88"/>
      </radialGradient>
      <radialGradient id="mist" cx="70%" cy="24%" r="44%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="393" height="388" fill="url(#bg)"/>
    <circle cx="132" cy="168" r="108" fill="url(#soft)"/>
    <circle cx="294" cy="74" r="78" fill="url(#mist)"/>
    <path d="M0 302C76 270 158 264 236 278C298 288 348 312 393 344V388H0V302Z" fill="#d7dce2" fill-opacity="0.8"/>
    <path d="M0 326C92 300 206 304 312 334C342 342 370 353 393 368V388H0V326Z" fill="#c8d0d8" fill-opacity="0.72"/>
  </svg>
`);
const DEFAULT_AVATAR_IMAGE = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112">
    <defs>
      <linearGradient id="avatarBg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#f7f8fa"/>
        <stop offset="100%" stop-color="#dfe4ea"/>
      </linearGradient>
      <linearGradient id="avatarShape" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#c9d0d8"/>
        <stop offset="100%" stop-color="#aab4bf"/>
      </linearGradient>
    </defs>
    <rect width="112" height="112" rx="56" fill="url(#avatarBg)"/>
    <circle cx="56" cy="44" r="19" fill="url(#avatarShape)"/>
    <path d="M20 96C24 74 40 64 56 64C72 64 88 74 92 96H20Z" fill="url(#avatarShape)"/>
    <circle cx="36" cy="30" r="24" fill="#ffffff" fill-opacity="0.26"/>
  </svg>
`);
const DEFAULT_MEDIA_IMAGE = createSvgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 960">
    <defs>
      <linearGradient id="mediaBg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#f7f8fa"/>
        <stop offset="100%" stop-color="#e6eaf0"/>
      </linearGradient>
    </defs>
    <rect width="720" height="960" rx="48" fill="url(#mediaBg)"/>
    <circle cx="252" cy="292" r="72" fill="#d3dae3"/>
    <path d="M124 708L280 514L392 632L480 548L596 708H124Z" fill="#c2ccd8"/>
  </svg>
`);

const sampleData = {
  profile: {
    name: "可话er",
    vip: true,
    city: "太阳系",
    constellation: "开心座",
    entriesCount: 0,
    ipLocation: "地球村",
    gender: "male",
    avatar: ""
  },
  posts: []
};

const isClientRuntime = typeof window !== "undefined" && typeof document !== "undefined";
const storedData = isClientRuntime ? loadStoredData() : null;
const profilePreferences = isClientRuntime
  ? loadProfilePreferences()
  : {
      city: sampleData.profile.city,
      constellation: sampleData.profile.constellation,
      ipLocation: sampleData.profile.ipLocation
    };

const elements = {
  phoneScreen: document.getElementById("phoneScreen"),
  fastScroller: document.getElementById("fastScroller"),
  fastScrollerThumb: document.getElementById("fastScrollerThumb"),
  coverImage: document.getElementById("coverImage"),
  coverInput: document.getElementById("coverInput"),
  coverEditButton: document.getElementById("coverEditButton"),
  profileName: document.getElementById("profileName"),
  profileMeta: document.getElementById("profileMeta"),
  profileSubmetaRow: document.getElementById("profileSubmetaRow"),
  ipLocation: document.getElementById("ipLocation"),
  avatarImage: document.getElementById("avatarImage"),
  avatarInput: document.getElementById("avatarInput"),
  avatarEditButton: document.getElementById("avatarEditButton"),
  avatarLetter: document.getElementById("avatarLetter"),
  postsContainer: document.getElementById("postsContainer"),
  searchView: document.getElementById("searchView"),
  searchBackButton: document.getElementById("searchBackButton"),
  searchInput: document.getElementById("searchInput"),
  searchResults: document.getElementById("searchResults"),
  searchSummary: document.getElementById("searchSummary"),
  detailView: document.getElementById("detailView"),
  detailBackButton: document.getElementById("detailBackButton"),
  detailTime: document.getElementById("detailTime"),
  detailText: document.getElementById("detailText"),
  detailGallery: document.getElementById("detailGallery"),
  editProfileButton: document.getElementById("editProfileButton"),
  profileEditView: document.getElementById("profileEditView"),
  profileEditBackButton: document.getElementById("profileEditBackButton"),
  profileEditForm: document.getElementById("profileEditForm"),
  cityInput: document.getElementById("cityInput"),
  constellationInput: document.getElementById("constellationInput"),
  ipInput: document.getElementById("ipInput"),
  lightboxView: document.getElementById("lightboxView"),
  lightboxStage: document.getElementById("lightboxStage"),
  lightboxClose: document.getElementById("lightboxClose"),
  lightboxDownload: document.getElementById("lightboxDownload"),
  lightboxImage: document.getElementById("lightboxImage"),
  statusMessage: document.getElementById("statusMessage"),
  importSummary: document.getElementById("importSummary"),
  initLoading: document.getElementById("initLoading"),
  fileInput: document.getElementById("fileInput"),
  importFileButton: document.querySelector(".file-button"),
  clearSessionButton: document.getElementById("clearSessionButton"),
  settingsButton: document.getElementById("settingsButton"),
  settingsClose: document.getElementById("settingsClose"),
  settingsMenu: document.getElementById("settingsMenu"),
  settingsBackdrop: document.getElementById("settingsBackdrop"),
  searchButton: document.getElementById("searchButton"),
  postTemplate: document.getElementById("postTemplate")
};

let currentImportMode = storedData ? "json" : "sample";
let currentData = normalizeData(storedData ?? sampleData);
let zipMediaEntries = new Map();
let zipMediaUrlCache = new Map();
let mediaObserver = null;
let coverPreviewUrl = "";
let avatarPreviewUrl = "";
let coverPreviewBlob = null;
let avatarPreviewBlob = null;
let persistedZipFile = null;
let persistedZipFileName = "";
let indexedDbPromise = null;
let persistStatePromise = Promise.resolve();
let isHydratingPersistedState = false;
let activeView = "home";
let detailReturnView = "home";
let currentDetailPostId = "";
let currentLightboxUrl = "";
let lightboxLongPressTimer = null;
let pendingMediaHydrationFrame = 0;
let isInitializing = true;
let currentLightboxItems = [];
let currentLightboxIndex = -1;
let lightboxTouchStartX = 0;
let lightboxTouchStartY = 0;
let lightboxIgnoreClickUntil = 0;
let lightboxRenderToken = 0;
let fastScrollerHideTimer = null;
let isFastScrollerDragging = false;
let pendingImportSuccessPayload = null;
let modalHistoryDepth = 0;
let modalHistorySequence = 0;
let suppressNextPopstateClose = false;

function createSvgDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function getModalDepthFromState(state) {
  if (!state || typeof state !== "object") {
    return 0;
  }

  const depth = Number(state.__kehuaModalDepth);
  return Number.isFinite(depth) && depth >= 0 ? depth : 0;
}

function ensureHistoryStateInitialized() {
  if (!isClientRuntime) {
    return;
  }

  const currentState = window.history.state;
  const nextDepth = getModalDepthFromState(currentState);

  modalHistoryDepth = nextDepth;

  if (currentState?.__kehuaApp) {
    return;
  }

  window.history.replaceState(
    {
      ...(currentState && typeof currentState === "object" ? currentState : {}),
      __kehuaApp: true,
      __kehuaModalDepth: nextDepth
    },
    "",
    window.location.href
  );
}

function pushModalHistoryEntry(type) {
  if (!isClientRuntime) {
    return;
  }

  ensureHistoryStateInitialized();
  modalHistoryDepth += 1;
  modalHistorySequence += 1;
  window.history.pushState(
    {
      __kehuaApp: true,
      __kehuaModal: type,
      __kehuaModalDepth: modalHistoryDepth,
      __kehuaModalSeq: modalHistorySequence
    },
    "",
    window.location.href
  );
}

function syncManualCloseWithHistory(closeFn) {
  closeFn();

  if (!isClientRuntime || modalHistoryDepth <= 0) {
    return;
  }

  suppressNextPopstateClose = true;
  window.history.back();
}

function getTopOverlayType() {
  if (!elements.lightboxView.classList.contains("is-hidden")) {
    return "lightbox";
  }

  if (activeView === "detail") {
    return "detail";
  }

  if (activeView === "profileEdit") {
    return "profileEdit";
  }

  if (activeView === "search") {
    return "search";
  }

  if (!elements.settingsMenu.classList.contains("is-hidden")) {
    return "settings";
  }

  return "";
}

function closeTopOverlayFromHistory() {
  const topOverlayType = getTopOverlayType();

  if (topOverlayType === "lightbox") {
    closeLightbox({ fromHistory: true });
    return true;
  }

  if (topOverlayType === "detail") {
    closeDetailView({ fromHistory: true });
    return true;
  }

  if (topOverlayType === "profileEdit") {
    closeProfileEditView({ fromHistory: true });
    return true;
  }

  if (topOverlayType === "search") {
    closeSearchView({ fromHistory: true });
    return true;
  }

  if (topOverlayType === "settings") {
    closeSettingsMenu({ fromHistory: true });
    return true;
  }

  return false;
}

function closeTopOverlayManually() {
  const topOverlayType = getTopOverlayType();

  if (topOverlayType === "lightbox") {
    closeLightbox();
    return true;
  }

  if (topOverlayType === "detail") {
    closeDetailView();
    return true;
  }

  if (topOverlayType === "profileEdit") {
    closeProfileEditView();
    return true;
  }

  if (topOverlayType === "search") {
    closeSearchView();
    return true;
  }

  if (topOverlayType === "settings") {
    closeSettingsMenu();
    return true;
  }

  return false;
}

function handlePopState(event) {
  modalHistoryDepth = getModalDepthFromState(event.state);

  if (suppressNextPopstateClose) {
    suppressNextPopstateClose = false;
    return;
  }

  closeTopOverlayFromHistory();
}

function trackImportError(error) {
  window.posthog.capture("import_error", {
    error_reason: optionalString(error?.message) || "鏈煡閿欒"
  });
}

function loadStoredData() {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);

    if (isLegacySampleSnapshot(parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Stored profile data is invalid, using sample data instead.", error);
    return null;
  }
}

function isLegacySampleSnapshot(data) {
  return (
    data?.profile?.name === "\u539f\u5b50\u65c5\u9014" &&
    Number(data?.profile?.entriesCount) === 636 &&
    Array.isArray(data?.posts) &&
    data.posts.length <= 1
  );
}

function loadProfilePreferences() {
  const raw = window.localStorage.getItem(PROFILE_PREFERENCES_KEY);

  if (!raw) {
    return {
      city: sampleData.profile.city,
      constellation: sampleData.profile.constellation,
      ipLocation: sampleData.profile.ipLocation
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      city: stringOrFallback(parsed?.city, sampleData.profile.city),
      constellation: stringOrFallback(parsed?.constellation, sampleData.profile.constellation),
      ipLocation: stringOrFallback(parsed?.ipLocation, sampleData.profile.ipLocation)
    };
  } catch (error) {
    console.warn("Stored profile preferences are invalid, using defaults instead.", error);
    return {
      city: sampleData.profile.city,
      constellation: sampleData.profile.constellation,
      ipLocation: sampleData.profile.ipLocation
    };
  }
}

function persistProfilePreferences() {
  window.localStorage.setItem(PROFILE_PREFERENCES_KEY, JSON.stringify(profilePreferences));
}

function normalizeData(input) {
  const profile = input?.profile ?? {};
  const posts = Array.isArray(input?.posts) ? input.posts : [];

  return {
    profile: {
      name: stringOrFallback(profile.name, sampleData.profile.name),
      vip: profile.vip !== false,
      city: stringOrFallback(profile.city, profilePreferences.city),
      constellation: stringOrFallback(profile.constellation, profilePreferences.constellation),
      entriesCount: numberOrFallback(profile.entriesCount, posts.length || sampleData.profile.entriesCount),
      ipLocation: stringOrFallback(profile.ipLocation, profilePreferences.ipLocation),
      gender: profile.gender === "female" ? "female" : "male",
      avatar: optionalString(profile.avatar)
    },
    posts: posts.map((post, index) => normalizePost(post, index))
  };
}

function normalizePost(post, index) {
  const media = Array.isArray(post?.media)
    ? post.media.map(normalizeMediaItem).filter(Boolean)
    : Array.isArray(post?.images)
      ? post.images.map(normalizeMediaItem).filter(Boolean)
      : Array.from({ length: numberOrFallback(post?.imageCount, 0) }, (_, itemIndex) => ({
          type: "image",
          filename: `placeholder-${index + 1}-${itemIndex + 1}.jpg`,
          lookupKey: "",
          url: ""
        }));

  return {
    id: stringOrFallback(post?.id, `post-${index + 1}`),
    timestamp: stringOrFallback(post?.timestamp, "2025-12-13 13:44"),
    text: typeof post?.text === "string" ? post.text : "",
    media
  };
}

function normalizeMediaItem(item) {
  if (!item) {
    return null;
  }

  if (typeof item === "string" && item.trim()) {
    return {
      type: detectMediaType(item),
      filename: baseName(item),
      lookupKey: "",
      url: item.trim()
    };
  }

  if (typeof item !== "object") {
    return null;
  }

  const filename = optionalString(item.filename);
  const url = optionalString(item.url);

  return {
    type: item.type === "video" ? "video" : detectMediaType(filename || url),
    filename,
    lookupKey: optionalString(item.lookupKey).toLowerCase(),
    url
  };
}

function optionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function stringOrFallback(value, fallback) {
  return optionalString(value) || fallback;
}

function numberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function getIndexedDb() {
  if (!("indexedDB" in window)) {
    return Promise.resolve(null);
  }

  if (indexedDbPromise) {
    return indexedDbPromise;
  }

  indexedDbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
        db.createObjectStore(INDEXED_DB_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB unavailable."));
  });

  return indexedDbPromise;
}

async function readPersistedState() {
  const db = await getIndexedDb();

  if (!db) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(INDEXED_DB_STORE, "readonly");
    const store = transaction.objectStore(INDEXED_DB_STORE);
    const request = store.get(INDEXED_DB_RECORD);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error || new Error("Failed to read IndexedDB state."));
  });
}

async function writePersistedState(record) {
  const db = await getIndexedDb();

  if (!db) {
    return;
  }

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(INDEXED_DB_STORE, "readwrite");
    const store = transaction.objectStore(INDEXED_DB_STORE);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Failed to write IndexedDB state."));

    store.put({
      id: INDEXED_DB_RECORD,
      ...record
    });
  });
}

function queuePersistedState(record) {
  const importSuccessPayload = pendingImportSuccessPayload;
  pendingImportSuccessPayload = null;

  persistStatePromise = persistStatePromise
    .catch(() => undefined)
    .then(() => writePersistedState(record))
    .then(() => {
      if (importSuccessPayload) {
        window.posthog.capture("import_success", importSuccessPayload);
      }
    })
    .catch((error) => {
      console.warn("Failed to persist app state.", error);

      if (importSuccessPayload) {
        trackImportError(error);
      }
    });
}

function persistData() {
  if (isHydratingPersistedState || isInitializing) {
    return;
  }

  const snapshot = buildDebugData(currentData);

  if (currentImportMode === "zip") {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot, null, 2));
  }

  queuePersistedState({
    importMode: currentImportMode,
    data: snapshot,
    zipFile: currentImportMode === "zip" ? persistedZipFile : null,
    zipFileName: currentImportMode === "zip" ? persistedZipFileName : "",
    coverBlob: coverPreviewBlob,
    avatarBlob: avatarPreviewBlob,
    updatedAt: Date.now()
  });
}

function buildDebugData(data) {
  return {
    profile: { ...data.profile },
    posts: data.posts.map((post) => ({
      id: post.id,
      timestamp: post.timestamp,
      text: post.text,
      media: post.media.map((mediaItem) => {
        const exportItem = {
          type: mediaItem.type,
          filename: mediaItem.filename
        };

        if (mediaItem.url && !mediaItem.url.startsWith("blob:")) {
          exportItem.url = mediaItem.url;
        }

        return exportItem;
      })
    }))
  };
}

function updateStatus(message, type = "") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.remove("is-error", "is-success", "is-loading");

  if (type) {
    elements.statusMessage.classList.add(type);
  }
}

function updateImportSummary() {
  const postCount = currentData.posts.length;
  const mediaCount = currentData.posts.reduce((sum, post) => sum + post.media.length, 0);

  if (currentImportMode === "zip") {
    elements.importSummary.textContent = `\u5df2\u5bfc\u5165 ZIP\uff1a${postCount} \u6761\u52a8\u6001\uff0c${mediaCount} \u4e2a\u56fe\u7247/\u89c6\u9891\u3002`;
    return;
  }

  if (currentImportMode === "json") {
    elements.importSummary.textContent = `\u5f53\u524d\u662f\u8c03\u8bd5 JSON\uff1a${postCount} \u6761\u52a8\u6001\uff0c${mediaCount} \u4e2a\u56fe\u7247/\u89c6\u9891\u3002`;
    return;
  }

  elements.importSummary.textContent = "\u5f53\u524d\u672a\u5bfc\u5165 ZIP\uff0c\u5c55\u793a\u9ed8\u8ba4\u8d44\u6599\u3002";
}

function toggleBusyState(isBusy) {
  elements.fileInput.disabled = isBusy;
}

function openSettingsMenu() {
  if (!elements.settingsMenu.classList.contains("is-hidden")) {
    return;
  }

  syncOverlayViewport();
  elements.settingsMenu.classList.remove("is-hidden");
  elements.settingsBackdrop.classList.remove("is-hidden");
  elements.settingsMenu.setAttribute("aria-hidden", "false");
  refreshOverlayState();
  pushModalHistoryEntry("settings");
}

function closeSettingsMenu(options = {}) {
  if (elements.settingsMenu.classList.contains("is-hidden")) {
    return;
  }

  const { fromHistory = false, skipHistory = false } = options;
  const applyClose = () => {
    elements.settingsMenu.classList.add("is-hidden");
    elements.settingsBackdrop.classList.add("is-hidden");
    elements.settingsMenu.setAttribute("aria-hidden", "true");
    refreshOverlayState();
  };

  if (skipHistory || fromHistory) {
    applyClose();
    return;
  }

  syncManualCloseWithHistory(applyClose);
}

function toggleSettingsMenu() {
  const shouldOpen = elements.settingsMenu.classList.contains("is-hidden");

  if (shouldOpen) {
    openSettingsMenu();
    return;
  }

  closeSettingsMenu();
}

function syncOverlayViewport() {
  elements.phoneScreen.style.setProperty("--overlay-top", `${elements.phoneScreen.scrollTop}px`);
  elements.phoneScreen.style.setProperty("--overlay-height", `${elements.phoneScreen.clientHeight}px`);
}

function refreshOverlayState() {
  const hasOverlay =
    activeView !== "home" ||
    !elements.settingsMenu.classList.contains("is-hidden") ||
    !elements.lightboxView.classList.contains("is-hidden");

  if (hasOverlay) {
    syncOverlayViewport();
  }

  elements.phoneScreen.classList.toggle("is-overlay-active", hasOverlay);
  elements.fastScroller.classList.toggle("is-hidden", hasOverlay);
}

function clearFastScrollerHideTimer() {
  if (!fastScrollerHideTimer) {
    return;
  }

  window.clearTimeout(fastScrollerHideTimer);
  fastScrollerHideTimer = null;
}

function showFastScrollerTemporarily() {
  if (activeView !== "home") {
    return;
  }

  clearFastScrollerHideTimer();
  elements.fastScroller.classList.add("is-visible");

  if (isFastScrollerDragging) {
    return;
  }

  fastScrollerHideTimer = window.setTimeout(() => {
    elements.fastScroller.classList.remove("is-visible");
    fastScrollerHideTimer = null;
  }, 900);
}

function updateFastScrollerThumb() {
  const scrollableHeight =
    elements.phoneScreen.scrollHeight - elements.phoneScreen.clientHeight;
  const trackHeight = elements.fastScroller.clientHeight;
  const thumbHeight = elements.fastScrollerThumb.offsetHeight || 56;
  const maxThumbOffset = Math.max(trackHeight - thumbHeight, 0);

  if (scrollableHeight <= 0 || maxThumbOffset <= 0) {
    elements.fastScroller.classList.add("is-hidden");
    elements.fastScrollerThumb.style.top = "0px";
    return;
  }

  if (activeView !== "home") {
    return;
  }

  elements.fastScroller.classList.remove("is-hidden");
  const progress = elements.phoneScreen.scrollTop / scrollableHeight;
  const thumbOffset = maxThumbOffset * progress;
  elements.fastScrollerThumb.style.top = `${thumbOffset}px`;
}

function scrollWithFastScroller(clientY) {
  const rect = elements.fastScroller.getBoundingClientRect();
  const scrollableHeight =
    elements.phoneScreen.scrollHeight - elements.phoneScreen.clientHeight;

  if (scrollableHeight <= 0 || rect.height <= 0) {
    return;
  }

  const relativeY = Math.min(Math.max(clientY - rect.top, 0), rect.height);
  const progress = relativeY / rect.height;
  const targetY = scrollableHeight * progress;
  elements.phoneScreen.scrollTo({ top: targetY, behavior: "auto" });
  updateFastScrollerThumb();
}

function handleFastScrollerPointerStart(clientY) {
  if (activeView !== "home") {
    return;
  }

  isFastScrollerDragging = true;
  showFastScrollerTemporarily();
  scrollWithFastScroller(clientY);
}

function handleFastScrollerPointerMove(clientY) {
  if (!isFastScrollerDragging) {
    return;
  }

  scrollWithFastScroller(clientY);
}

function handleFastScrollerPointerEnd() {
  if (!isFastScrollerDragging) {
    return;
  }

  isFastScrollerDragging = false;
  showFastScrollerTemporarily();
}

function render() {
  const { profile, posts } = currentData;
  const metaBits = [profile.city, profile.constellation, `${profile.entriesCount} \u6761`].filter(Boolean);
  const avatarWrap = elements.avatarImage.parentElement;
  const coverSource = coverPreviewUrl || DEFAULT_COVER_IMAGE;
  const avatarSource = avatarPreviewUrl || profile.avatar || DEFAULT_AVATAR_IMAGE;

  elements.profileName.textContent = profile.name;
  elements.profileMeta.textContent = metaBits.join(" ");
  elements.ipLocation.textContent = profile.ipLocation;
  elements.profileSubmetaRow.classList.toggle("is-hidden", !profile.ipLocation);
  elements.avatarLetter.textContent = (profile.name.trim().slice(0, 1) || "\u539f").toUpperCase();
  elements.coverImage.src = coverSource;

  if (avatarSource) {
    elements.avatarImage.src = avatarSource;
    elements.avatarImage.alt = `${profile.name} \u7684\u5934\u50cf`;
    avatarWrap.classList.add("has-image");
  } else {
    elements.avatarImage.removeAttribute("src");
    avatarWrap.classList.remove("has-image");
  }

  document.querySelectorAll(".vip-badge").forEach((badge) => {
    badge.classList.toggle("is-hidden", !profile.vip);
  });

  renderPostList(elements.postsContainer, posts, {
    emptyMessage: "\u6682\u65e0\u52a8\u6001\uff0c\u5bfc\u5165 ZIP \u540e\u4f1a\u663e\u793a\u5728\u8fd9\u91cc\u3002"
  });

  updateSearchResults();
  renderCurrentDetailIfNeeded();
  updateImportSummary();
  elements.initLoading.classList.remove("is-visible");
  updateFastScrollerThumb();
  persistData();
}

function renderInitializationState() {
  elements.initLoading.classList.add("is-visible");
  elements.postsContainer.innerHTML =
    '<article class="post-card"><p class="post-text is-empty">姝ｅ湪鎭㈠浣犱笂娆＄殑鏁版嵁...</p></article>';
}

function renderPostList(container, posts, options = {}) {
  const {
    emptyMessage = "\u6682\u65e0\u76f8\u5173\u52a8\u6001\u3002",
    truncateText = true
  } = options;

  container.innerHTML = "";

  if (posts.length === 0) {
    container.innerHTML = `<article class="post-card"><p class="post-text is-empty">${emptyMessage}</p></article>`;
    return;
  }

  posts.forEach((post) => {
    const fragment = elements.postTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".post-card");
    const time = fragment.querySelector(".post-time");
    const text = fragment.querySelector(".post-text");
    const gallery = fragment.querySelector(".post-gallery");
    const moreButton = fragment.querySelector(".more-button");

    card.dataset.postId = post.id;
    time.textContent = post.timestamp;
    moreButton.dataset.postId = post.id;
    card.classList.add("post-card-clickable");
    setPostText(text, post, truncateText);
    buildGallery(gallery, post.media, {
      removeEmpty: true,
      postId: post.id
    });
    container.appendChild(fragment);
  });
}

function setPostText(node, post, truncateText = true) {
  const cleanText = post.text.trim();

  if (!cleanText) {
    node.textContent = "";
    node.classList.add("is-empty");
    return;
  }

  if (!truncateText || cleanText.length <= 92) {
    node.textContent = cleanText;
    return;
  }

  const excerpt = `${cleanText.slice(0, 92)}...`;
  node.textContent = excerpt;

  const more = document.createElement("span");
  more.className = "expand-link";
  more.textContent = "更多";
  more.dataset.postId = post.id;
  more.setAttribute("role", "button");
  more.setAttribute("tabindex", "0");
  node.appendChild(more);
}

function buildGallery(container, media, options = {}) {
  const { removeEmpty = false, postId = "", eagerHydrate = false } = options;

  container.innerHTML = "";

  if (media.length === 0) {
    if (removeEmpty) {
      container.remove();
      return;
    }

    container.classList.add("is-hidden");
    return;
  }

  container.classList.remove("is-hidden");

  media.slice(0, 9).forEach((mediaItem, mediaIndex) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    renderGalleryItem(item, mediaItem, {
      postId,
      mediaIndex,
      eagerHydrate
    });
    container.appendChild(item);
  });

  if (eagerHydrate) {
    container.querySelectorAll(".gallery-item.is-pending").forEach((node) => {
      void hydrateMediaNode(node);
    });
    return;
  }

  schedulePendingMediaHydration();
}

function findPostById(postId) {
  return currentData.posts.find((post) => post.id === postId) ?? null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlightText(text, keyword) {
  const safeText = escapeHtml(text);
  if (!keyword) {
    return safeText;
  }

  const pattern = new RegExp(`(${escapeRegExp(keyword)})`, "gi");
  return safeText.replace(pattern, '<mark class="search-hit">$1</mark>');
}

function updateSearchResults(options = {}) {
  const { shouldTrack = false } = options;
  const keyword = optionalString(elements.searchInput.value);

  if (!keyword) {
    elements.searchSummary.textContent = "\u8f93\u5165\u5173\u952e\u8bcd\u641c\u7d22\u52a8\u6001";
    elements.searchResults.innerHTML = "";
    return;
  }

  const normalizedKeyword = keyword.toLowerCase();
  const results = currentData.posts.filter((post) => {
    const haystack = `${post.timestamp}\n${post.text}`.toLowerCase();
    return haystack.includes(normalizedKeyword);
  });

  elements.searchSummary.textContent = `\u627e\u5230 ${results.length} \u6761\u548c\u201c${keyword}\u201d\u76f8\u5173\u7684\u52a8\u6001`;
  if (shouldTrack) {
    window.posthog.capture("search_perform", { has_result: results.length > 0 });
  }

  renderPostList(elements.searchResults, results, {
    emptyMessage: `\u6ca1\u6709\u627e\u5230\u548c\u201c${keyword}\u201d\u76f8\u5173\u7684\u52a8\u6001\u3002`
  });

  elements.searchResults.querySelectorAll(".post-card").forEach((card) => {
    const postId = card.dataset.postId;
    const post = findPostById(postId);
    const textNode = card.querySelector(".post-text");

    if (!post || !textNode || !optionalString(post.text)) {
      return;
    }

    if (!post.text.toLowerCase().includes(normalizedKeyword)) {
      return;
    }

    const cleanText = post.text.trim();
    const isTruncated = cleanText.length > 92;
    const displayText = isTruncated ? `${cleanText.slice(0, 92)}...` : cleanText;

    textNode.innerHTML = highlightText(displayText, keyword);

    if (isTruncated) {
      const expandLink = document.createElement("span");
      expandLink.className = "expand-link";
      expandLink.textContent = "更多";
      expandLink.dataset.postId = post.id;
      expandLink.setAttribute("role", "button");
      expandLink.setAttribute("tabindex", "0");
      textNode.appendChild(expandLink);
    }
  });
}

function setView(view) {
  activeView = view;
  elements.searchView.classList.toggle("is-hidden", view !== "search");
  elements.searchView.setAttribute("aria-hidden", String(view !== "search"));
  elements.detailView.classList.toggle("is-hidden", view !== "detail");
  elements.detailView.setAttribute("aria-hidden", String(view !== "detail"));
  elements.profileEditView.classList.toggle("is-hidden", view !== "profileEdit");
  elements.profileEditView.setAttribute("aria-hidden", String(view !== "profileEdit"));
  refreshOverlayState();
}

function openSearchView() {
  if (activeView === "search") {
    return;
  }

  closeSettingsMenu({ skipHistory: true });
  closeLightbox({ skipHistory: true });
  setView("search");
  pushModalHistoryEntry("search");

  window.requestAnimationFrame(() => {
    elements.searchInput.focus();
    updateSearchResults();
  });
}

function closeSearchView(options = {}) {
  if (activeView !== "search") {
    return;
  }

  const { fromHistory = false, skipHistory = false } = options;
  const applyClose = () => {
    setView("home");
  };

  if (skipHistory || fromHistory) {
    applyClose();
    return;
  }

  syncManualCloseWithHistory(applyClose);
}

function openProfileEditView() {
  if (activeView === "profileEdit") {
    return;
  }

  closeSettingsMenu({ skipHistory: true });
  closeLightbox({ skipHistory: true });
  elements.cityInput.value = currentData.profile.city;
  elements.constellationInput.value = currentData.profile.constellation;
  elements.ipInput.value = currentData.profile.ipLocation;
  setView("profileEdit");
  pushModalHistoryEntry("profileEdit");
}

function closeProfileEditView(options = {}) {
  if (activeView !== "profileEdit") {
    return;
  }

  const { fromHistory = false, skipHistory = false } = options;
  const applyClose = () => {
    setView("home");
  };

  if (skipHistory || fromHistory) {
    applyClose();
    return;
  }

  syncManualCloseWithHistory(applyClose);
}

function saveProfileDetails(event) {
  event.preventDefault();

  const nextCity = stringOrFallback(elements.cityInput.value, sampleData.profile.city);
  const nextConstellation = stringOrFallback(elements.constellationInput.value, sampleData.profile.constellation);
  const nextIpLocation = stringOrFallback(elements.ipInput.value, sampleData.profile.ipLocation);

  profilePreferences.city = nextCity;
  profilePreferences.constellation = nextConstellation;
  profilePreferences.ipLocation = nextIpLocation;
  persistProfilePreferences();

  currentData.profile.city = nextCity;
  currentData.profile.constellation = nextConstellation;
  currentData.profile.ipLocation = nextIpLocation;

  render();
  closeProfileEditView();
  updateStatus("\u8d44\u6599\u5df2\u4fdd\u5b58\u3002", "is-success");
}

function openDetailView(postId, returnView = activeView) {
  const post = findPostById(postId);

  if (!post) {
    return;
  }

  closeSettingsMenu({ skipHistory: true });
  closeLightbox({ skipHistory: true });
  currentDetailPostId = post.id;
  detailReturnView = returnView;
  renderDetailPost(post);
  window.posthog.capture("view_post_detail");
  setView("detail");
  pushModalHistoryEntry("detail");
}

function renderCurrentDetailIfNeeded() {
  if (!currentDetailPostId) {
    return;
  }

  const post = findPostById(currentDetailPostId);
  if (!post) {
    currentDetailPostId = "";
    setView("home");
    return;
  }

  renderDetailPost(post);
}

function renderDetailPost(post) {
  elements.detailTime.textContent = post.timestamp;
  elements.detailText.classList.toggle("is-empty", !optionalString(post.text));
  elements.detailText.textContent = optionalString(post.text) || "\u8fd9\u6761\u52a8\u6001\u6ca1\u6709\u6587\u5b57\u5185\u5bb9\u3002";
  buildGallery(elements.detailGallery, post.media, {
    removeEmpty: false,
    postId: post.id,
    eagerHydrate: true
  });
}

function closeDetailView(options = {}) {
  if (activeView !== "detail" && !currentDetailPostId) {
    return;
  }

  const { fromHistory = false, skipHistory = false } = options;
  const applyClose = () => {
    const targetView = detailReturnView === "search" ? "search" : "home";
    currentDetailPostId = "";
    setView(targetView);
  };

  if (skipHistory || fromHistory) {
    applyClose();
    return;
  }

  syncManualCloseWithHistory(applyClose);
}

function normalizeLightboxItems(url, filename = "dynamic-image.jpg", previewItems = []) {
  const normalizedItems = (Array.isArray(previewItems) ? previewItems : [])
    .map((item) => ({
      url: optionalString(item?.url),
      filename: optionalString(item?.filename) || "dynamic-image.jpg"
    }))
    .filter((item) => isUsablePreviewUrl(item.url));

  if (normalizedItems.length > 0) {
    return normalizedItems;
  }

  const fallbackUrl = optionalString(url);
  if (!fallbackUrl) {
    return [];
  }

  return [
    {
      url: fallbackUrl,
      filename: optionalString(filename) || "dynamic-image.jpg"
    }
  ].filter((item) => isUsablePreviewUrl(item.url));
}

function setLightboxDownloadTarget(url, filename = "dynamic-image.jpg") {
  elements.lightboxDownload.dataset.url = optionalString(url);
  elements.lightboxDownload.dataset.filename = optionalString(filename) || "dynamic-image.jpg";
}

function renderActiveLightboxItem() {
  const activeItem = currentLightboxItems[currentLightboxIndex];
  const resolvedUrl = optionalString(activeItem?.url);

  if (!resolvedUrl) {
    return false;
  }

  const renderToken = ++lightboxRenderToken;
  currentLightboxUrl = resolvedUrl;
  setLightboxDownloadTarget(resolvedUrl, activeItem?.filename);

  // Reset first to guarantee rerender even when URL repeats.
  elements.lightboxImage.removeAttribute("src");
  elements.lightboxImage.loading = "eager";
  elements.lightboxImage.decoding = "async";
  elements.lightboxImage.onerror = () => {
    if (renderToken !== lightboxRenderToken) {
      return;
    }

    currentLightboxUrl = "";
    updateStatus("\u56fe\u7247\u9884\u89c8\u5931\u8d25\uff1a\u56fe\u7247\u8d44\u6e90\u65e0\u6cd5\u8bfb\u53d6\u3002", "is-error");
  };
  elements.lightboxImage.onload = () => {
    if (renderToken !== lightboxRenderToken) {
      return;
    }
  };
  elements.lightboxImage.src = resolvedUrl;
  elements.lightboxImage.alt = activeItem?.filename || "preview-image";
  return true;
}

function openLightbox(url, filename = "dynamic-image.jpg", previewItems = [], preferredIndex = 0) {
  const wasHidden = elements.lightboxView.classList.contains("is-hidden");
  const normalizedItems = normalizeLightboxItems(url, filename, previewItems);

  if (normalizedItems.length === 0) {
    updateStatus("\u56fe\u7247\u9884\u89c8\u5931\u8d25\uff1a\u672a\u627e\u5230\u6709\u6548\u56fe\u7247\u5730\u5740\u3002", "is-error");
    return;
  }

  const safeIndex = Number.isFinite(preferredIndex) ? preferredIndex : 0;
  currentLightboxItems = normalizedItems;
  currentLightboxIndex = Math.max(0, Math.min(normalizedItems.length - 1, safeIndex));

  if (!renderActiveLightboxItem()) {
    updateStatus("\u56fe\u7247\u9884\u89c8\u5931\u8d25\uff1a\u65e0\u6cd5\u52a0\u8f7d\u56fe\u7247\u3002", "is-error");
    return;
  }

  syncOverlayViewport();
  elements.lightboxView.classList.remove("is-hidden");
  elements.lightboxView.setAttribute("aria-hidden", "false");
  refreshOverlayState();
  window.posthog.capture("image_preview_open");

  if (wasHidden) {
    pushModalHistoryEntry("lightbox");
  }
}

function closeLightbox(options = {}) {
  if (elements.lightboxView.classList.contains("is-hidden")) {
    return;
  }

  const { fromHistory = false, skipHistory = false } = options;
  const applyClose = () => {
    clearTimeout(lightboxLongPressTimer);
    lightboxLongPressTimer = null;
    lightboxRenderToken += 1;
    currentLightboxUrl = "";
    currentLightboxItems = [];
    currentLightboxIndex = -1;
    elements.lightboxView.classList.add("is-hidden");
    elements.lightboxView.setAttribute("aria-hidden", "true");
    elements.lightboxImage.removeAttribute("src");
    elements.lightboxImage.onload = null;
    elements.lightboxImage.onerror = null;
    elements.lightboxImage.alt = "preview-image";
    setLightboxDownloadTarget("", "dynamic-image.jpg");
    refreshOverlayState();
  };

  if (skipHistory || fromHistory) {
    applyClose();
    return;
  }

  syncManualCloseWithHistory(applyClose);
}

function switchLightboxImage(direction) {
  if (currentLightboxItems.length <= 1) {
    return false;
  }

  const offset = direction === "prev" ? -1 : 1;
  const nextIndex = currentLightboxIndex + offset;

  if (nextIndex < 0 || nextIndex >= currentLightboxItems.length) {
    return false;
  }

  currentLightboxIndex = nextIndex;
  const switched = renderActiveLightboxItem();

  if (switched) {
    window.posthog.capture(direction === "prev" ? "image_swipe_prev" : "image_swipe_next");
  }

  return switched;
}

function saveCurrentLightboxImage() {
  const downloadUrl = optionalString(elements.lightboxDownload.dataset.url) || currentLightboxUrl;
  const downloadName = optionalString(elements.lightboxDownload.dataset.filename) || "dynamic-image.jpg";

  if (!downloadUrl) {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = downloadName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function handleLightboxTouchStart(event) {
  const touch = event.touches?.[0];
  if (!touch) {
    return;
  }

  lightboxTouchStartX = touch.clientX;
  lightboxTouchStartY = touch.clientY;
}

function handleLightboxTouchEnd(event) {
  const touch = event.changedTouches?.[0];
  if (!touch) {
    return;
  }

  const deltaX = touch.clientX - lightboxTouchStartX;
  const deltaY = touch.clientY - lightboxTouchStartY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < 44 || absX <= absY) {
    return;
  }

  const switched = deltaX < 0 ? switchLightboxImage("next") : switchLightboxImage("prev");
  if (switched) {
    lightboxIgnoreClickUntil = Date.now() + 280;
  }
}

function renderGalleryItem(node, mediaItem, context = {}) {
  if (!mediaItem.lookupKey && !mediaItem.url && !mediaItem.filename) {
    return;
  }

  node.dataset.postId = optionalString(context.postId);
  node.dataset.mediaIndex = String(Number.isFinite(context.mediaIndex) ? context.mediaIndex : -1);
  node.dataset.eagerHydrate = context.eagerHydrate ? "true" : "false";

  if (mediaItem.url) {
    mountResolvedMedia(node, mediaItem, mediaItem.url, context);
    return;
  }

  node.classList.add("is-pending");
  node.dataset.lookupKey = mediaItem.lookupKey;
  node.dataset.mediaType = mediaItem.type;
  node.dataset.filename = mediaItem.filename;

  if (context.eagerHydrate) {
    void hydrateMediaNode(node);
    return;
  }

  if (node.isConnected) {
    observeMediaNode(node);
  }
}

function schedulePendingMediaHydration() {
  if (pendingMediaHydrationFrame) {
    return;
  }

  pendingMediaHydrationFrame = window.requestAnimationFrame(() => {
    pendingMediaHydrationFrame = 0;
    document.querySelectorAll(".gallery-item.is-pending").forEach((node) => {
      observeMediaNode(node);
    });
  });
}

function ensureMediaObserver() {
  if (mediaObserver || !("IntersectionObserver" in window)) {
    return;
  }

  mediaObserver = new IntersectionObserver(handleMediaIntersection, {
    root: elements.phoneScreen,
    rootMargin: "240px 0px"
  });
}

function observeMediaNode(node) {
  ensureMediaObserver();

  if (mediaObserver) {
    mediaObserver.observe(node);
    return;
  }

  void hydrateMediaNode(node);
}

function handleMediaIntersection(entries) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    mediaObserver.unobserve(entry.target);
    void hydrateMediaNode(entry.target);
  });
}

async function hydrateMediaNode(node) {
  const mediaItem = {
    lookupKey: node.dataset.lookupKey,
    type: node.dataset.mediaType,
    filename: node.dataset.filename
  };

  const url = await resolveMediaUrl(mediaItem);

  if (!url) {
    node.classList.remove("is-pending");
    return;
  }

  mountResolvedMedia(node, mediaItem, url, {
    postId: node.dataset.postId,
    mediaIndex: Number(node.dataset.mediaIndex)
  });
}

async function resolveMediaUrl(mediaItem) {
  if (mediaItem.url) {
    return mediaItem.url;
  }

  const lookupKey = resolveMediaLookupKey(mediaItem.lookupKey, mediaItem.filename);
  if (!lookupKey) {
    return "";
  }

  if (zipMediaUrlCache.has(lookupKey)) {
    return zipMediaUrlCache.get(lookupKey);
  }

  const entry = zipMediaEntries.get(lookupKey);
  if (!entry) {
    return "";
  }

  const blob = await entry.async("blob");
  const url = URL.createObjectURL(blob);
  zipMediaUrlCache.set(lookupKey, url);
  return url;
}

function resolveMediaLookupKey(lookupKey, filename) {
  const candidates = [];
  const lookupFull = normalizeMediaKeyCandidate(lookupKey, false);
  const lookupBase = normalizeMediaKeyCandidate(lookupKey, true);
  const filenameFull = normalizeMediaKeyCandidate(filename, false);
  const filenameBase = normalizeMediaKeyCandidate(filename, true);

  [lookupFull, lookupBase, filenameFull, filenameBase].forEach((candidate) => {
    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  });

  for (const candidate of candidates) {
    if (zipMediaEntries.has(candidate)) {
      return candidate;
    }
  }

  for (const candidate of candidates) {
    const suffix = `/${candidate}`;
    for (const entryKey of zipMediaEntries.keys()) {
      if (entryKey.endsWith(suffix)) {
        return entryKey;
      }
    }
  }

  return candidates[0] || "";
}

function normalizeMediaKeyCandidate(value, asBaseName) {
  const cleaned = optionalString(value).replace(/\\/g, "/").toLowerCase().replace(/^\.\//, "");
  if (!cleaned) {
    return "";
  }

  if (!asBaseName) {
    return cleaned;
  }

  const base = baseName(cleaned);
  return base.toLowerCase();
}

function mountResolvedMedia(node, mediaItem, url, context = {}) {
  node.classList.remove("is-pending");
  node.innerHTML = "";

  if (mediaItem.type === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    node.appendChild(video);

    const chip = document.createElement("span");
    chip.className = "video-chip";
    chip.textContent = "瑙嗛";
    node.appendChild(chip);
    return;
  }

  const image = document.createElement("img");
  image.src = url;
  image.alt = mediaItem.filename || "\u52a8\u6001\u914d\u56fe";
  image.loading = "lazy";
  image.className = "previewable-image";
  image.dataset.previewSrc = url;
  image.dataset.filename = mediaItem.filename || "dynamic-image.jpg";
  image.dataset.postId = optionalString(context.postId);
  image.dataset.mediaIndex = String(Number.isFinite(context.mediaIndex) ? context.mediaIndex : -1);
  image.addEventListener("error", () => {
    window.posthog.capture("image_load_fallback");

    if (image.dataset.fallbackApplied === "true") {
      return;
    }

    image.dataset.fallbackApplied = "true";
    image.dataset.previewSrc = DEFAULT_MEDIA_IMAGE;
    image.src = DEFAULT_MEDIA_IMAGE;
  });
  node.appendChild(image);
}

function collectPreviewImagesFromCard(imageElement) {
  const card = imageElement.closest(".post-card");
  if (!card) {
    return [];
  }

  return [...card.querySelectorAll(".previewable-image")]
    .map((node) => ({
      url: getPreviewImageUrl(node),
      filename: node.dataset.filename || "dynamic-image.jpg"
    }))
    .filter((item) => item.url);
}

function isUsablePreviewUrl(value) {
  const raw = optionalString(value);
  if (!raw) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  try {
    const resolved = new URL(raw, window.location.href);
    const current = new URL(window.location.href);

    if (resolved.href === current.href) {
      return false;
    }

    const pathname = resolved.pathname.toLowerCase();
    if (pathname.endsWith(".html") || pathname.endsWith(".htm")) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
}

function getPreviewImageUrl(imageElement) {
  if (!imageElement) {
    return "";
  }

  const candidates = [
    optionalString(imageElement.dataset?.previewSrc),
    optionalString(imageElement.currentSrc),
    optionalString(imageElement.getAttribute("src")),
    optionalString(imageElement.src)
  ];

  for (const candidate of candidates) {
    if (isUsablePreviewUrl(candidate)) {
      return candidate;
    }
  }

  return "";
}

function clearZipMediaContext() {
  if (pendingMediaHydrationFrame) {
    window.cancelAnimationFrame(pendingMediaHydrationFrame);
    pendingMediaHydrationFrame = 0;
  }

  if (mediaObserver) {
    mediaObserver.disconnect();
    mediaObserver = null;
  }

  for (const url of zipMediaUrlCache.values()) {
    URL.revokeObjectURL(url);
  }

  zipMediaEntries.clear();
  zipMediaUrlCache.clear();
}

function revokeObjectUrl(url) {
  if (typeof url === "string" && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

function setPreviewBlob(kind, blob) {
  if (kind === "cover") {
    revokeObjectUrl(coverPreviewUrl);
    coverPreviewBlob = blob instanceof Blob ? blob : null;
    coverPreviewUrl = coverPreviewBlob ? URL.createObjectURL(coverPreviewBlob) : "";
    return;
  }

  revokeObjectUrl(avatarPreviewUrl);
  avatarPreviewBlob = blob instanceof Blob ? blob : null;
  avatarPreviewUrl = avatarPreviewBlob ? URL.createObjectURL(avatarPreviewBlob) : "";
}

function applyImagePreview(kind, file) {
  const targetInput = kind === "cover" ? elements.coverInput : elements.avatarInput;

  if (!file) {
    targetInput.value = "";
    return;
  }

  if (!/^image\//i.test(file.type) && !IMAGE_FILE_REGEX.test(file.name)) {
    targetInput.value = "";
    updateStatus("\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6\u4f5c\u4e3a\u5c01\u9762\u6216\u5934\u50cf\u3002", "is-error");
    return;
  }


  if (kind === "cover") {
    setPreviewBlob("cover", file);
    targetInput.value = "";
    render();
    updateStatus("\u5c01\u9762\u56fe\u5df2\u66f4\u65b0\uff0c\u4ec5\u5728\u5f53\u524d\u6d4f\u89c8\u5668\u672c\u5730\u9884\u89c8\u3002", "is-success");
    return;
  }

  setPreviewBlob("avatar", file);
  targetInput.value = "";
  render();
  updateStatus("\u5934\u50cf\u5df2\u66f4\u65b0\uff0c\u4ec5\u5728\u5f53\u524d\u6d4f\u89c8\u5668\u672c\u5730\u9884\u89c8\u3002", "is-success");
}

function applyJsonString(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    clearZipMediaContext();
    persistedZipFile = null;
    persistedZipFileName = "";
    currentImportMode = "json";
    currentData = normalizeData(parsed);
    pendingImportSuccessPayload = {
      record_count: currentData.posts.length
    };
    render();
    updateStatus("\u8c03\u8bd5 JSON \u5df2\u5e94\u7528\u3002", "is-success");
  } catch (error) {
    trackImportError(error);
    updateStatus(`JSON 瑙ｆ瀽澶辫触锛?{error.message}`, "is-error");
  }
}

function exportCurrentData() {
  const blob = new Blob([JSON.stringify(buildDebugData(currentData), null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "profile-page-data.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  updateStatus("\u5f53\u524d\u89e3\u6790\u7ed3\u679c\u5df2\u5bfc\u51fa\u3002", "is-success");
}

async function importSelectedFile(file) {
  if (!file) {
    return;
  }

  if (!isZipFile(file)) {
    trackImportError(new Error("涓嶆敮鎸佺殑鏂囦欢鏍煎紡"));
    updateStatus("\u8fd9\u91cc\u53ea\u652f\u6301\u5bfc\u5165\u53ef\u8bdd ZIP \u6587\u4ef6\u3002", "is-error");
    return;
  }

  await importZipArchive(file);
}

function isZipFile(file) {
  return /\.zip$/i.test(file.name) || /zip/i.test(file.type);
}

async function importZipArchive(file) {
  if (typeof JSZip === "undefined") {
    trackImportError(new Error("ZIP parser unavailable"));
    updateStatus("ZIP \u89e3\u6790\u5668\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u9875\u9762\u540e\u91cd\u8bd5\u3002", "is-error");
    return;
  }

  toggleBusyState(true);
  updateStatus("姝ｅ湪瑙ｅ帇 ZIP 骞跺尮閰嶅姩鎬佹枃鏈笌鍥剧墖瑙嗛锛岃绋嶇瓑...", "is-loading");

  try {
    const result = await parseKehuaArchive(file);
    clearZipMediaContext();
    zipMediaEntries = result.mediaEntries;
    persistedZipFile = file;
    persistedZipFileName = file.name;
    currentImportMode = "zip";
    currentData = normalizeData(result.data);
    pendingImportSuccessPayload = {
      record_count: currentData.posts.length
    };
    render();
    updateStatus(
      `ZIP \u5bfc\u5165\u5b8c\u6210\uff1a\u5171\u89e3\u6790 ${currentData.posts.length} \u6761\u52a8\u6001\uff0c\u5339\u914d ${currentData.posts.reduce((sum, post) => sum + post.media.length, 0)} \u4e2a\u56fe\u7247/\u89c6\u9891\u3002`, 
      "is-success"
    );
  } catch (error) {
    trackImportError(error);
    updateStatus(`ZIP 瀵煎叆澶辫触锛?{error.message}`, "is-error");
  } finally {
    toggleBusyState(false);
    elements.fileInput.value = "";
  }
}

async function parseKehuaArchive(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  const textEntries = entries
    .filter((entry) => isArchiveDynamicTextPath(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"));

  if (textEntries.length === 0) {
    throw new Error(
      "\u6ca1\u6709\u5728 ZIP \u91cc\u627e\u5230\u201c\u52a8\u6001\u5185\u5bb9.txt\u201d\u3002\u8bf7\u786e\u8ba4\u538b\u7f29\u5305\u5305\u542b\u201c\u6211\u7684\u52a8\u6001 / 2023\u5e74 / 2023\u5e74-\u52a8\u6001\u5185\u5bb9.txt\u201d\u8fd9\u7c7b\u6587\u4ef6\u3002"
    );
  }

  const mediaEntries = new Map();
  entries.forEach((entry) => {
    const normalizedEntryName = normalizeArchivePath(entry.name).toLowerCase();
    const name = baseName(normalizedEntryName);

    if (!isSupportedMediaFile(name)) {
      return;
    }

    mediaEntries.set(name, entry);
    mediaEntries.set(normalizedEntryName, entry);
  });

  const years = new Set();
  const posts = [];

  for (const textEntry of textEntries) {
    const year = extractYearValue(textEntry.name);
    if (year) {
      years.add(year);
    }

    const content = await textEntry.async("text");
    posts.push(...parseDynamicText(content, mediaEntries, textEntry.name));
  }

  posts.sort((left, right) => right.sortTime - left.sortTime);

  const name = extractProfileName(entries, file.name);
  const totalMedia = posts.reduce((sum, post) => sum + post.media.length, 0);

  return {
    mediaEntries,
    data: {
      profile: {
        name,
        vip: true,
        city: "",
        constellation: "",
        entriesCount: posts.length,
        ipLocation: "",
        gender: "male",
        avatar: ""
      },
      posts: posts.map(({ sortTime, ...post }) => post),
      summary: {
        totalMedia
      }
    }
  };
}

function parseDynamicText(content, mediaEntries, sourceName) {
  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const posts = [];
  let currentPost = null;
  let postIndex = 0;

  const commit = () => {
    if (!currentPost) {
      return;
    }

    const text = currentPost.textLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

    if (text || currentPost.media.length > 0) {
      posts.push({
        id: `${sourceName}-${postIndex + 1}`,
        timestamp: currentPost.timestamp,
        text,
        media: currentPost.media,
        sortTime: currentPost.sortTime
      });
      postIndex += 1;
    }

    currentPost = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (TIMESTAMP_LINE_REGEX.test(trimmed)) {
      commit();
      currentPost = createPostSeed(trimmed);
      return;
    }

    if (!currentPost) {
      return;
    }

    const mediaMatch = trimmed.match(MEDIA_REFERENCE_REGEX);
    if (mediaMatch) {
      const filename = mediaMatch[2].trim();
      const lookupFull = normalizeMediaKeyCandidate(filename, false);
      const lookupBase = normalizeMediaKeyCandidate(filename, true);
      const mediaLabel = mediaMatch[1].trim();
      const resolvedLookupKey = mediaEntries.has(lookupFull)
        ? lookupFull
        : mediaEntries.has(lookupBase)
          ? lookupBase
          : "";

      currentPost.media.push({
        type: mediaLabel.includes("瑙嗛") ? "video" : detectMediaType(filename),
        filename,
        lookupKey: resolvedLookupKey,
        url: ""
      });
      return;
    }

    currentPost.textLines.push(line.trimEnd());
  });

  commit();
  return posts;
}

function createPostSeed(timestampLine) {
  const [, year, month, day, hour, minute, second] = timestampLine.match(TIMESTAMP_LINE_REGEX);

  return {
    timestamp: `${year}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${minute}:${second}`,
    sortTime: Date.parse(`${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${minute}:${second}`),
    textLines: [],
    media: []
  };
}

function extractYearValue(pathname) {
  const match = normalizeArchivePath(pathname).match(/(\d{4})(?=\D)/u);
  return match ? Number(match[1]) : null;
}

function isArchiveDynamicTextPath(pathname) {
  const normalizedPath = normalizeArchivePath(pathname);
  const fileName = baseName(normalizedPath);

  if (!/\.txt$/i.test(fileName)) {
    return false;
  }

  if (!/(^|\/)\d{4}\D/i.test(normalizedPath)) {
    return false;
  }

  return /^\d{4}\D.+\.txt$/i.test(fileName);
}

function formatYearSummary(years) {
  if (years.length === 0) {
    return "\u53ef\u8bdd\u52a8\u6001";
  }

  const sorted = [...years].sort((left, right) => left - right);
  if (sorted.length === 1) {
    return `${sorted[0]}\u5e74`;
  }

  return `${sorted[0]}-${sorted[sorted.length - 1]}\u5e74`;
}

function extractProfileName(entries, archiveName) {
  const topLevelCandidates = [
    ...new Set(entries.map((entry) => normalizeArchivePath(entry.name).split("/")[0]).filter(Boolean)),
    archiveName.replace(/\.zip$/i, "")
  ];

  for (const candidate of topLevelCandidates) {
    const cleaned = candidate.replace(/\(\d+\)\s*$/, "").trim();
    const match = cleaned.match(/\u53ef\u8bdd[-_ ]?\u4e2a\u4eba\u52a8\u6001[-_ ]?(.+)$/u);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return sampleData.profile.name;
}

function isSupportedMediaFile(name) {
  return IMAGE_FILE_REGEX.test(name) || VIDEO_FILE_REGEX.test(name);
}

function detectMediaType(filename) {
  return VIDEO_FILE_REGEX.test(filename) ? "video" : "image";
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function baseName(pathname) {
  return normalizeArchivePath(pathname).split("/").pop() ?? pathname;
}

function normalizeArchivePath(pathname) {
  return pathname.replace(/\\/g, "/");
}

function resetProfilePreferences() {
  profilePreferences.city = sampleData.profile.city;
  profilePreferences.constellation = sampleData.profile.constellation;
  profilePreferences.ipLocation = sampleData.profile.ipLocation;
  persistProfilePreferences();
}

function resetSessionState() {
  clearZipMediaContext();
  setPreviewBlob("cover", null);
  setPreviewBlob("avatar", null);
  persistedZipFile = null;
  persistedZipFileName = "";
  currentImportMode = "sample";
  currentData = normalizeData(sampleData);
  currentDetailPostId = "";
  detailReturnView = "home";
  elements.searchInput.value = "";
}

async function hydratePersistedState() {
  let persistedState = null;

  try {
    persistedState = await readPersistedState();
  } catch (error) {
    console.warn("Failed to read persisted IndexedDB state.", error);
    window.posthog.capture("indexeddb_read_fail", {
      error_reason: optionalString(error?.message) || "鏈煡閿欒"
    });
    return;
  }

  if (!persistedState) {
    return;
  }

  isHydratingPersistedState = true;

  try {
    if (persistedState.data) {
      currentData = normalizeData(persistedState.data);
    }

    currentImportMode =
      persistedState.importMode === "zip" ? "zip" : persistedState.importMode === "json" ? "json" : "sample";

    setPreviewBlob("cover", persistedState.coverBlob);
    setPreviewBlob("avatar", persistedState.avatarBlob);

    if (persistedState.importMode === "zip" && persistedState.zipFile instanceof Blob) {
      const restoredFile = new File(
        [persistedState.zipFile],
        optionalString(persistedState.zipFileName) || "kehua-export.zip",
        { type: persistedState.zipFile.type || "application/zip" }
      );
      persistedZipFile = persistedState.zipFile;
      persistedZipFileName = restoredFile.name;

      if (typeof JSZip === "undefined") {
        updateStatus("\u5df2\u6062\u590d\u5386\u53f2\u6570\u636e\uff1b\u5a92\u4f53\u6587\u4ef6\u5c06\u5728 ZIP \u89e3\u6790\u5668\u53ef\u7528\u540e\u7ee7\u7eed\u6062\u590d\u3002", "is-loading");
        return;
      }

      try {
        const result = await parseKehuaArchive(restoredFile);
        clearZipMediaContext();
        zipMediaEntries = result.mediaEntries;

        if (!persistedState.data) {
          currentData = normalizeData(result.data);
        }
      } catch (zipError) {
        console.warn("Failed to restore ZIP media entries, fallback to snapshot only.", zipError);
        updateStatus("\u5df2\u6062\u590d\u5386\u53f2\u6587\u672c\u6570\u636e\uff0c\u90e8\u5206\u56fe\u7247\u8d44\u6e90\u6682\u672a\u6062\u590d\u3002", "is-loading");
      }
      return;
    }

    persistedZipFile = null;
    persistedZipFileName = "";
  } catch (error) {
    console.warn("Failed to restore persisted state, falling back to current session.", error);
    if (!persistedState?.data) {
      resetSessionState();
    }
  } finally {
    isHydratingPersistedState = false;
  }
}

function getEventElement(target) {
  if (target instanceof Element) {
    return target;
  }

  if (target && "parentElement" in target) {
    return target.parentElement;
  }

  return null;
}

function handlePostAction(event) {
  const eventElement = getEventElement(event.target);
  if (!eventElement) {
    return;
  }

  const previewImage = eventElement.closest(".previewable-image");
  if (previewImage) {
    const previewItems = collectPreviewImagesFromCard(previewImage);
    const activeUrl = getPreviewImageUrl(previewImage);
    const preferredIndex = previewItems.findIndex((item) => item.url === activeUrl);
    openLightbox(activeUrl, previewImage.dataset.filename, previewItems, preferredIndex >= 0 ? preferredIndex : 0);
    return;
  }

  const trigger = eventElement.closest(".more-button, .expand-link");
  if (trigger) {
    const postId = trigger.dataset.postId || trigger.closest(".post-card")?.dataset.postId;
    if (!postId) {
      return;
    }

    const returnView = trigger.closest("#searchResults") ? "search" : "home";
    openDetailView(postId, returnView);
    return;
  }

  if (eventElement.closest("video, a, button")) {
    return;
  }

  const card = eventElement.closest(".post-card");
  const postId = card?.dataset.postId;
  if (!postId) {
    return;
  }

  const returnView = card.closest("#searchResults") ? "search" : "home";
  openDetailView(postId, returnView);
}

function handleExpandableKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const eventElement = getEventElement(event.target);
  if (!eventElement) {
    return;
  }

  const trigger = eventElement.closest(".expand-link");
  if (!trigger) {
    return;
  }

  event.preventDefault();
  const postId = trigger.dataset.postId;
  if (!postId) {
    return;
  }

  const returnView = trigger.closest("#searchResults") ? "search" : "home";
  openDetailView(postId, returnView);
}

function clearCurrentSession() {
  closeLightbox();
  closeSettingsMenu();
  resetProfilePreferences();
  resetSessionState();
  setView("home");
  render();
  updateStatus("\u5df2\u6e05\u7a7a\u5f53\u524d\u4fe1\u606f\uff0c\u73b0\u5728\u53ef\u4ee5\u91cd\u65b0\u5bfc\u5165\u65b0\u7684 ZIP\u3002", "is-success");
}

if (isClientRuntime) {
  elements.phoneScreen.addEventListener("scroll", () => {
    updateFastScrollerThumb();
    showFastScrollerTemporarily();
  });
  elements.fastScroller.addEventListener("mouseenter", () => {
    showFastScrollerTemporarily();
  });
  elements.fastScroller.addEventListener("mouseleave", () => {
    if (!isFastScrollerDragging) {
      elements.fastScroller.classList.remove("is-visible");
    }
  });
  elements.fastScroller.addEventListener("touchstart", (event) => {
    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }

    event.preventDefault();
    handleFastScrollerPointerStart(touch.clientY);
  }, { passive: false });
  elements.fastScroller.addEventListener("touchmove", (event) => {
    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }

    event.preventDefault();
    handleFastScrollerPointerMove(touch.clientY);
  }, { passive: false });
  elements.fastScroller.addEventListener("touchend", () => {
    handleFastScrollerPointerEnd();
  });
  elements.fastScroller.addEventListener("touchcancel", () => {
    handleFastScrollerPointerEnd();
  });
  elements.fastScroller.addEventListener("mousedown", (event) => {
    event.preventDefault();
    handleFastScrollerPointerStart(event.clientY);
  });
  window.addEventListener("mousemove", (event) => {
    handleFastScrollerPointerMove(event.clientY);
  });
  window.addEventListener("mouseup", () => {
    handleFastScrollerPointerEnd();
  });
  window.addEventListener("resize", () => {
    updateFastScrollerThumb();
  });
  window.addEventListener("popstate", handlePopState);
  elements.importFileButton?.addEventListener("click", () => {
    window.posthog.capture("import_button_click");
  });
  elements.settingsButton.addEventListener("click", toggleSettingsMenu);
  elements.settingsClose.addEventListener("click", closeSettingsMenu);
  elements.settingsBackdrop.addEventListener("click", closeSettingsMenu);
  elements.clearSessionButton.addEventListener("click", clearCurrentSession);
  elements.coverEditButton.addEventListener("click", () => {
    elements.coverInput.click();
  });
  elements.avatarEditButton.addEventListener("click", () => {
    elements.avatarInput.click();
  });
  elements.coverInput.addEventListener("change", (event) => {
    const [file] = event.target.files ?? [];
    applyImagePreview("cover", file);
  });
  elements.avatarInput.addEventListener("change", (event) => {
    const [file] = event.target.files ?? [];
    applyImagePreview("avatar", file);
  });
  elements.postsContainer.addEventListener("click", handlePostAction);
  elements.postsContainer.addEventListener("keydown", handleExpandableKeydown);
  elements.searchResults.addEventListener("click", handlePostAction);
  elements.searchResults.addEventListener("keydown", handleExpandableKeydown);
  elements.detailGallery.addEventListener("click", handlePostAction);
  elements.searchButton.addEventListener("click", openSearchView);
  elements.editProfileButton.addEventListener("click", openProfileEditView);
  elements.searchBackButton.addEventListener("click", closeSearchView);
  elements.profileEditBackButton.addEventListener("click", closeProfileEditView);
  elements.profileEditForm.addEventListener("submit", saveProfileDetails);
  elements.searchInput.addEventListener("input", () => {
    updateSearchResults({ shouldTrack: true });
  });
  elements.detailBackButton.addEventListener("click", closeDetailView);
  elements.lightboxClose.addEventListener("click", (event) => {
    event.stopPropagation();
    closeLightbox();
  });
  elements.lightboxView.addEventListener("click", () => {
    if (Date.now() < lightboxIgnoreClickUntil) {
      return;
    }

    closeLightbox();
  });
  elements.lightboxDownload.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();
    saveCurrentLightboxImage();
  });
  elements.lightboxView.addEventListener("touchstart", handleLightboxTouchStart, { passive: true });
  elements.lightboxView.addEventListener("touchend", handleLightboxTouchEnd, { passive: true });
  elements.lightboxImage.addEventListener("error", () => {
    window.posthog.capture("image_load_fallback");
    updateStatus("\u56fe\u7247\u9884\u89c8\u5931\u8d25\uff1a\u56fe\u7247\u8d44\u6e90\u65e0\u6cd5\u8bfb\u53d6\u3002", "is-error");
  });
  elements.lightboxImage.addEventListener(
    "touchstart",
    () => {
      clearTimeout(lightboxLongPressTimer);
      lightboxLongPressTimer = window.setTimeout(() => {
        saveCurrentLightboxImage();
      }, 650);
    },
    { passive: true }
  );
  ["touchend", "touchcancel", "touchmove"].forEach((eventName) => {
    elements.lightboxImage.addEventListener(
      eventName,
      () => {
        clearTimeout(lightboxLongPressTimer);
        lightboxLongPressTimer = null;
      },
      { passive: true }
    );
  });

  elements.fileInput.addEventListener("change", async (event) => {
    const [file] = event.target.files ?? [];

    try {
      await importSelectedFile(file);
    } catch (error) {
      trackImportError(error);
      updateStatus(`璇诲彇鏂囦欢澶辫触锛?{error.message}`, "is-error");
    } finally {
      elements.fileInput.value = "";
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeTopOverlayManually();
    }
  });

  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  window.addEventListener("drop", async (event) => {
    event.preventDefault();
    const [file] = [...(event.dataTransfer?.files ?? [])];

    if (!file) {
      return;
    }

    openSettingsMenu();

    try {
      await importSelectedFile(file);
    } catch (error) {
      trackImportError(error);
      updateStatus(`鎷栨嫿瀵煎叆澶辫触锛?{error.message}`, "is-error");
    }
  });
}

async function bootstrapApp() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  ensureHistoryStateInitialized();
  renderInitializationState();
  await hydratePersistedState();
  isInitializing = false;
  render();
}

if (isClientRuntime) {
  void bootstrapApp();
}

