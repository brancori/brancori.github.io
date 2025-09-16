// storage-cache.js
// Mini wrapper IndexedDB. No localStorage.
(function(global){
  const DB_NAME = 'rival-db';
  const STORE = 'games';
  const VERSION = 1;

  function openDB(){
    return new Promise((resolve,reject)=>{
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(STORE)){
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    });
  }

  async function put(item){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(STORE,'readwrite');
      const s = tx.objectStore(STORE);
      const r = s.put(item);
      r.onsuccess = ()=>resolve(true);
      r.onerror = e=>reject(e.target.error);
    });
  }

  async function get(id){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(STORE,'readonly');
      const s = tx.objectStore(STORE);
      const r = s.get(id);
      r.onsuccess = ()=>resolve(r.result);
      r.onerror = e=>reject(e.target.error);
    });
  }

  async function all(){
    const db = await openDB();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(STORE,'readonly');
      const s = tx.objectStore(STORE);
      const r = s.getAll();
      r.onsuccess = ()=>resolve(r.result);
      r.onerror = e=>reject(e.target.error);
    });
  }

  global.StorageCache = {
    saveGame: async (id, data) => {
      const item = { id: id || ('game_'+Date.now()), updated: new Date().toISOString(), data };
      await put(item);
      return item.id;
    },
    loadGame: async (id) => {
      const res = await get(id);
      return res ? res.data : null;
    },
    listGames: async () => {
      const res = await all();
      return res;
    }
  };
})(window);
