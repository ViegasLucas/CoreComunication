import React, { useState } from "react";
import { HelpCircle, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
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

  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMsg(null);
    
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail) {
      setError("Por favor, digite seu e-mail no campo acima para recuperar a senha.");
      return;
    }

    try {
      setIsLoading(true);
      
      await sendPasswordResetEmail(auth, normalizedEmail);
      setSuccessMsg("E-mail de recuperação enviado! Verifique sua caixa de entrada (e a de spam).");
    } catch (err) {
      console.error('[Auth] Erro ao redefinir senha:', err.message);
      if (err.code === 'auth/user-not-found') {
        setError("Este e-mail não está cadastrado em nosso sistema.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Por favor, insira um endereço de e-mail válido.");
      } else {
        setError("Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.");
      }
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
              <div className="rounded-xl bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {successMsg}
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
              onClick={handleForgotPassword}
              disabled={isLoading}
              className="transition hover:text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
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
    </main>
  );
}
