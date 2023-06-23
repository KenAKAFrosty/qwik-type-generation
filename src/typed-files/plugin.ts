import { type PluginOption } from "vite";

export function typedFilesPlugin(): PluginOption {
    return {
        name: "typed-files",
        buildStart() {
            findAllFiles("public").then(async (allFiles) => {
                syncTypesToFiles(allFiles);
                const fs = await import("fs");
                if (typeof (process) !== "undefined" && process?.env && process.env.npm_lifecycle_event === "dev") {
                    fs.watch("public", { recursive: true }, async () => {
                        const updatedFiles = await findAllFiles("public");
                        syncTypesToFiles(updatedFiles);
                    });
                }
            });
        },
    };
}

let allPublicFilesCache: Set<string> = new Set<string>();

async function syncTypesToFiles(files: Set<string>) {
    if (areEqual(allPublicFilesCache, files)) {
        return;
    }
    allPublicFilesCache = files;
    const videos = new Set<string>();
    const scripts = new Set<string>();
    const images = new Set<string>();
    const fonts = new Set<string>();
    const audios = new Set<string>();
    const pdfs = new Set<string>();
    const jsons = new Set<string>();
    let typeFileString = `export type PublicFiles = {\n\tall: `

    function getLiteralType(filePath: string) {
        return filePath.replace("public", "").replace(/\\/g, "/");
    }
    files.forEach((file) => {
        const literalType = getLiteralType(file);
        typeFileString += `| "${literalType}" `
        if (file.match(/.*\.(mp4|mkv|avi|mov|wmv|flv|rmvb|webm)$/i)) {
            videos.add(literalType);
        }
        if (file.match(/.*\.js$/i)) {
            scripts.add(literalType);
        }
        if (file.match(/.*\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i)) {
            images.add(literalType);
        }
        if (file.match(/.*\.(ttf|otf|woff|woff2|eot)$/i)) {
            fonts.add(literalType);
        }
        if (file.match(/.*\.(mp3|wav|ogg|flac|aac)$/i)) {
            audios.add(literalType);
        }
        if (file.match(/.*\.pdf$/i)) {
            pdfs.add(literalType);
        }
        if (file.match(/.*\.json$/i)) {
            jsons.add(literalType);
        }
    });

    function addCategoryToTypeFileString(categoryName: string, literalTypeStringSet: Set<string>) {
        typeFileString += `\n\t${categoryName}: `
        if (literalTypeStringSet.size === 0) {
            typeFileString += `never`
        } else {
            literalTypeStringSet.forEach((file) => {
                typeFileString += `| "${file}" `
            });
        }
        typeFileString += `;`
    }
    addCategoryToTypeFileString("videos", videos);
    addCategoryToTypeFileString("scripts", scripts);
    addCategoryToTypeFileString("images", images);
    addCategoryToTypeFileString("fonts", fonts);
    addCategoryToTypeFileString("audios", audios);
    addCategoryToTypeFileString("pdfs", pdfs);
    addCategoryToTypeFileString("jsons", jsons);

    typeFileString += `\n};\n`
    const fs = await import("fs");
    fs.writeFileSync("src/typed-files/public.d.ts", typeFileString);
}


async function findAllFiles(dir: string, ignore?: string[]) {
    const fs = await import("fs");
    const path = await import("path");
    const files = new Set<string>();
    const pathifiedIgnore = ignore?.map(p => path.join(dir, p || ""));
    async function _findAllFiles(dir: string, files: Set<string>) {
        if (ignore && pathifiedIgnore?.includes(dir)) {
            console.log("ignore");
            return;
        }
        fs.readdirSync(dir).forEach(async (file) => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                await _findAllFiles(filePath, files);
            } else {
                files.add(filePath);
            }
        });
    }
    await _findAllFiles(dir, files);
    return files;
}

function areEqual(a: Set<string>, b: Set<string>) {
    if (a.size !== b.size) return false;
    for (const aItem of a) {
        if (!b.has(aItem)) return false;
    }
    return true;
}