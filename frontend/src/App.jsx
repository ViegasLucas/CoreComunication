import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Target, Moon, Sun, LogOut, CheckCircle2, 
  Save, Plus, AlertCircle, Briefcase, ChevronRight, MessageSquare, 
  History, UserCircle2, Calendar, Sparkles, BarChart3 
} from 'lucide-react';

// Importa o teu Layout
import MainLayout from './layouts/MainLayout';
// Importa a tua View principal
import ConducaoView from './views/ConducaoView';
// Importa a tua Sidebar
import Sidebar from './components/features/Sidebar';
// Importa os dados da lista que criámos
import { dadosIniciaisEquipe } from './dados';


export default function App() {
  const [viewAtiva, setViewAtiva] = useState('conducao');
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [mensagemToast, setMensagemToast] = useState('');
  const [abaConducao, setAbaConducao] = useState('nova'); 
  const [perfilLider, setPerfilLider] = useState('tecnico'); 
  const [formAnotacoes, setFormAnotacoes] = useState({ checkin: '', pauta: '', acordos: '' });
  const [listaLiderados, setListaLiderados] = useState(dadosIniciaisEquipe);
  const [lideradoAtivoId, setLideradoAtivoId] = useState(1);

  const lideradoAtivo = listaLiderados.find(l => l.id === lideradoAtivoId);

  const btnMudarTema = () => setTemaEscuro(!temaEscuro);

  useEffect(() => {
    if (temaEscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [temaEscuro]);

  return (
    <MainLayout 
      sidebar={
        <Sidebar 
          temaEscuro={temaEscuro} 
          btnMudarTema={btnMudarTema} 
        />
      }
    >
      <ConducaoView lideradoAtivo={lideradoAtivo} />
    </MainLayout>
  );
}