# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Renamed `localReplicaHostForSSL` parameter to `staticIpAddress` for better clarity and accuracy in describing its purpose
- Updated documentation to reflect the parameter name change
- Updated test cases to use the new parameter name

### Added

- Comprehensive documentation for SSL configuration and local development setup
- Detailed instructions for setting up static IP address on macOS
- Guide for installing and configuring mkcert for SSL certificates
- Instructions for installing root certificates on iOS and Android devices
- Configuration guide for local-ssl-proxy
- Step-by-step instructions for starting DFX and local-ssl-proxy servers
- Troubleshooting section for common issues

### Fixed

- Improved type safety in configuration options
- Enhanced error messages for local replica connection issues

## [0.1.0] - 2024-03-26

### Added

- Initial release
- Basic canister management functionality
- Support for local and mainnet environments
- URL management for canisters and Internet Identity
- Localhost subdomain support for Chrome
- TypeScript support
