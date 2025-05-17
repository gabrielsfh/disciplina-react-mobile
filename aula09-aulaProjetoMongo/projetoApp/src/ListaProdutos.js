import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button } from "react-native";
import { api } from "../services/api";

export default function ListaProdutos({ navigation }) {
    const [produto, setProduto] = useState([]);

    async function carregar() {
        const res = await api.get('/');
        setProduto(res.data);
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', carregar);
        return unsubscribe;
    }, [navigation]);

    async function excluir(id) {
        await api.delete(`/${id}`);
        carregar();
    }

    const renderItem = ({ item }) => {
        return (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
                <Text>
                    {item.nome} - R$ {item.preco ? item.preco.toFixed(2) : '0.00'} - Qtde: {item.quantidade}
                </Text>

                <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Button title='Editar' onPress={() => navigation.navigate('Form', { id: item._id })} />
                    <View style={{ width: 10 }} />
                    <Button title="Excluir" onPress={() => excluir(item._id)} color="red" />
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <Button title="Novo produto" onPress={() => navigation.navigate('Form')} />
            <FlatList
                data={produto}
                keyExtractor={item => item._id}
                renderItem={renderItem}
            />
        </View>
    );
}
