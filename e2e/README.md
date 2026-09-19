# E2E (Maestro)

Prereqs: iOS simulator booted, `cd apps/mobile && npx expo start --port 8081` running, Expo Go installed (expo start installs it).

```bash
~/.maestro/bin/maestro test e2e/01-parent-onboarding-to-first-level.yaml
~/.maestro/bin/maestro test e2e/02-pin-switch-and-parent-dashboard.yaml   # run after 01
```
Flows use `appId: host.exp.Exponent` (Expo Go). For a dev-client build change it to `com.coachingapp.coach`.
