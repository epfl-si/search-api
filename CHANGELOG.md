# CHANGELOG

### v0.4.0 / 2024-01-31

- Add CSV unit export
- Add suggestions for people
- Add cache to Unit (except CSV)
- Add cache to people suggestions
- Add limit parameter to people suggestions
- Set unit address to null if none
- Set unit head to null if none
- Set url with null if none
- Implement inclusive with gender 'X' (Unit API)
- Fix missing ENV when running Docker
- Deploy only in production with --prod option
- Bump follow-redirects from 1.15.2 to 1.15.4

### v0.3.0 / 2023-12-12

- Add API MD service
- Add adminData for internal request, based on header X-EPFL-Internal
- Fix head of unit has no email
- Fix head of unit has left
- Rename labels in tests (Unit API)
- Debug with VS Code
- Update DB CADI host (staging)
- Update googleapis to 129.0.0
- Bump axios from 1.4.0 to 1.6.0
- Bump semver to 6.3.1 || 7.5.4

### v0.2.0 / 2023-11-07

- Enable Gzip compression
- Add compression package
- Add people (Unit API)
- Add email and profile (Unit API)
- Get firstname and name according to display name
- Fix filter on subunits (ghost + cmpl_type)
- Fix sort of hierarchy path
- Fix cmpl_type visible condition
- Fix unit without address
- Fix LDAP mock and directory
- Update Elements to 4.5.1
- Update Twitter logo
- Bump @babel/traverse from 7.21.4 to 7.23.2

### v0.1.0 / 2023-08-29

- Address route
- Handle ldap client errors
- Improve Docker image (speed and permissions)
- Update prettier from 2.8.7 to 3.0.1
- Fix environment variables for Docker Compose
- Fix 'node' engine requirement
- Improve section deploy in documentation (Ansible)

### v0.0.1 / 2023-08-02

- First version, released on an unsuspecting world.
