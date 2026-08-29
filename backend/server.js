const app = require("./app");

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`CasaConnect server running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing backend process before starting another one.`);
    process.exit(1);
  }

  console.error("CasaConnect server failed to start.", error);
  process.exit(1);
});
