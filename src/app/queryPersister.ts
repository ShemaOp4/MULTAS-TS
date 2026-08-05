import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "fines-public-query-cache-v2",
});
