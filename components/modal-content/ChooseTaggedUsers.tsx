import tw from "@/lib/tailwind";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { FlatList, ScrollView, TextInput } from "react-native-gesture-handler";
import { Text } from "../ui/Text";
import { useLocation } from "@/context/LocationProvider";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useFriends } from "@/context/FriendsProvider";
import Checkbox from "expo-checkbox";
import Avatar from "../Avatar";
import { Friend } from "@/lib/types";
import { fonts } from "@/lib/styles";

export default function ChooseTaggedUsersModalContent({
  onClose,
  onTaggedUsersSelect,
  initialTaggedUsers,
  friends,
}: {
  onClose: () => void;
  onTaggedUsersSelect: (taggedUsers: { id: string; name: string }[]) => void;
  initialTaggedUsers: { id: string; name: string }[];
  friends: Friend[];
}) {
  const { t } = useTranslation();
  const inputRef = React.useRef<GooglePlacesAutocompleteRef | null>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const [taggedUsers, setTaggedUsers] =
    React.useState<{ id: string; name: string }[]>(initialTaggedUsers);

  return (
    <View style={tw`flex-1 mt-2`}>
      <Text
        style={[
          tw`text-lg mb-2`,
          {
            fontFamily: fonts.inter.medium,
          },
        ]}
      >
        {t("common:whoIsInThisPost")}
      </Text>
      <ScrollView style={tw`flex-1`}>
        <FlatList
          data={friends.filter((friend) => friend.status === "accepted")}
          keyExtractor={(item) => item.user.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <View style={tw`flex-row items-center gap-2`}>
                <Avatar size={40} userId={item.user.id} />
                <Text>{item.user.name}</Text>
              </View>
              <Checkbox
                value={
                  taggedUsers.findIndex(
                    (taggedUser) => taggedUser.id === item.user.id
                  ) !== -1
                }
                onValueChange={(value) => {
                  const updatedTaggedUsers = [...taggedUsers];

                  if (value) {
                    updatedTaggedUsers.push({
                      id: item.user.id,
                      name: item.user.name,
                    });
                  } else {
                    const index = updatedTaggedUsers.findIndex(
                      (taggedUser) => taggedUser.id === item.user.id
                    );

                    updatedTaggedUsers.splice(index, 1);
                  }

                  onTaggedUsersSelect(updatedTaggedUsers);

                  setTaggedUsers(updatedTaggedUsers);
                }}
              />
            </View>
          )}
        />
      </ScrollView>
    </View>
  );
}
