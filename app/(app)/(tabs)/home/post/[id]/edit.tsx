import ManagePostModalContent from "@/components/modal-content/CreatePost";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditPostPage() {
  const { id } = useLocalSearchParams();
  const postKeyboardRef = React.useRef<TextInput>(null);
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ManagePostModalContent
        newPostKeyboardRef={postKeyboardRef}
        onClose={() => {
          router.back();
        }}
        existingPostId={id as string}
      />
    </SafeAreaView>
  );
}
