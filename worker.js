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

    const { prompt } = await request.json();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        input: `Create a fun, original children's cartoon story for Pip and Pogo. Keep it safe and age-appropriate. Story idea: ${prompt}`
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
};
