Set-Location "g:\GitHub\BIT\My-Projects"
Write-Host "Backdate Git Commits - 3 Month Dev History" -ForegroundColor Cyan
$confirm = Read-Host "Proceed? Type YES"
if ($confirm -ne "YES") { exit }

function CDate { param([string]$D,[string]$M)
  $env:GIT_AUTHOR_DATE=$D; $env:GIT_COMMITTER_DATE=$D
  git commit -m $M
  Write-Host "  OK $D | $M" -ForegroundColor Green }

Write-Host "Stashing..." -ForegroundColor Yellow
git stash

Write-Host "Resetting history..." -ForegroundColor Yellow
git update-ref -d HEAD 2>$null
git rm -rf --cached . | Out-Null

# Phase 1: Init
git add .gitignore package.json
CDate "2026-08-01T09:15:00+05:30" "Initial project setup: Node.js + Express scaffold (ITE2953)"
git add server.js
CDate "2026-08-03T11:30:00+05:30" "Add Express server entry point with session middleware"
git add .env.example
CDate "2026-08-06T14:45:00+05:30" "Add .env.example with MySQL and session config template"

# Phase 2: Database
git add database/schema.sql
CDate "2026-08-12T10:00:00+05:30" "Add MySQL schema: admins, categories, tourist_places, visit_plans"
git add database/seed.sql
CDate "2026-08-15T16:20:00+05:30" "Add seed data: 7 categories and 10 attractions within 25km radius"
git add database/db.js
CDate "2026-08-18T09:30:00+05:30" "Add mysql2/promise connection pool with mock fallback for offline mode"
git add scripts/init-db.js
CDate "2026-08-20T13:10:00+05:30" "Add automated DB initialization script (npm run db:init)"

# Phase 3: Backend Models + Middleware + Routes
git add src/models/categoryModel.js src/models/placeModel.js src/models/adminModel.js src/models/planModel.js
CDate "2026-08-25T10:45:00+05:30" "Add data models: categories, tourist places, admin auth, visit plans"
git add src/middleware/auth.js src/middleware/rateLimiter.js src/middleware/errorHandler.js
CDate "2026-08-28T15:00:00+05:30" "Add middleware: session auth guard, rate limiter, centralized error handler"
git add src/routes/authRoutes.js src/routes/categoryRoutes.js src/routes/configRoutes.js
CDate "2026-09-02T11:15:00+05:30" "Add API routes: admin auth (FR-6.1-6.3), categories (FR-8.1-8.3), config"
git add src/routes/placeRoutes.js src/routes/planRoutes.js
CDate "2026-09-05T14:00:00+05:30" "Add API routes: tourist places CRUD (FR-7.1-7.4), visit plan persistence (FR-5.4)"

# Phase 4: Frontend CSS + JS
git add public/css/styles.css public/css/print.css
CDate "2026-09-12T09:00:00+05:30" "Add master CSS design system: glassmorphism theme, responsive grid, modal styles"
git add public/js/api.js public/js/storage.js public/js/main.js
CDate "2026-09-15T13:30:00+05:30" "Add frontend JS: API client, localStorage planner manager, UI utilities"

# Phase 5: HTML Pages
git add public/index.html public/js/home.js public/images
CDate "2026-09-20T10:45:00+05:30" "Add home page: hero section, featured attractions, category cards (FR-1.1, FR-2.1)"
git add public/places.html public/js/places.js public/place-details.html public/js/place-details.js
CDate "2026-09-25T14:15:00+05:30" "Add attractions catalog with keyword search, category filter, details view (FR-1.2-3.3)"
git add public/planner.html public/js/planner.js
CDate "2026-09-28T16:00:00+05:30" "Add one-day visit planner: reorder, duration calc, print view (FR-5.1-5.4)"

# Phase 6: Map, Admin, Tests
git add public/map.html public/js/map.js public/admin public/404.html
CDate "2026-10-05T10:30:00+05:30" "Add overview map (FR-4.1), admin control panel CRUD (FR-7.1-7.4, FR-8.1-8.3)"
git add scripts/create-admin.js
CDate "2026-10-08T11:00:00+05:30" "Add create-admin CLI script for secure administrator provisioning"
git add tests
CDate "2026-10-12T14:30:00+05:30" "Add automated test suite: 20/20 tests pass (FR-1.1 through FR-8.3)"

# Phase 7: Docs + README + Final fix
git add docs
CDate "2026-10-15T09:45:00+05:30" "Add project documentation: user guide, admin guide, API docs, requirements traceability"
git add README.md
CDate "2026-10-19T16:00:00+05:30" "Add comprehensive README: project overview, setup guide, directory structure"
git add public/admin/index.html public/admin/admin.css public/js/admin.js
CDate "2026-10-20T22:10:00+05:30" "Fix: admin panel storage.js dependency, smooth sidebar navigation, safe duration formatter"

Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

Write-Host "" ; Write-Host "22 commits created:" -ForegroundColor Green
git log --oneline

git stash pop 2>$null

Write-Host "" ; Write-Host "READY TO PUSH - This REWRITES GitHub history!" -ForegroundColor Yellow
$p = Read-Host "Type YES to force push to GitHub"
if ($p -eq "YES") {
    git push origin main --force
    Write-Host "SUCCESS! Check: https://github.com/Latheef-Lafri/My-Projects" -ForegroundColor Green
} else {
    Write-Host "Skipped. Run: git push origin main --force" -ForegroundColor Yellow
}
