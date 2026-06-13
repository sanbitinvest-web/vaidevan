import { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();
function serveFile(res, candidates, filename, mime) {
    const filePath = candidates.find(p => fs.existsSync(p));
    if (!filePath) {
        res.status(404).json({ error: "Arquivo não encontrado. Faça o build primeiro." });
        return;
    }
    const stat = fs.statSync(filePath);
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Encoding", "identity");
    fs.createReadStream(filePath).pipe(res);
}
router.get("/deploy/package", (_req, res) => {
    serveFile(res, [
        path.resolve(__dirname, "../vaidevan-napoleon-deploy.tar.gz"),
        path.resolve(process.cwd(), "vaidevan-napoleon-deploy.tar.gz"),
        "/home/runner/workspace/vaidevan-napoleon-deploy.tar.gz",
    ], "vaidevan-napoleon-deploy.tar.gz", "application/octet-stream");
});
router.get("/deploy/assets", (_req, res) => {
    serveFile(res, [
        "/home/runner/workspace/vaidevan-assets-only.tar.gz",
    ], "vaidevan-assets-only.tar.gz", "application/octet-stream");
});
router.get("/deploy/sitemap-index", (_req, res) => {
    serveFile(res, [
        "/home/runner/workspace/vaidevan-sitemap-index.xml",
    ], "sitemap-index.xml", "application/xml");
});
router.get("/deploy/index-html", (_req, res) => {
    serveFile(res, [
        "/home/runner/workspace/vaidevan-index-new.html",
    ], "index.html", "text/html");
});
router.get("/deploy/wp-theme", (_req, res) => {
    serveFile(res, [
        "/home/runner/workspace/vaidevan-wp2/vaidevan-theme.tar.gz",
        "/home/runner/workspace/vaidevan-wp2/vaidevan-theme.zip",
        path.resolve(process.cwd(), "vaidevan-wp2/vaidevan-theme.tar.gz"),
        path.resolve(process.cwd(), "vaidevan-wp2/vaidevan-theme.zip"),
    ], "vaidevan-theme.tar.gz", "application/octet-stream");
});
router.get("/deploy/htaccess", (_req, res) => {
    serveFile(res, [
        "/home/runner/workspace/vaidevan-htaccess.txt",
    ], ".htaccess", "text/plain");
});
export default router;
//# sourceMappingURL=deploy_download.js.map