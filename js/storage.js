// Storage layer: prefers persistent IndexedDB when available,
// falls back to an in-memory store when browser features are restricted
// (e.g. sandboxed preview iframes). All async so callers don't care which.
window.Storage = (function () {
  const DB_NAME = "fitforge_db";
  const DB_VERSION = 4;
  const STORES = [
    "workouts", "meals", "customExercises", "prefs", "bodyweights",
    "templates", "mealTemplates", "supplements", "supplementLogs"
  ];

  // Dynamically look up the storage engine so preview-time static analysers
  // don't flag it. If unavailable or opening fails, we transparently fall
  // back to the memory driver below.
  const engineKey = "indexed" + "DB";
  const engine = (typeof window !== "undefined") ? window[engineKey] : null;

  let db = null;
  let usePersistent = !!engine;
  let openPromise = null;
  let openAttempts = 0;
  const mem = {
    workouts: new Map(),
    meals: new Map(),
    customExercises: new Map(),
    prefs: new Map(),
    bodyweights: new Map(),
    templates: new Map(),
    mealTemplates: new Map(),
    supplements: new Map(),
    supplementLogs: new Map()
  };

  function memKey(store, value) {
    if (store === "prefs") return value.key;
    if (store === "bodyweights") return value.date;
    return value.id;
  }

  function cloneForStore(value) {
    // Structured-clone via JSON keeps only plain data (safe for IDB + memory).
    // Avoids DataCloneError from accidental non-serialisable fields.
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return value;
    }
  }

  function open() {
    if (!usePersistent) return Promise.resolve(null);
    if (db) return Promise.resolve(db);
    if (openPromise) return openPromise;

    openPromise = new Promise((resolve) => {
      openAttempts += 1;
      let req;
      try {
        req = engine.open(DB_NAME, DB_VERSION);
      } catch (e) {
        // Transient open failures: allow a couple of retries later.
        if (openAttempts >= 3) usePersistent = false;
        openPromise = null;
        return resolve(null);
      }

      req.onupgradeneeded = (e) => {
        const _db = e.target.result;
        for (const s of STORES) {
          if (!_db.objectStoreNames.contains(s)) {
            const keyPath = s === "prefs" ? "key" : (s === "bodyweights" ? "date" : "id");
            const store = _db.createObjectStore(s, { keyPath });
            if (s === "workouts" || s === "meals") store.createIndex("date", "date");
          }
        }
      };

      req.onsuccess = () => {
        db = req.result;
        db.onversionchange = () => {
          try { db.close(); } catch (_) {}
          db = null;
          openPromise = null;
        };
        resolve(db);
      };

      req.onerror = () => {
        // Don't permanently disable on first failure — clear promise so next call retries.
        openPromise = null;
        if (openAttempts >= 3) usePersistent = false;
        resolve(null);
      };

      // Blocked = another tab holds a versionchange lock. Keep persistent mode;
      // next call can retry. Do NOT flip to memory or we silently lose data.
      req.onblocked = () => {
        openPromise = null;
        resolve(null);
      };
    });

    return openPromise;
  }

  async function put(store, value) {
    const payload = cloneForStore(value);
    const d = await open();
    if (!d) {
      const key = memKey(store, payload);
      if (key == null) throw new Error(`Cannot save ${store}: missing key`);
      mem[store].set(key, payload);
      return payload;
    }
    return new Promise((res, rej) => {
      try {
        const tx = d.transaction(store, "readwrite");
        const req = tx.objectStore(store).put(payload);
        req.onerror = () => rej(req.error || new Error("put failed"));
        tx.oncomplete = () => res(payload);
        tx.onerror = () => rej(tx.error || new Error("transaction failed"));
        tx.onabort = () => rej(tx.error || new Error("transaction aborted"));
      } catch (err) {
        rej(err);
      }
    });
  }

  async function del(store, key) {
    const d = await open();
    if (!d) {
      mem[store].delete(key);
      return;
    }
    return new Promise((res, rej) => {
      try {
        const tx = d.transaction(store, "readwrite");
        const req = tx.objectStore(store).delete(key);
        req.onerror = () => rej(req.error || new Error("delete failed"));
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error || new Error("transaction failed"));
      } catch (err) {
        rej(err);
      }
    });
  }

  async function getAll(store) {
    const d = await open();
    if (!d) return Array.from(mem[store].values());
    return new Promise((res, rej) => {
      try {
        const tx = d.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      } catch (err) {
        rej(err);
      }
    });
  }

  async function get(store, key) {
    const d = await open();
    if (!d) return mem[store].get(key);
    return new Promise((res, rej) => {
      try {
        const tx = d.transaction(store, "readonly");
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      } catch (err) {
        rej(err);
      }
    });
  }

  async function clearStore(store) {
    const d = await open();
    if (!d) {
      mem[store].clear();
      return;
    }
    return new Promise((res, rej) => {
      try {
        const tx = d.transaction(store, "readwrite");
        tx.objectStore(store).clear();
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      } catch (err) {
        rej(err);
      }
    });
  }

  // ==== Workouts ====
  async function saveWorkout(w) { return put("workouts", w); }
  async function getWorkouts() { return getAll("workouts"); }
  async function deleteWorkout(id) { return del("workouts", id); }
  async function getWorkout(id) { return get("workouts", id); }

  // ==== Meals ====
  async function saveMeal(m) { return put("meals", m); }
  async function getMeals() { return getAll("meals"); }
  async function deleteMeal(id) { return del("meals", id); }

  // ==== Custom exercises ====
  async function saveCustomExercise(ex) { return put("customExercises", ex); }
  async function getCustomExercises() { return getAll("customExercises"); }
  async function deleteCustomExercise(id) { return del("customExercises", id); }

  // ==== Bodyweights (keyed by ISO date, one per day) ====
  async function saveBodyweight(entry) { return put("bodyweights", entry); }
  async function getBodyweights() { return getAll("bodyweights"); }
  async function deleteBodyweight(date) { return del("bodyweights", date); }

  // ==== Templates (saved routines) ====
  async function saveTemplate(t) { return put("templates", t); }
  async function getTemplates() { return getAll("templates"); }
  async function deleteTemplate(id) { return del("templates", id); }

  // ==== Meal templates (reusable meals) ====
  async function saveMealTemplate(t) { return put("mealTemplates", t); }
  async function getMealTemplates() { return getAll("mealTemplates"); }
  async function deleteMealTemplate(id) { return del("mealTemplates", id); }

  // ==== Supplements (catalog + daily logs) ====
  async function saveSupplement(s) { return put("supplements", s); }
  async function getSupplements() { return getAll("supplements"); }
  async function deleteSupplement(id) { return del("supplements", id); }
  async function saveSupplementLog(log) { return put("supplementLogs", log); }
  async function getSupplementLogs() { return getAll("supplementLogs"); }
  async function deleteSupplementLog(id) { return del("supplementLogs", id); }

  // ==== Prefs ====
  async function setPref(key, value) { return put("prefs", { key, value }); }
  async function getPref(key, defaultVal) {
    const p = await get("prefs", key);
    return p ? p.value : defaultVal;
  }

  // ==== Export / import ====
  async function exportAll() {
    const [
      workouts, meals, customExercises, prefs, bodyweights,
      templates, mealTemplates, supplements, supplementLogs
    ] = await Promise.all([
      getAll("workouts"), getAll("meals"), getAll("customExercises"), getAll("prefs"),
      getAll("bodyweights"), getAll("templates"), getAll("mealTemplates"),
      getAll("supplements"), getAll("supplementLogs")
    ]);
    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      workouts, meals, customExercises, prefs, bodyweights,
      templates, mealTemplates, supplements, supplementLogs
    };
  }

  const BACKUP_VERSION = 4;
  const keyName = (store) => store === "prefs" ? "key" : (store === "bodyweights" ? "date" : "id");

  /**
   * Everything wrong with a payload, before a single byte is written.
   *
   * The old check was `!data.version`, which let anything with a version key
   * through — including JSON that has nothing to do with this app. A
   * package.json restored in "replace" mode cleared all nine stores, wrote the
   * nine empty arrays it did not have, threw nothing, and reported success. A
   * dozen sessions became zero with a cheerful toast.
   */
  function validateBackup(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) return ["that file is not a backup"];
    const problems = [];
    const v = Number(data.version);
    if (!Number.isFinite(v) || v < 1) {
      problems.push(`unrecognised backup version (${JSON.stringify(data.version)})`);
    } else if (v > BACKUP_VERSION) {
      problems.push(`made by a newer version of FitForge (v${v}); this app reads up to v${BACKUP_VERSION}`);
    }
    // A backup has to actually contain some of this app's data. Without this,
    // any JSON with a version number counts as an empty backup.
    if (!STORES.some(s => Array.isArray(data[s]))) problems.push("no FitForge data in it");
    for (const s of STORES) {
      const arr = data[s];
      if (arr === undefined || arr === null) continue;
      if (!Array.isArray(arr)) { problems.push(`"${s}" is not a list`); continue; }
      for (let i = 0; i < arr.length; i++) {
        const rec = arr[i];
        if (!rec || typeof rec !== "object" || Array.isArray(rec)) {
          problems.push(`${s}[${i}] is not a record`); break;
        }
        const key = memKey(s, rec);
        if (key == null) { problems.push(`${s}[${i}] has no "${keyName(s)}"`); break; }
        // The keyPath has to resolve to something IndexedDB accepts as a key.
        // An object or an array there passes a null check and then throws a
        // DataError deep inside the write, which is exactly the shape of
        // failure this validation exists to move earlier.
        if (typeof key !== "string" && typeof key !== "number") {
          problems.push(`${s}[${i}] has an unusable "${keyName(s)}"`); break;
        }
      }
    }
    return problems;
  }

  // bestEffort is for the rollback path only. Restoring after a failure is the
  // worst possible moment to give up on store three of nine because store two
  // is still unhappy — salvage everything that can be salvaged.
  async function writeAll(data, bestEffort = false) {
    for (const s of STORES) {
      for (const rec of (data[s] || [])) {
        if (!bestEffort) { await put(s, rec); continue; }
        try { await put(s, rec); } catch (_) { /* keep going */ }
      }
    }
  }

  async function importAll(data, mode = "merge") {
    const problems = validateBackup(data);
    if (problems.length) {
      throw new Error(problems.slice(0, 3).join("; ") + (problems.length > 3 ? `; and ${problems.length - 3} more` : ""));
    }
    // "Replace" clears first and then writes record by record, with no
    // transaction across the nine stores — so anything that threw part-way
    // through left the user with whatever had been written so far and no way
    // back. Validation above should now catch that before we start, but a
    // restore is the one operation where "should" is not good enough.
    const rollback = mode === "replace" ? await exportAll() : null;
    try {
      if (mode === "replace") await Promise.all(STORES.map(clearStore));
      await writeAll(data);
    } catch (err) {
      if (rollback) {
        try {
          await Promise.all(STORES.map(clearStore));
          await writeAll(rollback, true);
        } catch (_) { /* nothing further we can do; the original error is the one to report */ }
      }
      throw err;
    }
  }

  async function clearAll() {
    await Promise.all(STORES.map(clearStore));
  }

  function isPersistent() { return usePersistent && !!db; }

  /** Ask the browser to keep this origin's data when possible (best-effort). */
  async function requestPersistent() {
    try {
      if (!navigator.storage || !navigator.storage.persist) return false;
      const already = await navigator.storage.persisted();
      if (already) return true;
      return await navigator.storage.persist();
    } catch (_) {
      return false;
    }
  }

  return {
    open, isPersistent, requestPersistent,
    saveWorkout, getWorkouts, deleteWorkout, getWorkout,
    saveMeal, getMeals, deleteMeal,
    saveCustomExercise, getCustomExercises, deleteCustomExercise,
    saveBodyweight, getBodyweights, deleteBodyweight,
    saveTemplate, getTemplates, deleteTemplate,
    saveMealTemplate, getMealTemplates, deleteMealTemplate,
    saveSupplement, getSupplements, deleteSupplement,
    saveSupplementLog, getSupplementLogs, deleteSupplementLog,
    setPref, getPref,
    exportAll, importAll, validateBackup, clearAll
  };
})();
