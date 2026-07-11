import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ResetPasswordView({ oobCode, onBackToLogin }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invalidCode, setInvalidCode] = useState(false);

  // Validações em tempo real
  const hasMinLength = newPassword.length >= 6;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  // Verificar o código oobCode ao carregar
  useEffect(() => {
    const verifyCode = async () => {
      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setVerifiedEmail(email);
        setIsVerifying(false);
      } catch (err) {
        console.error("[ResetPassword] Código inválido:", err);
        setInvalidCode(true);
        setIsVerifying(false);
      }
    };

    if (oobCode) {
      verifyCode();
    } else {
      setInvalidCode(true);
      setIsVerifying(false);
    }
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error("[ResetPassword] Erro ao redefinir:", err);
      if (err.code === "auth/expired-action-code") {
        setError("Este link expirou. Solicite um novo link de redefinição.");
      } else if (err.code === "auth/invalid-action-code") {
        setError("Este link é inválido ou já foi utilizado.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha é muito fraca. Use pelo menos 6 caracteres.");
      } else {
        setError("Erro ao redefinir a senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Regra de validação individual
  const ValidationRule = ({ passed, label }) => (
    <div className={`flex items-center gap-2 text-sm transition-all duration-300 ${passed ? "text-emerald-400" : "text-slate-500"}`}>
      {passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {label}
    </div>
  );

  // Loading enquanto verifica o código
  if (isVerifying) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, oklch(0.35 0.15 262.881 / 0.35), transparent 55%), radial-gradient(circle at 80% 90%, oklch(0.25 0.08 262.881 / 0.22), transparent 45%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando link de redefinição...</p>
        </div>
      </main>
    );
  }

  // Código inválido / expirado
  if (invalidCode) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, oklch(0.35 0.15 262.881 / 0.35), transparent 55%), radial-gradient(circle at 80% 90%, oklch(0.25 0.08 262.881 / 0.22), transparent 45%)",
          }}
        />
        <div className="relative w-full max-w-lg">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Link Inválido</h1>
            <p className="text-muted-foreground mb-8">
              Este link de redefinição é inválido ou já expirou. Solicite um novo link na tela de login.
            </p>
            <button
              onClick={onBackToLogin}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
            >
              <ArrowLeft className="h-5 w-5" />
              Voltar ao Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Sucesso
  if (success) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, oklch(0.35 0.15 262.881 / 0.35), transparent 55%), radial-gradient(circle at 80% 90%, oklch(0.25 0.08 262.881 / 0.22), transparent 45%)",
          }}
        />
        <div className="relative w-full max-w-lg animate-scale-in">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/30">
              <ShieldCheck className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-3">Senha Redefinida!</h1>
            <p className="text-muted-foreground mb-8">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com a nova senha.
            </p>
            <button
              onClick={onBackToLogin}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.98]"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
              Ir para o Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Formulário principal
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 w-full">
      {/* subtle gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, oklch(0.35 0.15 262.881 / 0.35), transparent 55%), radial-gradient(circle at 80% 90%, oklch(0.25 0.08 262.881 / 0.22), transparent 45%)",
        }}
      />

      <div className="relative w-full max-w-lg animate-scale-in">
        {/* glass card */}
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
          {/* brand mark */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 items-center justify-center">
              <img
                src="/logo-brancoClearIt.png"
                alt="ClearIT Logo"
                className="h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Redefinir Senha
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Defina uma nova senha para <span className="font-medium text-primary">{verifiedEmail}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova Senha */}
            <div className="space-y-2">
              <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Validações em tempo real */}
            <div className="rounded-xl border border-border/50 bg-background/30 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Requisitos da senha
              </p>
              <ValidationRule passed={hasMinLength} label="Mínimo de 6 caracteres" />
              <ValidationRule passed={hasUppercase} label="Pelo menos 1 letra maiúscula" />
              <ValidationRule passed={hasNumber} label="Pelo menos 1 número" />
              <ValidationRule passed={passwordsMatch} label="As senhas coincidem" />
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!allValid || isLoading}
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Redefinir Senha
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
