# typedb-cti-ts

> Convert [type-cti](https://github.com/typedb-osi/typedb-cti) Python code to TypeScript. It's all based on type-cti

## typedb-cti

- Python > 3.6
- [TypeDB Core 2.10.0](https://vaticle.com/download#core)
- [TypeDB Python Client API 2.9.0](https://docs.vaticle.com/docs/client-api/python)
- [TypeDB Studio 2.10.0-alpha-4](https://vaticle.com/download#typedb-studio)

## ✨ typedb-cti-ts

- TypeScript 5.4.5
- [TypeDB Core 2.27.0](https://hub.docker.com/r/vaticle/typedb/tags)
- [TypeDB Driver 2.28.0-rc0](https://www.npmjs.com/package/typedb-driver)
- [TypeDB Studio 2.27.0](https://cloudsmith.io/~typedb/repos/public-release/packages/detail/raw/typedb-studio-mac-arm64/2.27.0/)

## 🚀 Quick Start

### Environment Variable

```dotenv
# TypeDB Configuration
TYPEDB_URI=
TYPEDB_DATABASE=

# MITRE ATT&CK Configuration
MITRE_ATTACK_VERSION=

# Parsing Configuration 
IGNORE_DEPRECATED= # Boolean
BATCH_SIZE= # number
```

### Install

```bash
$ git clone https://github.com/mackerel-10/typedb-cti-ts

$ npm install

# dev
$ npm run dev
```

### TypeDB Server
```bash
# up
$ docker compose up

# down
$ docker compose down
```


## 🪪 License

- [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
