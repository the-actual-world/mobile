import { Text } from "@/components/ui/Text";
import { Alert, View, StyleSheet, TouchableOpacity } from "react-native";
import { Button } from "@/components/ui/Button";
import tw from "@/lib/tailwind";
import { Background } from "@/components/Background";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { useAlert } from "@/context/AlertProvider";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/Input";
import { ClipboardIcon, TrashIcon, UserPlusIcon } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { Camera } from "expo-camera";
import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { fonts } from "@/lib/styles";

export default () => {
  const alertRef = useAlert();
  const { t } = useTranslation();

  return (
    <Background>
      <Text style={tw`mb-2 text-mt-fg`}>
        No The Actual World, acreditamos que os utilizadores de qualquer rede
        social devem permanecer os clientes, e não o produto. Por isso, não
        vendemos os teus dados a terceiros.
      </Text>
      <Text
        style={tw`mb-2 text-lg bg-bd text-primary dark:text-dark-primary p-2 rounded-lg`}
      >
        Mas a rede social tem de ser paga de alguma forma...
      </Text>
      <Text style={tw`mb-2`}>
        Créditos são aquilo que paga pela rede social!
      </Text>
      <Text style={tw`mb-2`}>
        Não podes utilizar a rede social sem créditos.
      </Text>
      <Text style={tw`mb-2`}>
        Todos os utilizadores começam com a quantia de{" "}
        <Text style={tw`font-bold`}>10000 créditos.</Text>
      </Text>
      <Text style={tw`mb-2`}>
        A nossa equipa acredita que os créditos são a forma mais transparente de
        pagar pela rede social.
      </Text>
      <Text style={tw`mb-2`}>
        A única forma de obter créditos é comprando-os, ou recebendo-os de
        amigos (como presentes).
      </Text>
      <Text style={tw`mb-2`}>
        Aqui és TU que pagas, e não os compradores dos teus dados.
      </Text>
      <Text style={tw`mt-2`}>
        Os créditos são descontados da tua conta com base naquilo que usas. Tem
        por base os seguintes critérios:
      </Text>

      <View style={tw`mt-4 p-2 bg-bd rounded-lg`}>
        <Text
          style={{
            fontFamily: fonts.inter.bold,
          }}
        >
          10 créditos por dia, ou seja, ~0.30 € por mês (3.60 € por ano). visto,
          ainda que não uses a rede social, a tua conta continua a ser mantida,
          assim como fotos e conversas.
        </Text>

        <Text style={tw`mb-2`}>+</Text>

        <Text style={tw`font-bold`}>
          20 créditos por dia por GB de fotos e vídeos guardados, ou seja, ~0.60
          € por mês (7.20 € por ano) caso tenhas 10 GB de fotos e vídeos
          guardados.
        </Text>

        <Text style={tw`mb-2`}>+</Text>

        <Text style={tw`font-bold`}></Text>
      </View>
    </Background>
  );
};
