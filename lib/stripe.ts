import { sb } from "@/context/SupabaseProvider";
import {
  initPaymentSheet,
  presentPaymentSheet,
} from "@stripe/stripe-react-native";
import tw from "./tailwind";
import { StripeStyle } from "./types";

const fetchPaymentSheetParams = async (credits: number) => {
  const { data, error } = await sb.functions.invoke("payment-sheet", {
    body: { credits },
  });
  if (data) {
    return data;
  }

  return {};
};

export const initializePaymentSheet = async (
  credits: number,
  style: StripeStyle,
) => {
  const { paymentIntent, publishableKey, customerId, ephemeralKey } =
    await fetchPaymentSheetParams(
      credits,
    );

  if (!paymentIntent || !publishableKey) {
    return;
  }

  const result = await initPaymentSheet({
    merchantDisplayName: "The Actual World",
    paymentIntentClientSecret: paymentIntent,
    customerId: customerId,
    customerEphemeralKeySecret: ephemeralKey,
    defaultBillingDetails: {
      name: "The Actual World",
    },
    style,
    appearance: {
      // colors: {
      //   background: tw.color("background"),
      //   primary: tw.color("accent"),
      // },
      // shapes: {
      //   borderRadius: 8,
      //   borderWidth: 1,
      // },
      primaryButton: {
        colors: {
          background: tw.color("accent"),
          text: tw.color("background"),
        },
      },
    },
  });

  if (result.error) {
    console.error(result.error);
  }
};

export const openPaymentSheet = async () => {
  const { error } = await presentPaymentSheet();

  if (error) {
    console.error(error);
    return false;
  }

  return true;
};
