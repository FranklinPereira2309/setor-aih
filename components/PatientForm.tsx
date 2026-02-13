
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Patient, PatientFormData, DocumentConfig } from '../types';
import { validateCPF, validateCNS, applyCadSusMask, applyPhoneMask, validateMobilePhone } from '../services/validationService';
import {
  X,
  CreditCard,
  User,
  Phone,
  MapPin,
  ClipboardList,
  Calendar,
  Clock,
  UserPlus,
  Edit3,
  AlertCircle
} from 'lucide-react';

// Schema de Validação com Zod
const patientSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  phone: z.string().refine((val) => validateMobilePhone(val).isValid, {
    message: 'Telefone inválido. Deve ser no formato (DD) 9XXXX-XXXX'
  }),
  cadSus: z.string().refine((val) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length === 11) return validateCPF(clean);
    if (clean.length === 15) return validateCNS(clean);
    return false;
  }, {
    message: 'O campo deve ter 11 dígitos (CPF) ou 15 dígitos (CNS) válidos'
  }),
  procedimento: z.string().optional(),
  origem: z.enum(['itabuna', 'pactuado']).optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  patient?: Patient;
  initialName?: string;
  onSave: (data: PatientFormData & { id?: string, extra?: Partial<DocumentConfig> }) => void;
  onClose: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, initialName, onSave, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialName || '',
      origem: 'itabuna'
    }
  });

  const [currentTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [currentDate] = useState(new Date().toLocaleDateString('pt-BR'));

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        phone: applyPhoneMask(patient.phone),
        cadSus: applyCadSusMask(patient.cadSus),
      });
    }
  }, [patient, reset]);

  const handleCadSusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCadSusMask(e.target.value);
    setValue('cadSus', masked, { shouldValidate: true });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyPhoneMask(e.target.value);
    setValue('phone', masked, { shouldValidate: true });
  };

  const onSubmit = (data: PatientFormValues) => {
    const { procedimento, origem, ...patientData } = data;

    const extra: Partial<DocumentConfig> = !patient ? {
      procedimento: procedimento || '',
      isItabuna: origem === 'itabuna',
      isMPactuado: origem === 'pactuado',
    } : {};

    onSave({ ...patientData, id: patient?.id, extra: !patient ? extra : undefined });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {patient ? <Edit3 className="text-blue-600" size={20} /> : <UserPlus className="text-blue-600" size={20} />}
            {patient ? 'Editar Cadastro' : 'Novo Cadastro A.I.H'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Dados Pessoais</h3>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight">
                <User size={14} /> Nome Completo *
              </label>
              <input
                {...register('name')}
                className={`w-full px-4 py-3.5 rounded-2xl border transition-all font-semibold outline-none ${errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                placeholder="Ex: João Silva"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight">
                  <CreditCard size={14} /> CPF ou CNS *
                </label>
                <input
                  autoComplete="off"
                  {...register('cadSus')}
                  onChange={handleCadSusChange}
                  className={`w-full px-4 py-3.5 rounded-2xl border transition-all font-mono font-bold outline-none ${errors.cadSus ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                  placeholder="000.000.000-00"
                />
                {errors.cadSus && <p className="text-red-500 text-[10px] mt-1 font-black flex items-center gap-1 leading-tight"><AlertCircle size={12} className="shrink-0" /> {errors.cadSus.message}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight">
                  <Phone size={14} /> Telefone *
                </label>
                <input
                  autoComplete="off"
                  {...register('phone')}
                  onChange={handlePhoneChange}
                  className={`w-full px-4 py-3.5 rounded-2xl border transition-all font-bold outline-none ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                  placeholder="(73) 98888-8888"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
              </div>
            </div>
          </div>

          {!patient && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Detalhes para Comprovante</h3>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">
                  <MapPin size={14} /> Localidade / Origem *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-slate-700 has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-700">
                    <input
                      type="radio"
                      value="itabuna"
                      {...register('origem')}
                      className="hidden"
                    />
                    Itabuna
                  </label>
                  <label className="flex items-center justify-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all font-bold text-slate-700 has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:checked]:border-blue-700">
                    <input
                      type="radio"
                      value="pactuado"
                      {...register('origem')}
                      className="hidden"
                    />
                    M. Pactuado
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-tight">
                  <ClipboardList size={14} /> Procedimento
                </label>
                <textarea
                  {...register('procedimento')}
                  rows={2}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-sm"
                  placeholder="Ex: Colecistectomia por Vídeo..."
                />
              </div>

              <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" /> {currentDate}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-400" /> {currentTime}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              {patient ? 'Salvar Alterações' : 'Cadastrar e Emitir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
