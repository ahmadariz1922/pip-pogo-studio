export default {

  async fetch(request, env) {

    const headers = {

      "Access-Control-Allow-Origin": "https://ahmadariz1922.github.io",

      "Access-Control-Allow-Headers": "Content-Type",

      "Access-Control-Allow-Methods": "POST, OPTIONS"

    };

    if (request.method === "OPTIONS") {

      return new Response(null, { headers });

    }

    if (request.method !== "POST") {

      return new Response("Pip & Pogo API is ready!", { headers });

    }

    try {

      const body = await request.json();

      const action = body.action || "story";

      // ---------------- VOICE ----------------

      if (action === "voice") {

        const text = String(body.text || "").trim();

        const character = String(body.character || "pip").toLowerCase();

        if (!text) {

          return json(

            { error: { message: "Voice text is required." } },

            400,

            headers

          );

        }

        const voice = character === "pogo" ? "ash" : "coral";

        const instructions =

          character === "pogo"

            ? "Speak like a warm, playful, friendly cartoon puppy for children ages 3 to 10. Sound kind, energetic, expressive, and fun."

            : "Speak like a cheerful, curious, energetic young cartoon bird for children ages 3 to 10. Sound bright, playful, expressive, and friendly.";

        const response = await fetch(

          "https://api.openai.com/v1/audio/speech",

          {

            method: "POST",

            headers: {

              "Authorization": `Bearer ${env.OPENAI_API_KEY}`,

              "Content-Type": "application/json"

            },

            body: JSON.stringify({

              model: "gpt-4o-mini-tts",

              voice,

              input: text,

              instructions,

              response_format: "mp3"

            })

          }

        );

        if (!response.ok) {

          const errorText = await response.text();

          return json(

            { error: { message: errorText || "Voice generation failed." } },

            response.status,

            headers

          );

        }

        const audioBuffer = await response.arrayBuffer();

        return new Response(audioBuffer, {

          status: 200,

          headers: {

            ...headers,

            "Content-Type": "audio/mpeg"

          }

        });

      }

      // ---------------- IMAGE ----------------

      if (action === "image") {

        const scene = String(body.scene || "").trim();

        if (!scene) {

          return json(

            { error: { message: "Scene text is required." } },

            400,

            headers

          );

        }

        const prompt = `Create one original, child-friendly 16:9 cartoon scene for Pip & Pogo Studio.

Pip: bright blue baby bird, light-blue fluffy belly, huge round blue-and-black eyes, small orange-yellow beak, orange feet, three soft blue feather tufts on top, rounded wings, cheerful friendly face.

Pogo: cute brown-and-white puppy, floppy brown ears, white muzzle and chest, large warm brown eyes, small black nose, red collar, round gold tag, playful friendly face.

Keep Pip and Pogo visually consistent from scene to scene: same colors, proportions, face shapes, eyes, and accessories.

Scene: ${scene}

Style: bright polished 3D children's animation, warm soft lighting, expressive faces, colorful detailed environment, ages 3-10. No text, no captions, no logos, no watermark.`;

        const response = await fetch(

          "https://api.openai.com/v1/images/generations",

          {

            method: "POST",

            headers: {

              "Authorization": `Bearer ${env.OPENAI_API_KEY}`,

              "Content-Type": "application/json"

            },

            body: JSON.stringify({

              model: "gpt-image-2",

              prompt,

              size: "1536x1024",

              quality: "medium",

              output_format: "png"

            })

          }

        );

        const data = await response.json();

        if (!response.ok) {

          return json(data, response.status, headers);

        }

        const b64 = data?.data?.[0]?.b64_json;

        if (!b64) {

          return json(

            { error: { message: "No image data was returned." } },

            500,

            headers

          );

        }

        return json(

          { image: `data:image/png;base64,${b64}` },

          200,

          headers

        );

      }

      // ---------------- STORY ----------------

      const prompt = String(body.prompt || "").trim();

      if (!prompt) {

        return json(

          { error: { message: "Story prompt is required." } },

          400,

          headers

        );

      }

      const response = await fetch(

        "https://api.openai.com/v1/responses",

        {

          method: "POST",

          headers: {

            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,

            "Content-Type": "application/json"

          },

          body: JSON.stringify({

            model: "gpt-5.6-luna",

            input: `Create a fun, original children's cartoon story for Pip and Pogo. Keep it safe and age-appropriate. Story idea: ${prompt}`

          })

        }

      );

      const data = await response.json();

      return json(data, response.status, headers);

    } catch (error) {

      return json(

        {

          error: {

            message: error.message || "Unexpected server error."

          }

        },

        500,

        headers

      );

    }

  }

};

function json(data, status, headers) {

  return new Response(JSON.stringify(data), {

    status,

    headers: {

      ...headers,

      "Content-Type": "application/json"

    }

  });

}
