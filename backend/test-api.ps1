# =============================================================
# Smart Leading Backend - Script de Testes (Task 2.2 + 2.3)
# Execução: .\test-api.ps1
# PRÉ-REQUISITO: Servidor rodando em outro terminal com `npm run dev`
# =============================================================

# ── CONFIGURAÇÃO ─────────────────────────────────────────────
$BASE_URL = "http://localhost:3001"

# Para os Testes 3 e 4 (token real + Gemini), preencha:
# FIREBASE_WEB_API_KEY: Firebase Console > Configurações > Geral > Chave de API da Web
$FIREBASE_WEB_API_KEY = "COLE_SUA_WEB_API_KEY_AQUI"
$TEST_USER_EMAIL      = "visaolider@exemplo.com"
$TEST_USER_PASSWORD   = "COLE_A_SENHA_AQUI"
# ─────────────────────────────────────────────────────────────

$PASS = "[PASS]"
$FAIL = "[FAIL]"
$INFO = "[INFO]"

function Write-Result($label, $passed, $detail) {
    $symbol = if ($passed) { $PASS } else { $FAIL }
    $color  = if ($passed) { "Green" } else { "Red" }
    Write-Host "$symbol $label" -ForegroundColor $color
    if ($detail) { Write-Host "       $detail" -ForegroundColor Gray }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Smart Leading - Testes Backend         " -ForegroundColor Cyan
Write-Host "  Task 2.2 (Auth) + Task 2.3 (Gemini/SBI)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ── TASK 2.2 ─────────────────────────────────────────────────
Write-Host "--- TASK 2.2: Servidor + Auth ---" -ForegroundColor Magenta
Write-Host ""

# Teste 1: Healthcheck
Write-Host "[ Teste 1 ] GET /api/health" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method GET -ErrorAction Stop
    $ok = $r.status -eq "ok"
    Write-Result "Servidor respondendo" $ok "status=$($r.status) | timestamp=$($r.timestamp)"
} catch {
    Write-Result "Servidor respondendo" $false "Erro: $($_.Exception.Message) -- o servidor esta rodando?"
}

Write-Host ""

# Teste 2a: Sem token
Write-Host "[ Teste 2a ] POST /api/chat SEM token -> 401" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE_URL/api/chat" -Method POST `
        -ContentType "application/json" -Body '{"message":"teste"}' -ErrorAction Stop
    Write-Result "Bloqueio sem token (401)" $false "PROBLEMA: Passou sem token!"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Result "Bloqueio sem token (401)" ($code -eq 401) "HTTP $code recebido"
}

Write-Host ""

# Teste 2b: Token inválido
Write-Host "[ Teste 2b ] POST /api/chat com token INVALIDO -> 403" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer token.invalido.qualquer" }
    Invoke-RestMethod -Uri "$BASE_URL/api/chat" -Method POST `
        -ContentType "application/json" -Headers $headers -Body '{"message":"teste"}' -ErrorAction Stop
    Write-Result "Rejeicao de token invalido (403)" $false "PROBLEMA: Token invalido foi aceito!"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Result "Rejeicao de token invalido (403)" ($code -eq 403) "HTTP $code recebido"
}

Write-Host ""

# ── TASK 2.3 (requer FIREBASE_WEB_API_KEY) ───────────────────
Write-Host "--- TASK 2.3: Gemini SBI + Filtro LGPD ---" -ForegroundColor Magenta
Write-Host ""

if ($FIREBASE_WEB_API_KEY -eq "COLE_SUA_WEB_API_KEY_AQUI") {
    Write-Host "$INFO Testes 3, 4 e 5 pulados -- configure FIREBASE_WEB_API_KEY no topo do script." -ForegroundColor DarkYellow
} else {
    # Obter token real
    $idToken = $null
    try {
        Write-Host "       Autenticando no Firebase..." -ForegroundColor Gray
        $loginBody = @{
            email = $TEST_USER_EMAIL; password = $TEST_USER_PASSWORD; returnSecureToken = $true
        } | ConvertTo-Json
        $loginResponse = Invoke-RestMethod `
            -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$FIREBASE_WEB_API_KEY" `
            -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
        $idToken = $loginResponse.idToken
        Write-Host "       Token obtido com sucesso." -ForegroundColor Gray
    } catch {
        Write-Host "$FAIL Nao foi possivel autenticar no Firebase: $($_.Exception.Message)" -ForegroundColor Red
    }

    if ($idToken) {
        $authHeaders = @{ Authorization = "Bearer $idToken" }

        # Teste 3: Geração SBI legítima
        Write-Host "[ Teste 3 ] Geracao de roteiro SBI com input valido -> 200" -ForegroundColor Yellow
        try {
            $body = '{"message":"Na reuniao de sprint de segunda-feira, o desenvolvedor nao entregou as tasks prometidas e nao avisou o time com antecedencia."}'
            $r = Invoke-RestMethod -Uri "$BASE_URL/api/chat" -Method POST `
                -ContentType "application/json" -Headers $authHeaders -Body $body -ErrorAction Stop
            $hasSBI  = $r.reply -match "SITUA|COMPORTAMENTO|IMPACTO"
            $noBlock = $r.blocked -eq $false
            Write-Result "Roteiro SBI gerado (200)" ($hasSBI -and $noBlock) `
                "blocked=$($r.blocked) | preview: $($r.reply.Substring(0, [Math]::Min(80, $r.reply.Length)))..."
        } catch {
            Write-Result "Roteiro SBI gerado (200)" $false $_.Exception.Message
        }

        Write-Host ""

        # Teste 4: Filtro LGPD — CPF no input
        Write-Host "[ Teste 4 ] Filtro LGPD: CPF no input -> deve bloquear" -ForegroundColor Yellow
        try {
            $body = '{"message":"O colaborador Joao Silva, CPF 123.456.789-00, nao entregou o relatorio."}'
            $r = Invoke-RestMethod -Uri "$BASE_URL/api/chat" -Method POST `
                -ContentType "application/json" -Headers $authHeaders -Body $body -ErrorAction Stop
            $isBlocked = $r.blocked -eq $true
            Write-Result "LGPD bloqueou CPF" $isBlocked `
                "blocked=$($r.blocked) | reply: $($r.reply.Substring(0, [Math]::Min(80, $r.reply.Length)))..."
        } catch {
            Write-Result "LGPD bloqueou CPF" $false $_.Exception.Message
        }

        Write-Host ""

        # Teste 5: Filtro LGPD — e-mail no input
        Write-Host "[ Teste 5 ] Filtro LGPD: E-mail no input -> deve bloquear" -ForegroundColor Yellow
        try {
            $body = '{"message":"O colaborador joao@empresa.com nao apareceu na reuniao."}'
            $r = Invoke-RestMethod -Uri "$BASE_URL/api/chat" -Method POST `
                -ContentType "application/json" -Headers $authHeaders -Body $body -ErrorAction Stop
            $isBlocked = $r.blocked -eq $true
            Write-Result "LGPD bloqueou e-mail" $isBlocked `
                "blocked=$($r.blocked) | reply: $($r.reply.Substring(0, [Math]::Min(80, $r.reply.Length)))..."
        } catch {
            Write-Result "LGPD bloqueou e-mail" $false $_.Exception.Message
        }
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Testes concluidos                      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
