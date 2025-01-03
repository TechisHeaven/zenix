import app from "./server";
import sanitizedConfig from "./utils/env.config";

const port = sanitizedConfig.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
});
