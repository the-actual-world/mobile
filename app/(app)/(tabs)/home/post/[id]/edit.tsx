import ManagePostModalContent from "@/components/modal-content/CreatePost";
import { useColorScheme } from "@/context/ColorSchemeProvider";
import { useFriends } from "@/context/FriendsProvider";
import { useSettings } from "@/context/SettingsProvider";
import { useSupabase } from "@/context/SupabaseProvider";
import tw from "@/lib/tailwind";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPostPage() {
  const { id } = useLocalSearchParams();
  const postKeyboardRef = React.useRef<TextInput>(null);
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const { session } = useSupabase();
  const { settings } = useSettings();
  const { friends } = useFriends();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor:
          colorScheme === "dark"
            ? tw.color("dark-background")
            : tw.color("background"),
      }}
    >
      <ManagePostModalContent
        newPostKeyboardRef={postKeyboardRef}
        onClose={() => {
          router.back();
        }}
        session={session}
        settings={settings}
        existingPostId={id as string}
        friends={friends}
      />
    </SafeAreaView>
  );
}
