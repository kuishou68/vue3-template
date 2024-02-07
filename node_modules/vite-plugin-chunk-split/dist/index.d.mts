import { Plugin } from 'vite';

type packageInfo = string | RegExp;
type Strategy = 'default' | 'all-in-one' | 'single-vendor' | 'unbundle';
type CustomSplitting = Record<string, packageInfo[]>;
type CustomChunk = (context: {
    id: string;
    moduleId: string;
    file: string;
    root: string;
}) => string | undefined | null;
interface ChunkSplit {
    strategy?: Strategy;
    customSplitting?: CustomSplitting;
    customChunk?: CustomChunk;
    useEntryName?: boolean;
}

declare function chunkSplitPlugin(splitOptions?: ChunkSplit): Plugin;

export { chunkSplitPlugin };
