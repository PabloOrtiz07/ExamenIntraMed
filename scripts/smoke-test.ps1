# Smoke test for the Star Wars Movies API.
# Needs the API running on http://localhost:3000 with the seeded admin from .env.

$base = 'http://localhost:3000'
$adminEmail = 'admin@example.com'     # must match ADMIN_EMAIL in .env
$adminPassword = 'ChangeMe123!'       # must match ADMIN_PASSWORD in .env
$failures = 0

function Call([string]$method, [string]$path, [string]$token, $body) {
  $params = @{ Method = $method; Uri = "$base$path"; UseBasicParsing = $true; Headers = @{} }
  if ($token) { $params.Headers.Authorization = "Bearer $token" }
  if ($body) { $params.Body = ($body | ConvertTo-Json); $params.ContentType = 'application/json' }
  try {
    $r = Invoke-WebRequest @params
    return [pscustomobject]@{ Status = [int]$r.StatusCode; Body = $r.Content }
  } catch {
    if ($_.Exception.Response) {
      return [pscustomobject]@{ Status = [int]$_.Exception.Response.StatusCode; Body = '' }
    }
    return [pscustomobject]@{ Status = 0; Body = $_.Exception.Message }
  }
}

function Check([string]$name, $expected, $actual) {
  if ($expected -eq $actual) { Write-Host "PASS  $name" -ForegroundColor Green }
  else { Write-Host "FAIL  $name (expected $expected, got $actual)" -ForegroundColor Red; $script:failures++ }
}

# Is the API reachable at all?
$ping = Call GET '/docs-json' $null $null
if ($ping.Status -ne 200) {
  Write-Host "The API is not reachable at $base (status $($ping.Status)). Start it with: npm run start:dev" -ForegroundColor Red
  exit 1
}

$email = "user$(Get-Random)@test.com"
$password = 'Password123'

Write-Host "`n--- 1/2. Users and auth ---"
Check 'sign-up creates a user'            201 (Call POST '/auth/sign-up' $null @{ email = $email; password = $password }).Status
Check 'sign-up rejects duplicate email'   409 (Call POST '/auth/sign-up' $null @{ email = $email; password = $password }).Status
Check 'sign-up rejects invalid email'     400 (Call POST '/auth/sign-up' $null @{ email = 'nope'; password = $password }).Status
Check 'sign-up rejects short password'    400 (Call POST '/auth/sign-up' $null @{ email = "a$email"; password = 'short' }).Status
Check 'sign-up rejects role injection'    400 (Call POST '/auth/sign-up' $null @{ email = "b$email"; password = $password; role = 'admin' }).Status
Check 'login rejects wrong password'      401 (Call POST '/auth/login' $null @{ email = $email; password = 'WrongPass1' }).Status
Check 'login rejects unknown email'       401 (Call POST '/auth/login' $null @{ email = "zz$email"; password = $password }).Status

$userLogin = Call POST '/auth/login' $null @{ email = $email; password = $password }
Check 'regular user logs in'              200 $userLogin.Status
$adminLogin = Call POST '/auth/login' $null @{ email = $adminEmail; password = $adminPassword }
Check 'seeded admin logs in'              200 $adminLogin.Status

if ($userLogin.Status -ne 200 -or $adminLogin.Status -ne 200) {
  Write-Host "`nCannot continue without both tokens. Check ADMIN_EMAIL / ADMIN_PASSWORD at the top of this script." -ForegroundColor Red
  exit 1
}
$userToken = ($userLogin.Body | ConvertFrom-Json).accessToken
$adminToken = ($adminLogin.Body | ConvertFrom-Json).accessToken

