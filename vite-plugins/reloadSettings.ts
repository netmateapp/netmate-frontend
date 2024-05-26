import { type PluginOption } from 'vite';

export default function reloadSettings(): PluginOption {
  return {
    name: 'sync-reload',
    enforce: 'pre',
    apply: 'serve',
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'full-reload',
      });
      return [];
    }
  };
}
