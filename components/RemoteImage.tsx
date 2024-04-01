import { Image } from "react-native";
import React, { ComponentProps, useEffect, useMemo, useState } from "react";
import { sb, useSupabase } from "@/context/SupabaseProvider";

type RemoteImageProps = {
  bucket: string;
  path?: string | null;
  fallback: string;
} & Omit<ComponentProps<typeof Image>, "source">;

const RemoteImage = ({
  bucket,
  path,
  fallback,
  ...imageProps
}: RemoteImageProps) => {
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!path) return;
    (async () => {
      setImage("");
      const { data, error } = await sb.storage.from(bucket).download(path);

      if (error) {
        console.log(error);
      }

      if (data) {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          setImage(fr.result as string);
        };
      }
    })();
  }, [path]);

  if (!image) {
  }

  return <Image source={{ uri: image || fallback }} {...imageProps} />;
};

export default RemoteImage;
