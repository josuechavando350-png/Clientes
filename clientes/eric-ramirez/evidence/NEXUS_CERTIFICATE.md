# NEXUS Delivery Candidate — Eric Ramírez

Status: **PASS_STATIC / PRODUCTION_CANDIDATE**

Golden SHA-256: `6aecd629c3a11d0a745fc4425b47282fa60b6641f773d1b4a0bb4d0c62ff2a60`

## Gates

- Project Design DNA: PASS
- Scope isolation: PASS
- Local-link integrity: PASS
- Static accessibility checks: PASS
- Static SEO checks: PASS
- Browser QA: 28 cases / 0 failures
- Visual parity 390px SSIM: 0.997848
- Visual parity 1440px SSIM: 0.997664
- Golden immutability: PASS
- Vercel deployment: NOT_STARTED
- PageSpeed/Lighthouse public run: NOT_TESTED

## Home transfer budget

- HTML: 35330 B raw / 8929 B Brotli estimate
- CSS: 168084 B raw / 66416 B Brotli estimate
- JavaScript: 64870 B raw / 22852 B Brotli estimate
- Priority images: 70375 B total

All local performance budgets are PASS. The production target is PageSpeed/Lighthouse **99+** in Performance, Accessibility, Best Practices and SEO. Final scores are intentionally not certified until a public HTTPS deployment exists.

## Isolation

The Eric project is scoped to `clientes/eric-ramirez/**`. Cano Penal is explicitly denied. Vercel remains gated until the deployment phase.
