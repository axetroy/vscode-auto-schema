const axios = require("axios");
const fs = require("fs-extra");

(async () => {
  const res = await axios.get("http://schemastore.org/api/json/catalog.json");
  const schemas = res.data.schemas;
  const pkg = await fs.readJson("./package.json");

  const jsonValidation = [];
  const yamlValidation = [];
  const activationEvents = [];

  for (const schema of schemas) {
    if (!schema.fileMatch) {
      continue;
    }
    const yamlMatch = schema.fileMatch.filter((v) => /\.ya?ml$/.test(v));
    const jsonMatch = schema.fileMatch.filter((v) => /\.json$/.test(v));

    if (yamlMatch.length) {
      yamlValidation.push({
        fileMatch: yamlMatch,
        url: schema.url,
      });
    }

    if (jsonMatch.length) {
      jsonValidation.push({
        fileMatch: jsonMatch,
        url: schema.url,
      });
    }

    for (const fileMatch of schema.fileMatch || []) {
      activationEvents.push(`workspaceContains:${fileMatch}`);
    }
  }

  pkg.contributes.yamlValidation = yamlValidation;
  pkg.contributes.jsonValidation = jsonValidation;
  pkg.activationEvents = activationEvents;
  await fs.writeJson("./package.json", pkg, { spaces: 2 });
})().catch((err) => {
  console.error(err);
});
