const dotenv = require('dotenv');
dotenv.config();
const { processTranscription } = require('./services/aiTranscriptionService');

async function run() {
  try {
    const res = await processTranscription("El paciente refiere dolor de cabeza de 2 días. Recetar paracetamol 500mg 1 tableta cada 8 horas por 5 días.");
    console.log("Success:", JSON.stringify(res, null, 2));
  } catch(e) {
    console.error("Failed:", e);
  }
}
run();
