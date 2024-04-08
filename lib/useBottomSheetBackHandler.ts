import { BottomSheetModal, BottomSheetModalProps } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { BackHandler, NativeEventSubscription } from "react-native";

/**
 * hook that dismisses the bottom sheet on the hardware back button press if it is visible
 * @param bottomSheetRef ref to the bottom sheet which is going to be closed/dismissed on the back press
 */
export const useBottomSheetBackHandler = (
  bottomSheetRef: React.RefObject<BottomSheetModal | null>,
) => {
  const backHandler = useRef<NativeEventSubscription | null>(null);

  const handleBackPress = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    return true;
  }, [bottomSheetRef]);

  backHandler.current = BackHandler.addEventListener(
    "hardwareBackPress",
    handleBackPress,
  );

  return backHandler;
};
