import { supabase } from './storageService';

export const authService = {
    /**
     * Valida as credenciais do usuário na tabela 'usuarios'
     */
    async login(usuario: string, senha: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('usuario', usuario.trim())
                .eq('senha', senha.trim())
                .maybeSingle();

            if (error) throw error;

            if (data) {
                // Armazena a sessão simples localmente
                localStorage.setItem('auth_user', JSON.stringify({
                    id: data.id,
                    usuario: data.usuario
                }));
                return true;
            }

            return false;
        } catch (err) {
            console.error('Erro na autenticação:', err);
            return false;
        }
    },

    /**
     * Verifica se há um usuário autenticado no localStorage
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_user');
    },

    /**
     * Realiza o logout
     */
    logout(): void {
        localStorage.removeItem('auth_user');
    }
};
