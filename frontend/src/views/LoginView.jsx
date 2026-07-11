import React, { useState } from "react";
import { HelpCircle, Mail, Lock, ArrowRight, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado do fluxo "Esqueci a senha"
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetLink, setResetLink] = useState(null); // debug: para dev mostrar o link

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetLink(null);

    const normalizedEmail = resetEmail.trim().toLowerCase();

    try {
      // 1. Validar se o e-mail existe no sistema (via backend)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        // E-mail inexistente ou outro erro
        setResetError(data.error || "Erro ao solicitar redefinição.");
        return;
      }

      // 2. E-mail existe! Enviar o reset real pelo Firebase SDK (chega na caixa de entrada)
      const actionCodeSettings = {
        url: `${window.location.origin}?view=reset-password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, normalizedEmail, actionCodeSettings);
      setResetSuccess(true);

    } catch (err) {
      console.error("[ResetPassword]", err);
      if (err.code === "auth/too-many-requests") {
        setResetError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setResetError("Erro ao enviar e-mail de redefinição. Tente novamente.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    
    // Não há mais regra chumbada. Buscaremos do banco.

    try {
      // Faz o login real com o Firebase
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      
      // Obtém o token JWT
      const token = await userCredential.user.getIdToken();
      
      // Salva no localStorage para uso posterior na API
      localStorage.setItem("token", token);
      localStorage.setItem("email", normalizedEmail);
      
      // Busca as informações do usuário no banco de dados (Nome, Role, Perfil)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Regra de fallback baseada no email, caso o usuário ainda não exista no Firestore
      let fallbackRole = 'leader';
      if (normalizedEmail === 'visaorh@gmail.com') fallbackRole = 'hr';
      else if (normalizedEmail === 'visaooperacional@gmail.com') fallbackRole = 'employee';
      
      let userData = { 
        role: fallbackRole, 
        name: userCredential.user.displayName || 'Usuário', 
        profile: null 
      }; // Fallback

      if (res.ok) {
        const dbData = await res.json();
        userData = { ...userData, ...dbData }; // Mescla os dados do banco
      } else {
        console.warn('[Auth] Não foi possível carregar perfil do banco, usando fallback.');
      }

      console.log('[Auth] Usuário autenticado e token salvo com sucesso.', userData);
      
      // Dispara sucesso para o App.jsx
      onLoginSuccess(userData);
    } catch (error) {
      console.error('[Auth] Erro ao autenticar:', error.message);
      setError("Falha ao fazer login. Verifique seu e-mail e senha.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 items-center justify-center">
              <img
                src="/logo-brancoClearIt.png"
                alt="ClearIT Logo"
                className="h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Smart Leading
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Frase teste
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="email" className="block text-base font-medium text-foreground">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="block text-base font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive animate-in slide-in-from-top-2 fade-in duration-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 hover:shadow-primary/35 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Entrando..." : "Entrar"}
              {!isLoading && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </form>

          {/* subtle links */}
          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(true);
                setResetEmail(email); // preenche com o email já digitado
                setResetSuccess(false);
                setResetError(null);
                setResetLink(null);
              }}
              className="transition hover:text-primary hover:underline"
            >
              Esqueci a senha
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 transition hover:text-primary hover:underline"
            >
              Ajuda
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground/70">
          Ao continuar, você concorda com os Termos de Serviço e Política de Privacidade.
        </p>
      </div>

      {/* MODAL DE ESQUECI A SENHA */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-card/95 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl animate-scale-in">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {resetSuccess ? "E-mail Enviado!" : "Redefinir Senha"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {resetSuccess
                  ? "Verifique sua caixa de entrada e spam."
                  : "Informe seu e-mail para receber o link de redefinição."}
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="nome@empresa.com"
                    className="w-full rounded-xl border border-input bg-background/60 py-3.5 pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/40"
                    required
                    autoFocus
                  />
                </div>

                {resetError && (
                  <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive animate-in slide-in-from-top-2 fade-in duration-300">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p>{resetError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Enviando...</>
                  ) : (
                    <>Enviar Link de Redefinição</>  
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm text-emerald-300">
                    Link de redefinição enviado para <span className="font-medium">{resetEmail}</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowForgotPassword(false)}
              className="mt-6 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
