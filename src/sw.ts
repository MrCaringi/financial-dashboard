import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { Serwist } from "serwist";

declare const self: any;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST as (PrecacheEntry | string)[] | undefined,
  precacheOptions: {
    cleanupOutdatedCaches: true,
  },
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
