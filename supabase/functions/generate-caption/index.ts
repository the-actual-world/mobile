import { HfInference } from "https://esm.sh/@huggingface/inference@2.3.2";

const hf = new HfInference(Deno.env.get("HUGGINGFACE_ACCESS_TOKEN"));

Deno.serve(async (req) => {
  const { url, userLanguage } = await req.json();

  const caption = await hf.imageToText({
    data: await (await fetch(url)).blob(),
    model: "Salesforce/blip-image-captioning-base",
  }).then((res) => res.generated_text);

  if (!userLanguage) {
    return new Response(JSON.stringify({ caption }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  let translatedCaption = caption;

  if (userLanguage !== "en") {
    translatedCaption = await hf.textGeneration({
      inputs:
        `<|system|>You are a professional translation with knowledge of every single language. Reply to the user SOLY with the final translation from English into the language he choses (with the language code), followed by whatever he writes. Reply ONLY with the translated text (without the language code or the quotation marks demarking the text you have to translate).<|user|>${userLanguage} - "${caption}"<|assistant|>`,
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      parameters: {
        return_full_text: false,
      },
    }).then((res) => res.generated_text);
  }

  const data = {
    caption: translatedCaption,
  };

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
});
