# Eric Ramírez · Nexus client project

- Client project: `true`
- Client ID: `eric-ramirez`
- Golden artifact: `eric_ramirez_NEXUS33_oro.html`
- Golden SHA-256: `6aecd629c3a11d0a745fc4425b47282fa60b6641f773d1b4a0bb4d0c62ff2a60`
- Production output: `dist/`
- Vercel: not deployed in this phase.
- Cano Penal: explicit deny scope.

`dist/` is the static production candidate derived from the approved Golden. The exact Golden hash is registered under `golden/golden-manifest.json`; the raw 6.7 MB preview artifact is intentionally not duplicated into the public-stage repository. When the repository is made private, it can be added byte-for-byte without changing the production build.

For Vercel later, use `clientes/eric-ramirez/dist` as the project Root Directory.
