import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const root = process.argv[2];
if (!root) {
  console.error("usage: relativize.mjs <build-root>");
  process.exit(1);
}

const rewriteRefs = (content, fromDir) => {
  const prefix = (relative(fromDir, root) || ".") + "/";
  return content
    .replaceAll('href="/_next/', `href="${prefix}_next/`)
    .replaceAll('src="/_next/', `src="${prefix}_next/`)
    .replaceAll('href="/logo.png', `href="${prefix}logo.png`)
    .replaceAll('src="/logo.png', `src="${prefix}logo.png`)
    .replaceAll('imageSrcSet="/_next/', `imageSrcSet="${prefix}_next/`)
    .replaceAll('"/_next/', `"${prefix}_next/`)
    .replaceAll('url(/_next/', `url(${prefix}_next/`);
};

const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (/\.(html|css|js|txt)$/i.test(name)) {
      const before = readFileSync(full, "utf8");
      const after = rewriteRefs(before, dirname(full));
      if (before !== after) {
        writeFileSync(full, after);
        console.log("rewrote", relative(root, full));
      }
    }
  }
};

walk(root);
console.log("done");