Write-Host "`n--- 3. Sync (admin only) ---"
Check 'sync without token'                401 (Call POST '/sync/movies' $null $null).Status
Check 'sync as regular user'              403 (Call POST '/sync/movies' $userToken $null).Status
$sync1 = Call POST '/sync/movies' $adminToken $null
Check 'sync as admin'                     200 $sync1.Status
if ($sync1.Status -ne 200) {
  Write-Host "`nThe sync failed (status $($sync1.Status)). If it is 502, the Star Wars API (swapi.dev) is unreachable. Movie checks are skipped." -ForegroundColor Yellow
  exit 1
}
Check 'sync fetched some films'           $true (($sync1.Body | ConvertFrom-Json).fetched -gt 0)
$sync2 = Call POST '/sync/movies' $adminToken $null
Check 'second sync creates nothing'       0 ($sync2.Body | ConvertFrom-Json).created

Write-Host "`n--- 3. Movies ---"
$listRes = Call GET '/movies' $null $null
Check 'list is public'                    200 $listRes.Status
$list = @(ConvertFrom-Json $listRes.Body | ForEach-Object { $_ })
Check 'list has movies'                   $true ($list.Count -gt 0)
$synced = $list | Where-Object { $_.externalUrl } | Select-Object -First 1
if (-not $synced) {
  Write-Host "`nNo synced movie found, so the detail checks cannot run." -ForegroundColor Red
  exit 1
}
$id = $synced.id

Check 'details without token'             401 (Call GET "/movies/$id" $null $null).Status
Check 'details as regular user'           200 (Call GET "/movies/$id" $userToken $null).Status
Check 'details as admin (decision B)'     200 (Call GET "/movies/$id" $adminToken $null).Status
Check 'details with invalid uuid'         400 (Call GET '/movies/abc' $userToken $null).Status
Check 'details of unknown movie'          404 (Call GET '/movies/00000000-0000-4000-8000-000000000000' $userToken $null).Status

$newMovie = @{ title = 'Smoke Test Movie'; episodeId = 99; openingCrawl = 'crawl'; director = 'Dir'; producer = 'Prod'; releaseDate = '2000-01-01' }
Check 'create without token'              401 (Call POST '/movies' $null $newMovie).Status
Check 'create as regular user'            403 (Call POST '/movies' $userToken $newMovie).Status
Check 'create invalid body as admin'      400 (Call POST '/movies' $adminToken @{ title = 'X' }).Status
$created = Call POST '/movies' $adminToken $newMovie
Check 'create as admin'                   201 $created.Status
$newId = ($created.Body | ConvertFrom-Json).id

Check 'update as regular user'            403 (Call PATCH "/movies/$newId" $userToken @{ title = 'Hacked' }).Status
$upd = Call PATCH "/movies/$newId" $adminToken @{ title = 'Smoke Test Edited' }
Check 'update as admin'                   200 $upd.Status
Check 'update changed the title'          'Smoke Test Edited' ($upd.Body | ConvertFrom-Json).title

Check 'delete as regular user'            403 (Call DELETE "/movies/$newId" $userToken $null).Status
Check 'delete as admin'                   204 (Call DELETE "/movies/$newId" $adminToken $null).Status
Check 'delete again returns not found'    404 (Call DELETE "/movies/$newId" $adminToken $null).Status

Write-Host "`n--- Sync keeps admin edits (option A) ---"
$originalTitle = $synced.title
Call PATCH "/movies/$id" $adminToken @{ title = 'Edited by admin' } | Out-Null
Call POST '/sync/movies' $adminToken $null | Out-Null
$after = (Call GET "/movies/$id" $adminToken $null).Body | ConvertFrom-Json
Check 'sync did not overwrite the edit'   'Edited by admin' $after.title
Call PATCH "/movies/$id" $adminToken @{ title = $originalTitle } | Out-Null

Write-Host "`n--- 5. Documentation ---"
Check 'Swagger UI is served'              200 (Call GET '/docs' $null $null).Status
Check 'OpenAPI JSON is served'            200 (Call GET '/docs-json' $null $null).Status

Write-Host ''
if ($failures -eq 0) { Write-Host 'ALL CHECKS PASSED' -ForegroundColor Green }
else { Write-Host "$failures CHECK(S) FAILED" -ForegroundColor Red; exit 1 }