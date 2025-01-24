const { Events } = require('discord.js');
const OpenAI = require('openai');
const { OPENAI_API_KEY, SALON_TRANSLATION, ADMIN_ROLE } = process.env;

console.log('✅ Système de traduction activé');

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const messageLanguages = new Map();

async function detectLanguage(text) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "Tu es un expert en détection de langue. Réponds uniquement par le code ISO de la langue détectée (ex: 'fr' pour français, 'en' pour anglais, etc.). Si tu n'es pas sûr, réponds rien."
                },
                {
                    role: "user",
                    content: `Détecte la langue de ce texte: "${text}"`
                }
            ],
            temperature: 0
        });

        return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
        return 'unknown';
    }
}

async function translateText(text, targetLanguage) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `Tu es un expert en traduction vers le ${targetLanguage === 'fr' ? 'français' : 'la langue cible'}. Traduis le texte donné en ${targetLanguage === 'fr' ? 'français' : 'dans la même langue que le message original'} en conservant le ton et le style du message original.`
                },
                {
                    role: "user",
                    content: `Traduis ce texte en ${targetLanguage}: "${text}"`
                }
            ],
            temperature: 0.3
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        return null;
    }
}

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot || message.channel.id !== SALON_TRANSLATION) return;

        if (message.reference) {
            try {
                const originalMessage = await message.channel.messages.fetch(message.reference.messageId);
                const translatedMessage = await message.channel.messages.fetch(message.reference.messageId + 1).catch(() => null);
                
                let targetLanguage = messageLanguages.get(originalMessage.id);
                
                if (!targetLanguage && translatedMessage) {
                    targetLanguage = messageLanguages.get(translatedMessage.id);
                }
                
                if (targetLanguage && targetLanguage !== 'fr' && targetLanguage !== 'unknown') {
                    const translation = await translateText(message.content, targetLanguage);
                    if (translation) {
                        const translatedResponse = await message.channel.send(`🔄 Traduction : ${translation}`);
                        messageLanguages.set(translatedResponse.id, targetLanguage);
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la traduction de la réponse:', error);
            }
        } else {
            const language = await detectLanguage(message.content);
            
            if (language !== 'fr' && language !== 'unknown') {
                const translation = await translateText(message.content, 'fr');
                if (translation) {
                    const translatedMessage = await message.channel.send(`<@&${ADMIN_ROLE}> 🔄 Traduction : ${translation}`);
                    messageLanguages.set(message.id, language);
                    messageLanguages.set(translatedMessage.id, language);
                }
            }

            setTimeout(() => {
                messageLanguages.delete(message.id);
            }, 900000);
        }
    }
}; 