[![npm version](https://badge.fury.io/js/tailwindcss-class-sorter.svg)](https://badge.fury.io/js/tailwindcss-class-sorter)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/shufo/tailwindcss-class-sorter/CI)](https://github.com/shufo/tailwindcss-class-sorter/actions?query=workflow%3A%22CI%22)

# tailwindcss-class-sorter

A tailwindcss class sorter that respects tailwind config file.

## Installation

```bash
$ npm install @shufo/tailwindcss-class-sorter
# yarn
$ yarn add @shufo/tailwindcss-class-sorter
```

## Usage

```typescript
const { sortClasses } = require("@shufo/tailwindcss-class-sorter");

console.log(sortClasses("pt-2 p-4"));
// => "p-4 pt-2"
```

`tailwindcss-class-sorter` will automatically look for `tailwind.config.js` in the project directory.
Then if it exists, it will sort according to the tailwindcss configuration. If it does not exist, the default sort order of tailwindcss plugin will be used.

## API

### functions

#### sortClasses(classes: string, options: IOption)

`classes`: classes string e.g. `z-5 z-50`

### Interfaces

#### IOption

```typescript
export interface IOption {
  tailwindConfigPath?: string;
  tailwindConfig?: TailwindConfig;
}
```

| key                | value                                     |
| ------------------ | ----------------------------------------- |
| tailwindConfigPath | A path to tailwind config file            |
| tailwindConfig     | A configuration object of tailwind config |

## Testing

```bash
$ yarn install
$ yarn run test
```

## Contributing

1.  Fork it
2.  Create your feature branch (`git checkout -b my-new-feature`)
3.  Commit your changes (`git commit -am 'Add some feature'`)
4.  Push to the branch (`git push origin my-new-feature`)
5.  Create new Pull Request

## LICENSE

MIT
