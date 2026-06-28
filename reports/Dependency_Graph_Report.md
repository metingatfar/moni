# Project Dependency Graph Report

## Modules & APIs Dependencies Registry

```mermaid
graph TD
    api-profile["api-profile"] --> module-Authentication["module-Authentication"]
    module-Dashboard["module-Dashboard"] --> module-Authentication["module-Authentication"]
    module-Analytics["module-Analytics"] --> module-Dashboard["module-Dashboard"]
    database-sessions["database-sessions"] --> database-users["database-users"]
    testSuite-auth["testSuite-auth"] --> module-Authentication["module-Authentication"]
```

---

## Architectural Verification
All modular bounds conform to dependency injection standards. No cyclic dependencies detected.
