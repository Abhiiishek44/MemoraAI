# Frontend Folder Structure (Phase 1)

This structure organizes code by responsibility and feature while keeping backwards compatibility.

## Current Target Structure

```text
src/
  app/
    providers/
      AppProviders.jsx
    router/
      AppRoutes.jsx
      GuestRoute.jsx
      ProtectedRoute.jsx

  features/
    auth/
      context/
        AuthContext.jsx
    topics/
      context/
        TopicContext.jsx

  shared/
    api/
      axiosClient.js
      endpoints.js

  components/
  pages/
  context/            # compatibility wrappers (temporary)
  routes/             # compatibility wrappers (temporary)
  service/            # compatibility wrappers (temporary)
  utils/              # compatibility wrappers (temporary)
```

## Why this is better

- `app/` keeps app-level composition (routing, providers) in one place.
- `features/` groups domain logic (auth, topics) together.
- `shared/` centralizes reusable infrastructure (API client/endpoints).
- Temporary wrappers avoid breaking existing imports while you migrate gradually.

## Next recommended cleanup (Phase 2)

1. Move page files into feature folders:
   - `features/auth/pages/{Login,Signup}.jsx`
   - `features/topics/pages/{Topics,TopicWorkspace}.jsx`
   - `features/study/pages/{MCQTest,FlashcardReview}.jsx`
2. Replace old imports (`context/`, `service/`, `utils/`, `routes/`) with new paths.
3. Delete compatibility wrapper folders after migration is complete.
