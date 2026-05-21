/**
 * Canonical language list — mirrors backend LANGUAGES constant.
 * Each entry has a `value` (sent to API) and a `label` (shown in UI).
 */
export const LANGUAGES = [
  { value: 'bash',        label: 'Bash' },
  { value: 'c',           label: 'C' },
  { value: 'cpp',         label: 'C++' },
  { value: 'css',         label: 'CSS' },
  { value: 'diff',        label: 'Diff' },
  { value: 'dockerfile',  label: 'Dockerfile' },
  { value: 'go',          label: 'Go' },
  { value: 'graphql',     label: 'GraphQL' },
  { value: 'html',        label: 'HTML' },
  { value: 'java',        label: 'Java' },
  { value: 'javascript',  label: 'JavaScript' },
  { value: 'json',        label: 'JSON' },
  { value: 'kotlin',      label: 'Kotlin' },
  { value: 'markdown',    label: 'Markdown' },
  { value: 'nginx',       label: 'Nginx' },
  { value: 'php',         label: 'PHP' },
  { value: 'plaintext',   label: 'Plain text' },
  { value: 'python',      label: 'Python' },
  { value: 'ruby',        label: 'Ruby' },
  { value: 'rust',        label: 'Rust' },
  { value: 'scss',        label: 'SCSS' },
  { value: 'shell',       label: 'Shell' },
  { value: 'sql',         label: 'SQL' },
  { value: 'swift',       label: 'Swift' },
  { value: 'toml',        label: 'TOML' },
  { value: 'typescript',  label: 'TypeScript' },
  { value: 'xml',         label: 'XML' },
  { value: 'yaml',        label: 'YAML' },
];

export const LANGUAGE_LABELS = Object.fromEntries(
  LANGUAGES.map(({ value, label }) => [value, label])
);
