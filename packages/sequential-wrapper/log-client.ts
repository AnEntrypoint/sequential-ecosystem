// Simple script to log the content of the client.js file
async function logClientFile() {
  try {
    const content = await Deno.readTextFile("./src/client.js");
    console.log("client.js content:");
    console.log(content);
  } catch (error) {
    console.error("Error reading client.js:", error);
  }
}

await logClientFile();
