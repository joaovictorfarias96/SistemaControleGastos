import { useState, useEffect } from 'react';
import { CategoriaService } from '../api';
import { Categoria } from '../types';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);

    const carregarCategorias = async () => {
        try {
            const { data } = await CategoriaService.listar();
            setCategorias(data);
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
        }
    };

    const adicionarCategoria = async (categoria: Categoria) => {
        try {
            setLoading(true);
            await CategoriaService.salvar(categoria);
            await carregarCategorias();
            return true;
        } catch (error) {
            alert("Erro ao salvar categoria");
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarCategorias(); }, []);

    return { categorias, adicionarCategoria, loading };
};