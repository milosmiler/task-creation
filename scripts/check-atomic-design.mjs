import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const COMPONENTS_DIR = path.join(ROOT_DIR, "src", "components");
const LEVELS = ["atoms", "molecules", "organisms"];

const forbiddenImports = {
    atoms: new Set(["molecules", "organisms"]),
    molecules: new Set(["organisms"]),
    organisms: new Set([])
};

function walk(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath));
            continue;
        }

        if (/\.(vue|js|mjs|cjs|ts)$/.test(entry.name)) {
            files.push(fullPath);
        }
    }

    return files;
}

function getLevel(filePath) {
    const normalized = filePath.split(path.sep).join("/");
    for (const level of LEVELS) {
        if (normalized.includes(`/src/components/${level}/`)) {
            return level;
        }
    }
    return null;
}

function resolveImportPath(sourceFile, importValue) {
    if (!importValue.startsWith(".")) {
        return null;
    }

    const basePath = path.resolve(path.dirname(sourceFile), importValue);
    const candidates = [
        basePath,
        `${basePath}.vue`,
        `${basePath}.js`,
        `${basePath}.mjs`,
        `${basePath}.cjs`,
        `${basePath}.ts`,
        path.join(basePath, "index.vue"),
        path.join(basePath, "index.js"),
        path.join(basePath, "index.ts")
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            return candidate;
        }
    }

    return basePath;
}

function findImports(fileContent) {
    const importPaths = [];
    const importRegex = /import\s+(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g;

    let match;
    while ((match = importRegex.exec(fileContent)) !== null) {
        importPaths.push(match[1]);
    }

    return importPaths;
}

const allComponentFiles = walk(COMPONENTS_DIR).filter((file) => getLevel(file) !== null);
const violations = [];

for (const file of allComponentFiles) {
    const sourceLevel = getLevel(file);
    const sourceCode = fs.readFileSync(file, "utf8");
    const imports = findImports(sourceCode);

    for (const imported of imports) {
        const resolvedImport = resolveImportPath(file, imported);
        if (!resolvedImport) {
            continue;
        }

        const targetLevel = getLevel(resolvedImport);
        if (!targetLevel) {
            continue;
        }

        if (forbiddenImports[sourceLevel].has(targetLevel)) {
            const relativeFile = path.relative(ROOT_DIR, file).split(path.sep).join("/");
            const relativeTarget = path.relative(ROOT_DIR, resolvedImport).split(path.sep).join("/");
            violations.push(
                `${relativeFile} imports ${relativeTarget} (${sourceLevel} cannot import ${targetLevel})`
            );
        }
    }
}

if (violations.length > 0) {
    console.error("Atomic Design violations found:");
    for (const violation of violations) {
        console.error(`- ${violation}`);
    }
    process.exit(1);
}

console.log("Atomic Design check passed.");
