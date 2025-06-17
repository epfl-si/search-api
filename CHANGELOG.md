# CHANGELOG

### v1.4.0 / 2025-06-17

- Tweak cpu and memory
- Update googleapis to 150.0.1

### v1.4.0 / 2025-05-15

- Add Grafana dashboard for API
- Fix subunits without name in Cadi DB
- Migrate to ESLint 9.x
- Bump formidable from 3.5.1 to 3.5.4

### v1.3.0 / 2025-03-24

- Add prom-client package
- Add express-prom-bundle package
- Get Prometheus Metrics
- Enable multiple COSEC
- Fix whitespace for people filter
- Bump axios from 1.7.4 to 1.8.2

### v1.2.0 / 2025-03-12

- Add safety correspondents (COSEC)
- Add labels and annotations for Topology view
- Update Elements to 5.2.0
- Simplify `ansible_python_interpreter`
- Remove unnecessary log

### v1.1.0 / 2025-01-27

- Add Graph Search v2
- Add jump server to Cadi DB
- Update CodeQL Action to v3
- Bump path-to-regexp and express
- Bump micromatch to 4.0.8
- Bump cross-spawn to 7.0.6
- Fix status badges

### v1.0.0 / 2024-11-28

- Migrate to OpenShift 4
- Add memorystore package
- Add express-session package
- Add Ansible in VS Code
- Init passport-tequila
- Remove starting v in image tag
- Update Trivy to 0.57.1
- Bump body-parser and express
- Bump path-to-regexp and express
- Bump send and express
- Bump serve-static and express
- Bump axios from 1.6.0 to 1.7.4
- Bump cookie, express and express-session

### v0.9.4 / 2024-07-08

- Boost ranking for people with multiple names
- Optimize sortPersons
- Version is obsolete (docker-compose.yml)

### v0.9.3 / 2024-06-13

- Fix accreds rank
- Bump braces to 3.0.3
- Bump mysql2 from 3.9.7 to 3.9.8

### v0.9.2 / 2024-05-21

- Limit search to 6 terms for people
- Get IP address of client through proxies

### v0.9.1 / 2024-05-15

- Add alias for unit route

### v0.9.0 / 2024-05-13

- Add CSV people export
- Add cache to people CSV
- Add legacy route for people
- Add robots.txt
- Add OpenShift routes from old search
- Enable Node.js Inspector
- Restart debug sessions automatically
- Update eslint-plugin-jest to 28.3.0
- Update googleapis to 135.0.0
- Update supertest to 7.0.0
- Bump ejs from 3.1.9 to 3.1.10

### v0.8.1 / 2024-04-24

- Fix axios configuration for apimd
- Bump mysql2 from 3.9.4 to 3.9.7

### v0.8.0 / 2024-04-22

- Add search by room
- Add cache to people
- Improve people ranking
- Fix phones and rooms visibility
- Fix phones and rooms (people)
- Get unit code (people)
- Remove special characters (people)
- Bump mysql2 from 3.3.3 to 3.9.4
- Bump express from 4.18.2 to 4.19.2

### v0.7.0 / 2024-03-27

- Add units suggestions
- Refactor visible condition by hierarchy

### v0.6.1 / 2024-03-20

- Fix suggestions ranking
- Add passeport-tequila package
- Add passport package
- Update actions/setup-node to v4
- Update actions/checkout to v4
- Update codecov/codecov-action to v4
- Bump follow-redirects from 1.15.4 to 1.15.6

### v0.6.0 / 2024-02-14

- Semantic search v2

### v0.5.0 / 2024-02-13

- Add search unit by ID
- Add Docker as pip extra

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
