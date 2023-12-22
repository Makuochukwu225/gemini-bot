

const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const venom = require('venom-bot');
require('dotenv').config()
console.log(process.env.API_KEY)


venom
    .create({
        session: 'session-name' //name of session
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

async function start(client) {
    client.onAnyMessage(async (message) => {
        if (message.isGroupMsg === false && message.body.includes("/ai")) {
            const text = message.body;
            const removedText = text.replace(/^\/ai\s*/, '');
            var response = await run(removedText);
            client
                .sendText(message.from, response)
                .then(async (result) => {
                    console.log('Result: ', result);

                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
        }
    });
}

const MODEL_NAME = "gemini-pro";

async function run(msg) {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const parts = [
        { text: msg.toString() },
    ];

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        const response = result.response;
        console.log(response.text());
        return response.text();
    } catch (error) {
        return error;
    }

}

