import React, { useEffect, useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { api } from '../services/api';

export default function FormProduto({ route, navigation }) {
    const { id } = route.params || {};
    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState('');
    const [quantidade, setQuantidade] = useState('');

    // Carregar produto para editar
    useEffect(() => {
        if (id) {
            api.get(`/${id}`).then(res => {
                setNome(res.data.nome);
                setPreco(String(res.data.preco));
                setQuantidade(String(res.data.quantidade));
            });
        }
    }, [id]);

    async function salvar() {
        try {
            const dto = {
                nome,
                preco: Number(preco),
                quantidade: Number(quantidade)
            };
            if (id) {
                await api.put(`/${id}`, dto); // ← fixed: backticks instead of single quotes
            } else {
                await api.post('/', dto);
            }
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erro', err.response?.data?.erro || err.message);
        }
    }

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <TextInput
                placeholder="Nome do Produto"
                value={nome}
                onChangeText={setNome}
                style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} />
            <TextInput
                placeholder="Quantidade"
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} />
            <TextInput
                placeholder="Preco"
                value={preco}
                onChangeText={setPreco}
                keyboardType="numeric"
                style={{ borderWidth: 1, padding: 8, marginBottom: 10 }} />
            <Button title={id ? 'Atualizar' : 'Criar'} onPress={salvar} />
        </View>
    );
}
