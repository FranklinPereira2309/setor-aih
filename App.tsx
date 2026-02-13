
import React, { useState, useEffect, useMemo } from 'react';
import { Patient, PatientFormData, DocumentConfig } from './types';
import { storageService } from './services/storageService';
import PatientForm from './components/PatientForm';
import DocumentModal from './components/DocumentModal';
import {
  Search,
  Users,
  Trash2,
  Edit3,
  FileText,
  Plus,
  LayoutGrid,
  CreditCard,
  Phone,
  ShieldCheck,
  Settings,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPatientForDoc, setSelectedPatientForDoc] = useState<Patient | null>(null);
  const [autoOpenDocConfig, setAutoOpenDocConfig] = useState<Partial<DocumentConfig> | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await storageService.loadData();
      setPatients(storageService.getPatients());
      setCurrentLogo(storageService.getLogo());
    };
    init();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.cadSus.includes(term)
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [patients, searchTerm]);

  const handleSavePatient = (data: PatientFormData & { id?: string, extra?: Partial<DocumentConfig> }) => {
    let savedPatient: Patient;

    if (data.id) {
      savedPatient = {
        name: data.name,
        phone: data.phone,
        cadSus: data.cadSus,
        id: data.id,
        updatedAt: Date.now()
      };
      storageService.updatePatient(savedPatient);
    } else {
      savedPatient = {
        name: data.name,
        phone: data.phone,
        cadSus: data.cadSus,
        id: Math.random().toString(36).substr(2, 9),
        updatedAt: Date.now()
      };
      storageService.addPatient(savedPatient);
    }

    setPatients(storageService.getPatients());
    setIsFormOpen(false);
    setEditingPatient(undefined);

    // Se houver dados extras de procedimento/origem, abre o modal de documento automaticamente
    if (data.extra) {
      setAutoOpenDocConfig(data.extra);
      setSelectedPatientForDoc(savedPatient);
    }
  };

  const handleDeletePatient = (id: string) => {
    if (confirm('Deseja realmente excluir este cadastro?')) {
      storageService.deletePatient(id);
      setPatients(storageService.getPatients());
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        storageService.saveLogo(base64String);
        setCurrentLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearLogo = () => {
    storageService.clearLogo();
    setCurrentLogo(null);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      {/* Header Gov Style */}
      <header className="bg-blue-700 shadow-xl border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-2xl shadow-inner">
              <ShieldCheck className="text-blue-700" size={32} />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-black leading-tight tracking-tight">Entrega de Documentos A.I.H</h1>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-90">Secretaria Municipal de Saúde - Itabuna</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:block text-right mr-4">
              <p className="text-white font-bold text-sm">Setor de Cirurgias Eletivas</p>
              <p className="text-blue-100 text-xs">Atendimento: 07h às 13h</p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-lg active:scale-95"
              title="Configurações do Sistema"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="mb-12">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">Localizar Paciente (Nome ou CadSUS)</label>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
              <input
                type="text"
                placeholder="Ex: João Silva ou 7000..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-16 py-5 bg-white rounded-3xl border-2 border-transparent shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-xl font-bold placeholder:text-slate-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  title="Limpar pesquisa"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
            <LayoutGrid className="text-blue-600" size={24} />
            {searchTerm ? 'Resultados da Pesquisa' : 'Cadastros Recentes'}
            <span className="bg-blue-100 text-blue-700 text-xs font-black py-1.5 px-3.5 rounded-full">
              {filteredPatients.length}
            </span>
          </h2>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[60vh]">
            <div className="overflow-y-auto p-4 space-y-4">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm group-hover:bg-blue-50 transition-colors shrink-0">
                      <Users className="text-slate-400 group-hover:text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">{patient.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-1">
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                          <CreditCard size={14} className="text-slate-300" />
                          <span>CadSUS: {patient.cadSus}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase">
                          <Phone size={14} className="text-slate-300" />
                          <span>Tel: {patient.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => { setAutoOpenDocConfig(null); setSelectedPatientForDoc(patient); }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                    >
                      <FileText size={16} />
                      Comprovante
                    </button>
                    <button
                      onClick={() => { setEditingPatient(patient); setIsFormOpen(true); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-24 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
            <div className="bg-slate-50 p-8 rounded-full mb-8">
              <Search size={64} className="text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-700 mb-4">Cadastro não localizado</h3>
            <button
              onClick={() => { setEditingPatient(undefined); setIsFormOpen(true); }}
              className="flex items-center gap-3 px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-2xl hover:scale-105 transition-all"
            >
              <Plus size={24} /> Criar Novo Cadastro
            </button>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings size={20} /> Configurações
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Logomarca do Formulário</label>
                {currentLogo ? (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center p-4">
                      <img src={currentLogo} alt="Logo Atual" className="max-h-full max-w-full object-contain" />
                      <button
                        onClick={handleClearLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-center text-slate-400 font-medium">Esta imagem aparecerá no cabeçalho dos comprovantes impressos.</p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="bg-white p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform mb-3">
                        <Upload className="text-slate-400 group-hover:text-blue-500" size={32} />
                      </div>
                      <p className="mb-2 text-sm text-slate-700 font-bold">Clique para enviar</p>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">PNG ou JPG (Formatos Oficiais)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                )}
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <PatientForm
          patient={editingPatient}
          initialName={searchTerm}
          onSave={handleSavePatient}
          onClose={() => { setIsFormOpen(false); setEditingPatient(undefined); }}
        />
      )}

      {selectedPatientForDoc && (
        <DocumentModal
          patient={selectedPatientForDoc}
          initialConfig={autoOpenDocConfig || undefined}
          onClose={() => { setSelectedPatientForDoc(null); setAutoOpenDocConfig(null); }}
        />
      )}

      {/* Final Updated Footer - Fixed bottom */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/80 backdrop-blur-md py-4 px-6 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <ImageIcon className="text-blue-600" size={20} />
            <span className="font-black text-slate-900 tracking-tight text-sm">Fransoft Developer®</span>
            <span className="text-slate-400 text-[10px] font-bold border-l pl-3 ml-2">fransoft.developer.2026@gmail.com</span>
          </div>

          <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100 flex items-center gap-4 text-yellow-700 text-[10px] font-bold">
            <p>• Use A4 (Tamanho Real)</p>
            <p>• Impressão em 2 vias A5</p>
            <p>• Carimbo manual obrigatório</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
