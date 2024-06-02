import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import tw from "@/lib/tailwind";
import Avatar from "@/components/Avatar";
import { sb, useSupabase } from "@/context/SupabaseProvider";
import { SendIcon } from "lucide-react-native";
import { Input } from "./ui/Input";
import { useTranslation } from "react-i18next";
import { Text } from "./ui/Text";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useSettings } from "@/context/SettingsProvider";
import { useTimeAgo } from "@/context/TimeAgoProvider";
import { useAlert } from "@/context/AlertProvider";

const Comment = ({
  comment,
  addReply,
  updateComment,
}: {
  comment: any;
  addReply: (parentId: number, reply: any) => void;
  updateComment: (updatedComment: any) => void;
}) => {
  const { session } = useSupabase();
  const [replyText, setReplyText] = React.useState("");
  const [showReply, setShowReply] = React.useState(false);
  const { showActionSheetWithOptions } = useActionSheet();
  const { settings } = useSettings();
  const timeAgo = useTimeAgo();
  const alertRef = useAlert();
  const { t } = useTranslation();

  const handleAddReply = async () => {
    if (!replyText) return;

    const { data, error } = await sb.from("post_comments").insert([
      {
        post_id: comment.post_id,
        user_id: session?.user.id as string,
        parent_id: comment.id,
        text: replyText,
      },
    ]);

    if (error) {
      console.error(error);
      return;
    }

    alertRef.current?.showAlert({
      title: t("common:success"),
      message: t("comment:commentAdded"),
      variant: "info",
    });

    // addReply(comment.id, { ...data, user: session?.user });
    setReplyText("");
    setShowReply(false);
  };

  const handleDeleteComment = async () => {
    Alert.alert(
      t("common:delete"),
      t("comment:deleteConfirmation"),
      [
        { text: t("common:cancel"), style: "cancel" },
        {
          text: t("common:delete"),
          style: "destructive",
          onPress: async () => {
            const { data, error } = await sb
              .from("post_comments")
              .update({ status: "deleted", text: "" })
              .eq("id", comment.id);

            if (error) {
              console.error(error);
              return;
            }

            // updateComment({ ...comment, status: "deleted", text: "" });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showOptions = () => {
    const options = [t("common:delete"), t("common:cancel")];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === destructiveButtonIndex) {
          handleDeleteComment();
        }
      }
    );
  };

  return (
    <View style={tw`pl-3 border-l border-border dark:border-dark-border mt-3`}>
      <View style={tw`flex flex-row items-start gap-2`}>
        <Avatar userId={comment.user?.id} size={32} />
        <View style={tw`flex-1`}>
          <Text style={tw`font-bold`}>
            {comment.user
              ? comment.user.name
              : t("comment:notFriendsOrDoesNotExist")}
          </Text>
          <Text
            muted={comment.status === "deleted"}
            style={comment.status === "deleted" ? tw`line-through` : {}}
          >
            {comment.status === "deleted"
              ? t("comment:commentDeleted")
              : comment.user
              ? comment.text
              : "*********"}
          </Text>
          <View style={tw`flex flex-row flex-wrap items-end gap-x-2 -gap-y-1`}>
            <Text muted>
              {settings.others.showRelativeTime
                ? timeAgo.format(new Date(comment.created_at))
                : new Date(comment.created_at).toLocaleString()}
            </Text>
            {comment.user?.id === session?.user.id && (
              <TouchableOpacity onPress={showOptions}>
                <Text style={tw`text-destructive mt-1`}>
                  {t("common:options")}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowReply(!showReply)}>
              <Text style={tw`text-blue-600 dark:text-blue-400 mt-1`}>
                {t("comment:reply")} ({comment.replies?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>
          {showReply && (
            <View style={tw`mt-2`}>
              <Input
                placeholder={t("comment:replyToComment")}
                value={replyText}
                onChangeText={setReplyText}
              />
              <TouchableOpacity
                style={[
                  tw`flex flex-row items-center mt-2 gap-2`,
                  {
                    opacity: replyText ? 1 : 0.5,
                  },
                ]}
                onPress={handleAddReply}
                disabled={!replyText}
              >
                <SendIcon size={20} color={tw.color("primary")} />
                <Text style={tw`text-primary`}>{t("comment:reply")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {comment.replies &&
        comment.replies.map((reply: any) => (
          <Comment
            key={reply.id}
            comment={reply}
            addReply={addReply}
            updateComment={updateComment}
          />
        ))}
    </View>
  );
};

const Comments = ({ comments }) => {
  const [commentsTree, setCommentsTree] = React.useState([]);

  React.useEffect(() => {
    const mapCommentsToTree = (comments) => {
      const map = {};
      const roots = [];
      comments.forEach((comment) => {
        map[comment.id] = { ...comment, replies: [] };
        if (comment.parent_id) {
          map[comment.parent_id].replies.push(map[comment.id]);
        } else {
          roots.push(map[comment.id]);
        }
      });
      return roots;
    };

    setCommentsTree(mapCommentsToTree(comments));
  }, [comments]);

  const addReply = (parentId, reply) => {
    setCommentsTree((prevCommentsTree) =>
      prevCommentsTree.map((comment) =>
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    );
  };

  const updateComment = (updatedComment) => {
    setCommentsTree((prevCommentsTree) =>
      prevCommentsTree.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  return (
    <View>
      {commentsTree.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          addReply={addReply}
          updateComment={updateComment}
        />
      ))}
    </View>
  );
};

export default Comments;
