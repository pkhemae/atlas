import { registry } from "@atlas/api/registry";
import { createTuyau } from "@tuyau/core/client";
import type { Data } from "@atlas/api/data";

export type AuthUser = Data.Auth.User;

// Kept in memory only; the durable copy lives in the OS keychain.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export const api = createTuyau({
  registry,
  baseUrl: "http://localhost:3334",
  hooks: {
    beforeRequest: [
      (request) => {
        if (authToken) {
          request.headers.set("Authorization", `Bearer ${authToken}`);
        }
      },
    ],
  },
});
