import JSON5 from 'json5'
import yaml from 'js-yaml'

export function parseContent (content: string, lang: string): any {
  switch (lang) {
    case 'yaml':
    case 'yml':
      return yaml.safeLoad(content)
    case 'json5':
      return JSON5.parse(content)
    case 'json':
    default:
      return JSON.parse(content)
  }
}

export function stringfyContent (content: any, lang: string): string {
  switch (lang) {
    case 'yaml':
    case 'yml':
      return yaml.safeDump(content)
    case 'json5':
      return JSON5.stringify(content, null, 2)
    case 'json':
    default:
      return JSON.stringify(content, null, 2)
  }
}
