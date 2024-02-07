'use strict';

const assert = require('assert');
const esModuleLexer = require('es-module-lexer');
const MagicString = require('magic-string');
const path = require('path');
const importMetaResolve = require('import-meta-resolve');
const os = require('os');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const assert__default = /*#__PURE__*/_interopDefaultCompat(assert);
const MagicString__default = /*#__PURE__*/_interopDefaultCompat(MagicString);
const path__default = /*#__PURE__*/_interopDefaultCompat(path);
const os__default = /*#__PURE__*/_interopDefaultCompat(os);

const cssLangs = "\\.(css|less|sass|scss|styl|stylus|pcss|postcss)($|\\?)";
const cssLangRE = new RegExp(cssLangs);
const isCSSIdentifier = (request) => cssLangRE.test(request);

function staticImportedScan(id, getModuleInfo, cache, importChain = []) {
  if (cache.has(id)) {
    return cache.get(id);
  }
  if (importChain.includes(id)) {
    cache.set(id, false);
    return false;
  }
  const mod = getModuleInfo(id);
  if (!mod) {
    cache.set(id, false);
    return false;
  }
  if (mod.isEntry) {
    cache.set(id, true);
    return true;
  }
  const staticImport = mod.importers.some(
    (importer) => staticImportedScan(importer, getModuleInfo, cache, importChain.concat(id))
  );
  cache.set(id, staticImport);
  return staticImport;
}

function slash(p) {
  return p.replace(/\\/g, "/");
}
function normalizePath(id) {
  let key = path__default.posix.normalize(isWindows ? slash(id) : id);
  if (key.charCodeAt(0) === 0) {
    key = key.substring(1);
  }
  return key;
}
const isWindows = os__default.platform() === "win32";
async function resolveEntry(name, root) {
  try {
    (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href));
  } catch (e) {
    return require.resolve(name, { paths: [root] });
  }
  return importMetaResolve.resolve(name, "file://" + root).replace("file://", "");
}

const SPLIT_DEFAULT_MODULES = {
  __commonjsHelpers__: [/commonjsHelpers/]
};
const cache = /* @__PURE__ */ new Map();
const wrapCustomSplitConfig = async (manualChunks, customOptions, customChunk, root) => {
  assert__default(typeof manualChunks === "function");
  const groups = Object.keys(customOptions);
  const depsInGroup = {};
  for (const group of groups) {
    const packageInfo = customOptions[group];
    depsInGroup[group] = await Promise.all(
      packageInfo.filter((item) => typeof item === "string").map((item) => resolveEntry(item, root))
    );
    depsInGroup[group] = depsInGroup[group].filter((item) => item.length > 0);
  }
  return (moduleId, { getModuleIds, getModuleInfo }) => {
    const isDepInclude = (id2, depPaths, importChain) => {
      id2 = normalizePath(id2);
      const key = `${id2}-${depPaths.join("|")}`;
      if (importChain.includes(id2)) {
        cache.set(key, false);
        return false;
      }
      if (cache.has(key)) {
        return cache.get(key);
      }
      if (depPaths.includes(id2)) {
        importChain.forEach(
          (item) => cache.set(`${item}-${depPaths.join("|")}`, true)
        );
        return true;
      }
      const moduleInfo = getModuleInfo(id2);
      if (!moduleInfo || !moduleInfo.importers) {
        cache.set(key, false);
        return false;
      }
      const isInclude = moduleInfo.importers.some(
        (importer) => isDepInclude(importer, depPaths, importChain.concat(id2))
      );
      cache.set(key, isInclude);
      return isInclude;
    };
    const id = normalizePath(moduleId);
    const chunk = customChunk({
      id,
      moduleId,
      root,
      file: normalizePath(path__default.relative(root, id))
    });
    if (chunk) {
      return chunk;
    }
    for (const group of groups) {
      const deps = depsInGroup[group];
      const packageInfo = customOptions[group];
      if (!isCSSIdentifier(moduleId)) {
        if (moduleId.includes("node_modules") && deps.length && isDepInclude(moduleId, deps, [])) {
          return group;
        }
        for (const rule of packageInfo) {
          if (rule instanceof RegExp && rule.test(moduleId)) {
            return group;
          }
        }
      }
    }
    return manualChunks(moduleId, { getModuleIds, getModuleInfo });
  };
};
const generateManualChunks = async (splitOptions, root) => {
  const { strategy = "default", customSplitting = {}, customChunk = () => null, useEntryName = true } = splitOptions;
  if (strategy === "all-in-one") {
    return wrapCustomSplitConfig(() => null, customSplitting, customChunk, root);
  }
  if (strategy === "unbundle") {
    return wrapCustomSplitConfig(
      (id, { getModuleInfo }) => {
        if (id.includes("node_modules") && !isCSSIdentifier(id)) {
          if (staticImportedScan(id, getModuleInfo, /* @__PURE__ */ new Map(), [])) {
            return "vendor";
          } else {
            return "async-vendor";
          }
        }
        const cwd = process.cwd();
        if (!id.includes("node_modules") && !isCSSIdentifier(id)) {
          const extname = path__default.extname(id);
          return normalizePath(path__default.relative(cwd, id).replace(extname, ""));
        }
      },
      {
        ...SPLIT_DEFAULT_MODULES,
        ...customSplitting
      },
      customChunk,
      root
    );
  }
  return wrapCustomSplitConfig(
    (id, { getModuleInfo }) => {
      if (id.includes("node_modules") && !isCSSIdentifier(id)) {
        if (staticImportedScan(id, getModuleInfo, /* @__PURE__ */ new Map(), [])) {
          return useEntryName ? void 0 : "vendor";
        }
      }
    },
    {
      ...SPLIT_DEFAULT_MODULES,
      ...customSplitting
    },
    customChunk,
    root
  );
};
function chunkSplitPlugin(splitOptions = {
  strategy: "default",
  useEntryName: true
}) {
  return {
    name: "vite-plugin-chunk-split",
    async config(c) {
      await esModuleLexer.init;
      const root = normalizePath(c.root || process.cwd());
      const manualChunks = await generateManualChunks(splitOptions, root);
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks
            }
          }
        }
      };
    },
    // Delete useless import in commonjsHelpers.js, which is generated by @rollup/plugin-commonjs
    // https://github.com/sanyuan0704/vite-plugin-chunk-split/issues/8
    async renderChunk(code, chunk) {
      const s = new MagicString__default(code);
      if (chunk.fileName.includes("__commonjsHelpers__")) {
        const [imports] = esModuleLexer.parse(code);
        for (const { ss: start, se: end } of imports) {
          s.remove(start, end);
        }
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        };
      }
      return {
        code,
        map: s.generateMap({ hires: true })
      };
    }
  };
}

exports.chunkSplitPlugin = chunkSplitPlugin;
